import express from 'express';
import { authenticate, isPublic } from '../middlewares/auth.js';
import {
  createPost,
  getPosts,
  getPostById,
  deletePost
} from '../controllers/postsController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

// Todas as rotas de foto são privadas
router.use(privateLimiter);

router.post('/', authenticate, createPost);
router.get('/', isPublic, getPosts);
router.get('/:id', getPostById);
router.patch('/:id', authenticate, getPostById);
router.delete('/:id', authenticate, deletePost);

export default router;
