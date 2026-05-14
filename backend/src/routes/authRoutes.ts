import express from 'express';
import { login, changePassword, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
router.post('/login', login);
router.post('/change-password', authenticateToken, changePassword);
router.get('/me', authenticateToken, getMe);
export default router;
