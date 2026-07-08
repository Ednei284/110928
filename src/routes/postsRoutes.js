import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  createPhoto,
  getPhotos,
  getPhotoById,
  deletePhoto
} from '../controllers/photoController';
import { privateLimiter } from '../middlewares/rateLimit';

const router = express.Router();

// Todas as rotas de foto são privadas
router.use(privateLimiter);

router.post('/', authenticate, createPhoto);
router.get('/', getPhotos);
router.get('/:id', getPhotoById);
router.patch('/:id', authenticate, getPhotoById);
router.delete('/:id', authenticate, deletePhoto);

export default router;
