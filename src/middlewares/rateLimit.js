import rateLimit from 'express-rate-limit';
import { prisma } from '../utils/prisma.js';

// Limite para login
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Muitas tentativas de login. Tente novamente mais tarde.'
  },
  // Handler executado quando atinge o limite
  handler: async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;

    try {
      // Verifica se IP já existe
      const existingIP = await prisma.blacklistedIP.findUnique({
        where: { ip }
      });

      if (existingIP) {
        // Atualiza contagem e bloqueia
        await prisma.blacklistedIP.update({
          where: { ip },
          data: {
            attempts: { increment: 1 },
            blocked: true,
            blockedAt: new Date()
          }
        });
      } else {
        // Cria novo registro bloqueado
        await prisma.blacklistedIP.create({
          data: {
            ip,
            attempts: 1,
            blocked: true,
            blockedAt: new Date()
          }
        });
      }

      res.status(429).json({
        error: 'Muitas tentativas.'
      });

    } catch (error) {
      console.error('Erro ao bloquear IP:', error);
      res.status(500).json({
        error: 'Erro ao processar bloqueio'
      });
    }
  }
});

// Limite geral para API
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  handler: async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;

    try {
      // Verifica se IP já existe
      const existingIP = await prisma.blacklistedIP.findUnique({
        where: { ip }
      });

      if (existingIP) {
        // Atualiza contagem e bloqueia
        await prisma.blacklistedIP.update({
          where: { ip },
          data: {
            attempts: { increment: 1 },
            blocked: true,
            blockedAt: new Date()
          }
        });
      } else {
        // Cria novo registro bloqueado
        await prisma.blacklistedIP.create({
          data: {
            ip,
            attempts: 1,
            blocked: true,
            blockedAt: new Date()
          }
        });
      }

      res.status(429).json({
        error: 'Muitas tentativas.'
      });

    } catch (error) {
      console.error('Erro ao bloquear IP:', error);
      res.status(500).json({
        error: 'Erro ao processar bloqueio'
      });
    }
  }
});

// Limite para rotas privadas
export const privateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  handler: async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;

    try {
      // Verifica se IP já existe
      const existingIP = await prisma.blacklistedIP.findUnique({
        where: { ip }
      });

      if (existingIP) {
        // Atualiza contagem e bloqueia
        await prisma.blacklistedIP.update({
          where: { ip },
          data: {
            attempts: { increment: 1 },
            blocked: true,
            blockedAt: new Date()
          }
        });
      } else {
        // Cria novo registro bloqueado
        await prisma.blacklistedIP.create({
          data: {
            ip,
            attempts: 1,
            blocked: true,
            blockedAt: new Date()
          }
        });
      }

      res.status(429).json({
        error: 'Muitas tentativas.'
      });

    } catch (error) {
      console.error('Erro ao bloquear IP:', error);
      res.status(500).json({
        error: 'Erro ao processar bloqueio'
      });
    }
  }
});
