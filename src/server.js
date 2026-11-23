import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiLimiter } from './middlewares/rateLimit.js';
import validateApiKey from './middlewares/validateApiKey.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import artsRoutes from './routes/artsRoutes.js';
import postsRoutes from './routes/postsRoutes.js';
import { prisma } from './utils/prisma.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/web/data', async (req, res) => {
  const data = await prisma.art.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      createdAt: true,
    }
  });
  res.json({ data });
});
// Limite global de API
app.use('/api', validateApiKey);
app.use('/api', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/arts', artsRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toLocaleString('pt-BR') });
});
const HOST = '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando na porta http://${HOST}:${PORT}`);
});
