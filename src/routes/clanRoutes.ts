import express from 'express';
import {
  createClan,
  getClan,
  getClanByName,
  getAllClans,
  getClanLeaderboard,
  getUserClans,
  joinClan,
  leaveClan,
  getClanMembers,
  getClanMembersLeaderboard,
  deleteClan
} from '../controllers/clanController';

const router = express.Router();

router.post('/', createClan);
router.get('/', getAllClans);
router.get('/leaderboard', getClanLeaderboard);
router.get('/name/:name', getClanByName);
router.get('/:id', getClan);
router.get('/:id/members', getClanMembers);
router.get('/:id/members/leaderboard', getClanMembersLeaderboard);
router.post('/:id/join', joinClan);
router.post('/:id/leave', leaveClan);
router.delete('/:id', deleteClan);

router.get('/user/:userId', getUserClans);

export default router;
