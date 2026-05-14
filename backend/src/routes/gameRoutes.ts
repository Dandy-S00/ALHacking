import express from 'express';
import { handleVault, logGameResult } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
router.use(authenticateToken);
router.post('/vault', handleVault);
router.post('/result', logGameResult);
export default router;
