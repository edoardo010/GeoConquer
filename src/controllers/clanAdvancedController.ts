import { Request, Response } from 'express';
import { clanService } from '../services/clanService';

// Ricerca clan
export const searchClans = async (req: Request, res: Response) => {
  try {
    const { query, sortBy } = req.query;
    const searchQuery = (query as string || '').toLowerCase();

    const allClans = await clanService.getAllClans();
    
    let filtered = allClans.filter(clan => 
      clan.name.toLowerCase().includes(searchQuery) ||
      clan.description.toLowerCase().includes(searchQuery)
    );

    // Ordinamento
    if (sortBy === 'members') {
      filtered.sort((a, b) => b.members.length - a.members.length);
    } else if (sortBy === 'level') {
      filtered.sort((a, b) => b.level - a.level);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered.sort((a, b) => b.experience - a.experience);
    }

    res.json({
      count: filtered.length,
      clans: filtered
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Visualizza dettagli clan
export const getClanDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clan = await clanService.getClan(id);

    if (!clan) {
      return res.status(404).json({ error: 'Clan non trovato' });
    }

    const members = await clanService.getClanMembers(id);

    res.json({
      clan,
      members,
      stats: {
        membersCount: members.length,
        totalArea: clan.totalArea,
        level: clan.level,
        experience: clan.experience
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Visualizza clan dell'utente
export const getUserClan = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const clan = await clanService.getUserClan(userId);
    
    if (!clan) {
      return res.json({ clan: null, message: 'Non fai parte di nessun clan' });
    }

    const members = await clanService.getClanMembers(clan.id);
    const userRole = members.find(m => m.userId === userId)?.role || 'member';

    res.json({
      clan,
      members,
      userRole
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Promuovi a officer
export const promoteMember = async (req: Request, res: Response) => {
  try {
    const { clanId, userId } = req.params;
    const adminId = req.headers['user-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const clan = await clanService.getClan(clanId);
    if (!clan) {
      return res.status(404).json({ error: 'Clan non trovato' });
    }

    // Controlla se è founder
    if (clan.founderId !== adminId) {
      return res.status(403).json({ error: 'Solo il founder può promuovere' });
    }

    const result = await clanService.promoteMember(clanId, userId);
    if (!result) {
      return res.status(400).json({ error: 'Impossibile promuovere' });
    }

    res.json({
      message: 'Membro promosso a officer',
      member: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rimuovi membro
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { clanId, userId } = req.params;
    const adminId = req.headers['user-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const clan = await clanService.getClan(clanId);
    if (!clan) {
      return res.status(404).json({ error: 'Clan non trovato' });
    }

    // Controlla permessi
    if (clan.founderId !== adminId) {
      return res.status(403).json({ error: 'Non hai permessi per rimuovere' });
    }

    await clanService.removeMemberFromClan(clanId, userId);

    res.json({
      message: 'Membro rimosso dal clan',
      clanId,
      userId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aggiorna impostazioni clan
export const updateClanSettings = async (req: Request, res: Response) => {
  try {
    const { clanId } = req.params;
    const { name, description, icon } = req.body;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const clan = await clanService.getClan(clanId);
    if (!clan) {
      return res.status(404).json({ error: 'Clan non trovato' });
    }

    // Solo founder può modificare
    if (clan.founderId !== userId) {
      return res.status(403).json({ error: 'Solo il founder può modificare' });
    }

    if (name) clan.name = name;
    if (description) clan.description = description;
    clan.updatedAt = new Date();

    await clanService.saveClan(clan);

    res.json({
      message: 'Impostazioni aggiornate',
      clan
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Classifica globale clan
export const getClanLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const allClans = await clanService.getAllClans();

    const sorted = allClans
      .sort((a, b) => b.experience - a.experience)
      .slice(0, parseInt(limit as string) || 10)
      .map((clan, idx) => ({
        ...clan,
        rank: idx + 1
      }));

    res.json({
      count: sorted.length,
      leaderboard: sorted
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
