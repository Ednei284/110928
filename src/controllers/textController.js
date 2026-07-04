const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createText = async (req, res) => {
  try {
    const { title, content, isPublic = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const text = await prisma.text.create({
      data: {
        title,
        content,
        isPublic,
        userId: req.userId
      }
    });

    res.status(201).json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar texto' });
  }
};

const getTexts = async (req, res) => {
  try {
    const { public: isPublic } = req.query;

    const where = {};

    if (isPublic === 'true') {
      where.isPublic = true;
    } else if (isPublic === 'false') {
      where.isPublic = false;
      where.userId = req.userId;
    } else {
      // Busca textos públicos OU do usuário
      where.OR = [
        { isPublic: true },
        { userId: req.userId }
      ];
    }

    const texts = await prisma.text.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(texts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar textos' });
  }
};

const getTextById = async (req, res) => {
  try {
    const { id } = req.params;
    const text = await prisma.text.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { isPublic: true },
          { userId: req.userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!text) {
      return res.status(404).json({ error: 'Texto não encontrado' });
    }

    res.json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar texto' });
  }
};

const updateText = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublic } = req.body;

    const existingText = await prisma.text.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!existingText) {
      return res.status(404).json({ error: 'Texto não encontrado ou sem permissão' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const text = await prisma.text.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar texto' });
  }
};

const deleteText = async (req, res) => {
  try {
    const { id } = req.params;
    const text = await prisma.text.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!text) {
      return res.status(404).json({ error: 'Texto não encontrado ou sem permissão' });
    }

    await prisma.text.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Texto deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar texto' });
  }
};

module.exports = {
  createText,
  getTexts,
  getTextById,
  updateText,
  deleteText
};