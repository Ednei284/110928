import express from 'express';
import { validateCode, login, logout } from '../controllers/authController.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
const router = express.Router();

// Rotas públicas
router.post('/validate-code', validateCode);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

export default router;