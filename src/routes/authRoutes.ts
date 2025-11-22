import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  getPasswordRequirements,
  getUsernameRequirements
} from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/verify', verifyToken);
router.get('/password-requirements', getPasswordRequirements);
router.get('/username-requirements', getUsernameRequirements);

export default router;
