const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');

// Rotas públicas
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

module.exports = router;