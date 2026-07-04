const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePassword } = require('../utils/emailValidator');

const prisma = new PrismaClient();

const getProfile = async (req, res) => {
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

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;

    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: req.userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      updateData.email = email;
    }

    if (password) {
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: 'Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número'
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.userId }
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

module.exports = { getProfile, updateProfile, deleteUser };