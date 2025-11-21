import { Router } from 'express';
import {
  createUser,
  getUser,
  getAllUsers,
  getUserStats,
  getLeaderboard
} from '../controllers/userController';

const router = Router();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);

export default router;
