import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
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

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

export const updateProfileEmailName = async (req, res) => {
  try {

    const { name, email } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    const updatedData = {
      name: name !== undefined || '' ? name : user.name,
      email: email !== undefined || '' ? email : user.email
    };

    await prisma.user.update({
      where: { id: 1 },
      data: updatedData
    });

    return res.status(200).json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const updateProfilePassword = async (req, res) => {
  try {
    console.log(req.body);
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    const updatedData = {
      password: newPassword
    };
    if (newPassword) {
      updatedData.password = await bcrypt.hash(newPassword, 10);
    }
    let equalsPassword = await bcrypt.compare(updatedData.password, user.password)
    if (user.password === equalsPassword) return res.status(401).json({ error: 'Nome ja casatrado.' })
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updatedData
    });

    return res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

