import { Router } from 'express';
import {
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  completeChallenge,
  getUserChallenges,
  getAllChallenges
} from '../controllers/challengeController';

const router = Router();

router.post('/', createChallenge);
router.get('/', getAllChallenges);
router.get('/user/:userId', getUserChallenges);
router.post('/:id/accept', acceptChallenge);
router.post('/:id/reject', rejectChallenge);
router.post('/:id/complete', completeChallenge);

export default router;
