import express from 'express';
import {
  createConquestRecord,
  getPendingConquests,
  getAllConquests,
  getUserConquests,
  getConquestById,
  approveConquest,
  rejectConquest,
  getConquestStats,
  getConquestsByStatus
} from '../controllers/conquestController';

const router = express.Router();

// User endpoints
router.post('/', createConquestRecord);
router.get('/user/:userId', getUserConquests);
router.get('/record/:id', getConquestById);

// Admin endpoints
router.get('/admin/pending', getPendingConquests);
router.get('/admin/all', getAllConquests);
router.get('/admin/stats', getConquestStats);
router.get('/admin/status/:status', getConquestsByStatus);
router.post('/:id/approve', approveConquest);
router.post('/:id/reject', rejectConquest);

export default router;
