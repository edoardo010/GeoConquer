import express from 'express';
import {
  logActivity,
  logActivityForUser,
  getActivity,
  getUserActivities,
  getMyActivities,
  getUserStats,
  getMyStats,
  getAllActivities,
  getAdminStats,
  getRecentActivities,
  updateActivity,
  deleteActivity
} from '../controllers/activityController';

const router = express.Router();

// User endpoints
router.post('/', logActivity);
router.get('/my', getMyActivities);
router.get('/my/stats', getMyStats);
router.get('/user/:userId', getUserActivities);
router.get('/user/:userId/stats', getUserStats);
router.get('/record/:id', getActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

// Admin endpoints
router.post('/admin/log-for-user', logActivityForUser);
router.get('/admin/all', getAllActivities);
router.get('/admin/stats', getAdminStats);
router.get('/admin/recent', getRecentActivities);

export default router;
