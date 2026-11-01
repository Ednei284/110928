import express from 'express';

import { authenticate } from '../middlewares/auth.js';
import {
  createPost,
  getPosts,
  getPostById,
  updatePostById,
  deletePost,
  generatePdf
} from '../controllers/postsController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: '50mb' });

const router = express.Router();
router.get('/', getPosts);
router.use(privateLimiter);
router.get('/generate-pdf', authenticate, generatePdf);
router.get('/:id', authenticate, getPostById);
router.delete('/:id', authenticate, deletePost);
router.post('/', authenticate, upload.array('files', 3), createPost);
router.patch('/:id', authenticate, upload.array('files', 3), updatePostById);

export default router;
