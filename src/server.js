import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiLimiter } from './middlewares/rateLimit.js';
import validateApiKey from './middlewares/validateApiKey.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postsRoutes from './routes/postsRoutes.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));
// Limite global de API
app.use('/api', validateApiKey);
app.use('/api', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postsRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toLocaleString('pt-BR') });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
