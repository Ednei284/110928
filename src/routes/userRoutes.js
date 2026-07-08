import express from 'express';
const router = express.Router();
import { authenticate } from '../middlewares/auth.js';
import { deleteUser, getProfile, updateProfile } from '../controllers/userController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

// Todas as rotas de usuário são privadas
router.use(authenticate);
router.use(privateLimiter);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteUser);

export default router;