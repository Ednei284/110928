import { PrismaClient } from '@prisma/client';
import { uploadPhoto, getPublicUrl } from '../utils/supabase';

const prisma = new PrismaClient();
// Criar Post
const createPost = async (req, res) => {
  try {
    // upload para supabase
    const fileName = await uploadPhoto(req.file);
    const publicUrl = getPublicUrl(fileName);

    const { title, content, isPublic } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        url: publicUrl, // agora vem do Supabase
        content: content || '',
        isPublic: isPublic === 'true',
        userId: req.userId
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
};


// Buscar todos os Posts do usuário
const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
};

// Buscar Post por ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
};

// Deletar Post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
};

module.exports = { createPost, getPosts, getPostById, deletePost };
