import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  createPost,
  getPosts,
  getPostById,
  updatePostById,
  deletePost
} from '../controllers/postsController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

// Todas as rotas de foto são privadas
router.use(privateLimiter);

router.get('/', getPosts);
router.post('/', authenticate, createPost);
router.get('/:id', authenticate, getPostById);
router.delete('/:id', authenticate, deletePost);
router.patch('/:id', authenticate, updatePostById);

export default router;
