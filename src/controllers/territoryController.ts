import { Request, Response } from 'express';
import { TerritoryService } from '../services/territoryService';

const territoryService = new TerritoryService();

export const recordActivity = async (req: Request, res: Response) => {
  try {
    const { userId, route, duration } = req.body;

    if (!userId || !route || !Array.isArray(route) || route.length === 0) {
      return res.status(400).json({ error: 'Invalid activity data' });
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    const activity = await territoryService.recordActivity(userId, route, duration);
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getUserTerritories = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const territories = await territoryService.getUserTerritories(userId);
    res.json(territories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllTerritories = async (req: Request, res: Response) => {
  try {
    const territories = await territoryService.getAllTerritories();
    res.json(territories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTotalUserArea = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const totalArea = await territoryService.getTotalUserArea(userId);
    res.json({ userId, totalArea });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
