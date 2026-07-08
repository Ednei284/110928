import express from 'express';
import cors from 'cors';
import { apiLimiter } from './middlewares/rateLimit.js';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postsRoutes from './routes/postsRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limite global de API
app.use('/api', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postsRoutes);

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toLocaleString('pt-BR') });
});

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

export default app;