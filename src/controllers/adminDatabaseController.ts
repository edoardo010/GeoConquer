import { Request, Response } from 'express';
import { dataService } from '../services/dataService';
import fs from 'fs';
import path from 'path';

export const getDatabaseStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const stats = dataService.getDataStats();
    const dataPath = dataService.getDataPath();

    res.json({
      message: 'Database Statistics',
      storage: {
        path: dataPath,
        totalSize: stats.totalSize
      },
      collections: {
        users: stats.usersCount,
        activities: stats.activitiesCount,
        conquests: stats.conquestsCount,
        clans: stats.clansCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBackupList = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const backupDir = path.join(dataService.getDataPath(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({
        message: 'No backups found',
        backups: []
      });
    }

    const backups = fs.readdirSync(backupDir)
      .sort()
      .reverse();

    const backupInfo = backups.map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        created: stats.mtime
      };
    });

    res.json({
      message: 'Backup List',
      backups: backupInfo
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBackup = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const backupDir = path.join(dataService.getDataPath(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const files = ['users.json', 'activities.json', 'conquests.json', 'clans.json', 'territories.json', 'bans.json'];
    const dataPath = dataService.getDataPath();

    files.forEach(file => {
      const source = path.join(dataPath, file);
      const dest = path.join(backupDir, `${file}.${timestamp}`);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
      }
    });

    res.json({
      message: 'Backup created successfully',
      timestamp,
      backupPath: backupDir
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearAllData = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { confirm } = req.body;
    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({ 
        error: 'Must pass confirm=DELETE_ALL_DATA in body' 
      });
    }

    // Creare backup prima di eliminare
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(dataService.getDataPath(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = ['users.json', 'activities.json', 'conquests.json', 'clans.json', 'territories.json', 'bans.json'];
    const dataPath = dataService.getDataPath();

    // Backup
    files.forEach(file => {
      const source = path.join(dataPath, file);
      const dest = path.join(backupDir, `${file}.BEFORE_CLEAR.${timestamp}`);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
      }
    });

    // Delete
    files.forEach(file => {
      const filePath = path.join(dataPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({
      message: 'All data cleared successfully',
      backupCreated: `backup BEFORE_CLEAR.${timestamp}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDatabaseInfo = async (req: Request, res: Response) => {
  try {
    const adminId = req.headers['admin-id'] as string;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const stats = dataService.getDataStats();
    const dataPath = dataService.getDataPath();

    // Conteggio file nel backup
    const backupDir = path.join(dataPath, 'backups');
    let backupCount = 0;
    if (fs.existsSync(backupDir)) {
      backupCount = fs.readdirSync(backupDir).length;
    }

    res.json({
      message: 'Database Information',
      type: 'File-Based (JSON)',
      location: dataPath,
      lastUpdated: new Date().toISOString(),
      collections: {
        users: {
          count: stats.usersCount,
          file: 'users.json'
        },
        activities: {
          count: stats.activitiesCount,
          file: 'activities.json'
        },
        conquests: {
          count: stats.conquestsCount,
          file: 'conquests.json'
        },
        clans: {
          count: stats.clansCount,
          file: 'clans.json'
        }
      },
      storage: {
        totalSize: stats.totalSize,
        backupCount,
        backupLocation: backupDir
      },
      status: 'ACTIVE - All data persisted to local files'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
