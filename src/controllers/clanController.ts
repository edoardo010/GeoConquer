import { Request, Response } from 'express';
import { ClanService } from '../services/clanService';
import { UserService } from '../services/userService';

const clanService = new ClanService();
const userService = new UserService();

export const createClan = async (req: Request, res: Response) => {
  try {
    const { name, description, avatar, banner } = req.body;
    const userId = req.headers['user-id'] as string;

    if (!name || !description) {
      return res.status(400).json({
        error: 'Name and description are required'
      });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({
        error: 'Clan name must be between 3 and 50 characters'
      });
    }

    const clan = await clanService.createClan(name, description, userId, avatar, banner);

    res.status(201).json({
      message: 'Clan created successfully',
      clan
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getClan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clan = await clanService.getClan(id);

    if (!clan) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    const stats = await clanService.getClanStats(id);
    res.json({ clan, stats });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClanByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const clan = await clanService.getClanByName(name);

    if (!clan) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    const stats = await clanService.getClanStats(clan.id);
    res.json({ clan, stats });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllClans = async (req: Request, res: Response) => {
  try {
    const clans = await clanService.getAllClans();
    const leaderboard = await Promise.all(
      clans.map(async clan => ({
        ...clan,
        stats: await clanService.getClanStats(clan.id)
      }))
    );

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClanLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = clanService.getGlobalLeaderboard(100);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserClans = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const clans = await clanService.getUserClans(userId);
    res.json(clans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinClan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const clan = await clanService.joinClan(id, userId);

    res.json({
      message: 'Successfully joined clan',
      clan
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const leaveClan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    await clanService.leaveClan(id, userId);

    res.json({
      message: 'Successfully left clan'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getClanMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const members = await clanService.getClanMembers(id);

    const membersWithDetails = await Promise.all(
      members.map(async member => ({
        ...member,
        user: await userService.getUser(member.userId)
      }))
    );

    res.json(membersWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    await clanService.deleteClan(id, userId);

    res.json({
      message: 'Clan deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getClanMembersLeaderboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leaderboard = await clanService.getClanLeaderboard(id);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
