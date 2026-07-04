const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword } = require('../utils/emailValidator');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validação de email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validação de senha
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número'
      });
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Gera token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Verifica tentativas de login
    const failedAttempts = await prisma.failedLoginAttempt.count({
      where: {
        email,
        ip,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
        }
      }
    });

    if (failedAttempts >= 5) {
      return res.status(429).json({
        error: 'Muitas tentativas. Tente novamente em 15 minutos'
      });
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Registra tentativa falha
      await prisma.failedLoginAttempt.create({
        data: { email, ip }
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await prisma.failedLoginAttempt.create({
        data: { email, ip }
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem sucedido - limpa tentativas
    await prisma.failedLoginAttempt.deleteMany({
      where: { email, ip }
    });

    // Gera token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const logout = async (req, res) => {
  // Como estamos usando JWT stateless, o logout é feito no cliente
  // Mas podemos implementar uma blacklist se necessário
  res.json({ message: 'Logout realizado com sucesso' });
};

module.exports = { register, login, logout };