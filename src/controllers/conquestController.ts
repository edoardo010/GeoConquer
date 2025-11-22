import { Request, Response } from 'express';
import { ConquestService } from '../services/conquestService';

const conquestService = new ConquestService();

export const createConquestRecord = async (req: Request, res: Response) => {
  try {
    const { territoryName, coordinates, area, distance, description, evidenceUrl } = req.body;
    const userId = req.headers['user-id'] as string;

    if (!userId || !territoryName || !coordinates || !area || !distance || !description) {
      return res.status(400).json({
        error: 'Missing required fields: userId, territoryName, coordinates, area, distance, description'
      });
    }

    const conquest = await conquestService.createConquestRecord(
      userId,
      'player', // username will be set from headers
      territoryName,
      coordinates,
      area,
      distance,
      description,
      evidenceUrl
    );

    res.status(201).json({
      message: 'Conquest record created and pending approval',
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

export const getPendingConquests = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const conquests = await conquestService.getPendingConquests();
    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllConquests = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const conquests = await conquestService.getAllConquests(limit);
    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserConquests = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const conquests = await conquestService.getUserConquests(userId);
    res.json({
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConquestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conquest = await conquestService.getConquestById(id);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquest not found' });
    }

    res.json(conquest);
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

    const conquest = await conquestService.approveConquest(id, adminId);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquest not found' });
    }

    res.json({
      message: 'Conquest approved successfully',
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
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const conquest = await conquestService.rejectConquest(id, adminId, reason);

    if (!conquest) {
      return res.status(404).json({ error: 'Conquest not found' });
    }

    res.json({
      message: 'Conquest rejected successfully',
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

export const getConquestStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const stats = await conquestService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConquestsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const adminId = req.headers['admin-id'] as string;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
    }

    const conquests = await conquestService.getConquestsByStatus(status as any);
    res.json({
      status,
      count: conquests.length,
      conquests
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
