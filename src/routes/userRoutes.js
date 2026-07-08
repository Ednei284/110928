import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.use(authenticate);
router.use(privateLimiter);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;