import { Request, Response } from 'express';
import { ActivityService } from '../services/activityService';

const activityService = new ActivityService();

export const logActivity = async (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      distance,
      duration,
      calories,
      startTime,
      endTime,
      coordinates,
      avgSpeed,
      maxSpeed,
      elevation,
      description,
      weather,
      temperature,
      imageUrl
    } = req.body;

    const userId = req.headers['user-id'] as string;

    if (!userId || !type || !title || !distance || !duration || !startTime || !endTime || !coordinates) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, distance, duration, startTime, endTime, coordinates'
      });
    }

    if (!['running', 'walking', 'cycling', 'hiking'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid activity type. Must be: running, walking, cycling, hiking'
      });
    }

    const activity = await activityService.createActivity(
      userId,
      'user',
      type,
      title,
      distance,
      duration,
      calories || 0,
      new Date(startTime),
      new Date(endTime),
      coordinates,
      avgSpeed || 0,
      maxSpeed || 0,
      elevation || 0,
      description,
      weather,
      temperature
    );

    res.status(201).json({
      message: 'Activity logged successfully',
      activity
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const logActivityForUser = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { userId, username, type, title, distance, duration, calories, startTime, endTime, coordinates, avgSpeed, maxSpeed, elevation, description, weather, temperature, imageUrl } = req.body;

    if (!userId || !username || !type || !title || !distance || !duration || !startTime || !endTime || !coordinates) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const activity = await activityService.createActivity(
      userId,
      username,
      type,
      title,
      distance,
      duration,
      calories || 0,
      new Date(startTime),
      new Date(endTime),
      coordinates,
      avgSpeed || 0,
      maxSpeed || 0,
      elevation || 0,
      description,
      weather,
      temperature,
      imageUrl,
      adminId
    );

    res.status(201).json({
      message: 'Activity logged for user successfully',
      activity
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const activities = await activityService.getUserActivities(userId, limit);

    res.json({
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = await activityService.getUserActivities(userId, limit);

    res.json({
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await activityService.getUserStats(userId);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const stats = await activityService.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = await activityService.getAllActivities(limit);

    res.json({
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const stats = await activityService.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await activityService.getRecentActivities(days, limit);

    res.json({
      count: activities.length,
      days,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const activity = await activityService.getActivityById(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this activity' });
    }

    const updated = await activityService.updateActivity(id, req.body);
    res.json({
      message: 'Activity updated successfully',
      activity: updated
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const activity = await activityService.getActivityById(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this activity' });
    }

    const deleted = await activityService.deleteActivity(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
