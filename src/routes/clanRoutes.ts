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
import {
  searchClans,
  getClanDetails,
  getUserClan,
  promoteMember,
  removeMember,
  updateClanSettings,
  getClanLeaderboard as getGlobalClanLeaderboard
} from '../controllers/clanAdvancedController';

const router = express.Router();

router.post('/', createClan);
router.get('/', getAllClans);
router.get('/leaderboard', getClanLeaderboard);
router.get('/global/leaderboard', getGlobalClanLeaderboard);
router.get('/search/clans', searchClans);
router.get('/name/:name', getClanByName);
router.get('/user/myclan', getUserClan);
router.get('/details/:id', getClanDetails);
router.get('/:id', getClan);
router.get('/:id/members', getClanMembers);
router.get('/:id/members/leaderboard', getClanMembersLeaderboard);
router.post('/:id/join', joinClan);
router.post('/:id/leave', leaveClan);
router.post('/:clanId/promote/:userId', promoteMember);
router.delete('/:clanId/remove/:userId', removeMember);
router.put('/:clanId/settings', updateClanSettings);
router.delete('/:id', deleteClan);

router.get('/user/:userId', getUserClans);

export default router;
