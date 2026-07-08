import rateLimit from 'express-rate-limit';

// Limite para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  keyGenerator: (req) => {
    return req.body.email + req.ip;
  }
});

// Limite geral para API
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  }
});

// Limite para rotas privadas
export const privateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  }
});
