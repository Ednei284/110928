import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, newPassword } = req.body;
    const user = await prisma.user.update({
      where: { email }
    });
    if (user.email === email) res.status(401).json({ error: 'Email ja casatrado.' })
    if (user.name === name) res.status(401).json({ error: 'Nome ja casatrado.' })
    const updatedData = {
      name,
      email,
      password: newPassword
    };
    if (newPassword) {
      updatedData.password = await bcrypt.hash(newPassword, 10);
    }
    if (user.password === await bcrypt.compare(updatedData.password, user.password)) res.status(401).json({ error: 'Nome ja casatrado.' })
    const newUser = await prisma.user.update({
      where: { id: req.userId },
      data: updatedData
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

