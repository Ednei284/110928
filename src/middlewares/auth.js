import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';


export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(402).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error(error);
    return res.status(error.status).json({ error: 'Erro ao autenticar' });
  }
};


