import express from 'express';
const router = express.Router();
import { authenticate } from '../middlewares/auth';
import { getProfile, updateProfile, deleteUser } from '../controllers/userController';
import { privateLimiter } from '../middlewares/rateLimit';

// Todas as rotas de usuário são privadas
router.use(authenticate);
router.use(privateLimiter);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteUser);

export default router;