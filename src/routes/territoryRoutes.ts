import { Router } from 'express';
import {
  getMyConquests,
  getUserConquests,
  createTerritoryConquest
} from '../controllers/territoryController';

const router = Router();

router.post('/', createTerritoryConquest);
router.get('/my', getMyConquests);
router.get('/user/:userId', getUserConquests);

export default router;
