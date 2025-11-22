import { Request, Response } from 'express';
import { territoryService } from '../services/territoryService';
import { antiCheatService } from '../services/antiCheatService';

export const createTerritoryConquest = async (req: Request, res: Response) => {
  try {
    const {
      points,
      durationMinutes,
      startLat,
      startLon,
      endLat,
      endLon
    } = req.body;

    const userId = req.headers['user-id'] as string;

    if (!userId || !durationMinutes) {
      return res.status(400).json({
        error: 'Missing required fields: points (array of 4 points), durationMinutes'
      });
    }

    if (durationMinutes < 1 || durationMinutes > 600) {
      return res.status(400).json({
        error: 'Durata deve essere tra 1 e 600 minuti'
      });
    }

    // Supporta sia il nuovo formato (4 punti) che il vecchio (start/end per backward compatibility)
    let finalPoints = points;
    if (!points && startLat !== undefined && startLon !== undefined && endLat !== undefined && endLon !== undefined) {
      finalPoints = [
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon },
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon }
      ];
    }

    if (!finalPoints || finalPoints.length !== 4) {
      return res.status(400).json({
        error: 'Devi fornire esattamente 4 punti per definire il territorio'
      });
    }

    const result = await territoryService.createTerritoryConquest(
      userId,
      'player',
      finalPoints[0].latitude,
      finalPoints[0].longitude,
      finalPoints[2].latitude,
      finalPoints[2].longitude,
      durationMinutes,
      finalPoints
    );

    if (!result.success) {
      if (result.banned) {
        return res.status(403).json({
          error: result.error,
          banned: true,
          banTimeRemaining: result.banTimeRemaining
        });
      }
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      message: 'Conquista creata e inviata per approvazione',
      conquest: result.conquest
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getConquestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conquest = await territoryService.getConquestById(id);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquista non trovata' });
    }

    res.json(conquest);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserConquests = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const conquests = await territoryService.getUserConquests(userId);

    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyConquests = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const conquests = await territoryService.getUserConquests(userId);

    // Controlla se utente è bannato
    const banInfo = antiCheatService.getBanInfo(userId);

    res.json({
      count: conquests.length,
      conquests,
      banned: banInfo ? true : false,
      banInfo
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkBanStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const banInfo = antiCheatService.getBanInfo(userId);
    const timeRemaining = antiCheatService.getBanTimeRemaining(userId);

    res.json({
      banned: banInfo ? true : false,
      banInfo,
      timeRemaining // in secondi
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingConquests = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const conquests = await territoryService.getPendingConquests();

    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFlaggedConquests = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const conquests = await territoryService.getFlaggedConquests();

    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveConquest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.headers['admin-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const conquest = await territoryService.approveConquest(id, adminId);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquista non trovata' });
    }

    res.json({
      message: 'Conquista approvata',
      conquest
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const rejectConquest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.headers['admin-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Motivo del rifiuto obbligatorio' });
    }

    const conquest = await territoryService.rejectConquest(id, adminId, reason);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquista non trovata' });
    }

    res.json({
      message: 'Conquista rifiutata',
      conquest
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const stats = await territoryService.getStats();
    const activeBans = antiCheatService.getActiveBans();

    res.json({
      ...stats,
      activeBans: activeBans.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActiveBans = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const bans = antiCheatService.getActiveBans();

    res.json({
      count: bans.length,
      bans
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeBan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req.headers['admin-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const removed = antiCheatService.removeBan(userId);

    if (!removed) {
      return res.status(404).json({ error: 'Ban non trovato' });
    }

    res.json({
      message: 'Ban rimosso',
      userId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
