import { Router } from 'express';
import {
  recordActivity,
  getUserTerritories,
  getAllTerritories,
  getTotalUserArea
} from '../controllers/territoryController';

const router = Router();

router.post('/activity', recordActivity);
router.get('/', getAllTerritories);
router.get('/user/:userId', getUserTerritories);
router.get('/user/:userId/area', getTotalUserArea);

export default router;
