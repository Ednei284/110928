import express from 'express';

import { authenticate } from '../middlewares/auth.js';
import {
  createArt,
  getArts,
  getArt,
  updateArt,
  deleteArt
} from '../controllers/artsController.js';
import { privateLimiter } from '../middlewares/rateLimit.js';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: '50mb' });

const router = express.Router();
router.get('/', getArts);
router.use(privateLimiter);
router.get('/:id', authenticate, getArt);
router.delete('/:id', authenticate, deleteArt);
router.post('/', authenticate, upload.array('files', 1), createArt);
router.patch('/:id', authenticate, upload.array('files', 1), updateArt);

export default router;
