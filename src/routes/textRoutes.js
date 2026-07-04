const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  createText,
  getTexts,
  getTextById,
  updateText,
  deleteText
} = require('../controllers/textController');
const { privateLimiter } = require('../middlewares/rateLimit');

// Rotas públicas (GET com filtro público)
router.get('/', getTexts);
router.get('/:id', getTextById);

// Rotas privadas (CRUD completo)
router.use(authenticate);
router.use(privateLimiter);

router.post('/', createText);
router.put('/:id', updateText);
router.delete('/:id', deleteText);

module.exports = router;