import { prisma } from '../utils/prisma.js';


export const blacklistMiddleware = async (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const blacklist = await prisma.blacklistedIP.findMany({
    where: {
      blocked: true
    }
  });

  // Remove '::ffff:' se presente (IPv6 mapeado)
  const cleanIp = clientIp.replace('::ffff:', '');

  if (blacklist.some(ip => ip.ip === cleanIp)) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Seu IP está bloqueado'
    });
  }

  next();
}
