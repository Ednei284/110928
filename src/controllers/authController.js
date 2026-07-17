import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { transporter } from '../utils/serviceEmail.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const cleanIP = ip.replace('::ffff:', '');
    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Verifica tentativas de login
    const failedAttempts = await prisma.failedLoginAttempt.count({
      where: {
        email,
        ip: cleanIP,
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
        data: { email, ip: cleanIP }
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await prisma.failedLoginAttempt.create({
        data: { email, ip: cleanIP }
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem sucedido - limpa tentativas
    await prisma.failedLoginAttempt.deleteMany({
      where: { email, ip: cleanIP }
    });

    // Gera código de verificação
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Armazena o código no banco de dados com expiração de 5 minutos
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
      }
    });

    await transporter.sendMail({
      from: 'Administration',
      to: email,
      subject: "Verification code",
      html: `<h1>Olá, ${user.name}!</h1>
             <p>Seu código de verificação é: <b>${code}</b></p>
             <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
             <p>Este código expira em 5 minutos.</p>
             <p>Atenciosamente,</p>
             <p>Equipe Administration</p>
             `
    });

    res.status(200).json({
      user: {
        id: user.id,
      }
    });

    setTimeout(async () => {
      await prisma.verificationCode.deleteMany({
        where: {
          userId: user.id,

        }
      });
    }, 5 * 60 * 1000); // 5 minutos

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const validateCode = async (req, res) => {
  try {
    const { id, code } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    // Verifica se o código é válido
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code
      }
    });
    if (!code || !user || !validCode) {
      return res.status(400).json({ error: 'Código de verificação é obrigatório' });
    }
    // Gera token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { token }
    })
    // Retorna o token e o nome do usuário
    res.status(200).json({
      user: {
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao validar código' });
  }
};

export const logout = async (req, res) => {
  try {
    const id = req.userId;
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    await prisma.user.delete({
      where: { token: user.token }
    });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }

};
