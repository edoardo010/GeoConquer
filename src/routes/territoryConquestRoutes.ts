import express from 'express';
import {
  createTerritoryConquest,
  getConquestById,
  getUserConquests,
  getMyConquests,
  checkBanStatus,
  getPendingConquests,
  getFlaggedConquests,
  approveConquest,
  rejectConquest,
  getStats,
  getActiveBans,
  removeBan
} from '../controllers/territoryController';

const router = express.Router();

// User endpoints
router.post('/', createTerritoryConquest);
router.get('/my', getMyConquests);
router.get('/my/ban-status', checkBanStatus);
router.get('/user/:userId', getUserConquests);
router.get('/record/:id', getConquestById);

// Admin endpoints
router.get('/admin/pending', getPendingConquests);
router.get('/admin/flagged', getFlaggedConquests);
router.get('/admin/stats', getStats);
router.get('/admin/bans', getActiveBans);
router.delete('/admin/ban/:userId', removeBan);
router.post('/:id/approve', approveConquest);
router.post('/:id/reject', rejectConquest);

export default router;
