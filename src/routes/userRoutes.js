const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getProfile, updateProfile, deleteUser } = require('../controllers/userController');
const { privateLimiter } = require('../middlewares/rateLimit');

// Todas as rotas de usuário são privadas
router.use(authenticate);
router.use(privateLimiter);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteUser);

module.exports = router;