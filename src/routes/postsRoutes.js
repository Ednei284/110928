import express from 'express';
import multer from 'multer';

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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Todas as rotas de foto são privadas
router.use(privateLimiter);


router.get('/', getPosts);
router.post('/', authenticate, upload.array('files', 3), createPost);

router.get('/:id', authenticate, getPostById);
router.delete('/:id', authenticate, deletePost);
router.patch('/:id', authenticate, upload.array('files', 3), updatePostById);


export default router;
