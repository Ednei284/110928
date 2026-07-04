const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  createPhoto,
  getPhotos,
  getPhotoById,
  deletePhoto
} = require('../controllers/photoController');
const { privateLimiter } = require('../middlewares/rateLimit');

// Todas as rotas de foto são privadas
router.use(authenticate);
router.use(privateLimiter);

router.post('/', createPhoto);
router.get('/', getPhotos);
router.get('/:id', getPhotoById);
router.delete('/:id', deletePhoto);

module.exports = router;
