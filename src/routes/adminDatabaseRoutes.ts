import express from 'express';
import {
  getDatabaseStats,
  getBackupList,
  createBackup,
  clearAllData,
  getDatabaseInfo
} from '../controllers/adminDatabaseController';

const router = express.Router();

router.get('/stats', getDatabaseStats);
router.get('/info', getDatabaseInfo);
router.get('/backups', getBackupList);
router.post('/backup', createBackup);
router.post('/clear', clearAllData);

export default router;
