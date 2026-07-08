import { PrismaClient } from '@prisma/client';
import { uploadPhotoOrThrow } from '../utils/supabase.js';

const prisma = new PrismaClient();
// Criar Post
export const createPost = async (req, res) => {
  try {
    // upload para supabase
    const { title, content } = req.body;
    const arquivos = req.files;
    const publicUrls = await uploadPhotoOrThrow(arquivos);

    // 1. Criamos uma lista dos campos que SÃO obrigatórios
    const requiredFields = { title, content, url: publicUrls };
    // 2. Verificamos se algum deles é nulo, undefined ou string vazia
    for (let field in requiredFields) {
      if (!requiredFields[field] || requiredFields[field] === "" || requiredFields[field] === undefined) {
        return res.status(401).json({
          error: `Todos os campos são obrigatórios.`
        });
      }
    }


    const post = await prisma.post.create({
      data: {
        title,
        url: publicUrls,
        content,
        userId: req.userId
      }
    });

    res.status(201).json({ message: 'Post criado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
};

// Buscar todos os Posts do usuário
export const getPosts = async (req, res) => {
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
export const getPostById = async (req, res) => {
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

export const updatePostById = async (req, res) => {
  try {
    const { id, content, title } = req.body;
    const arquivos = req.files;
    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    await prisma.post.upsert({
      where: {
        id: parseInt(id),
        userId: req.userId
      },
      data: {
        title,
        content,
        url: await uploadPhotoOrThrow(arquivos)
      }
    });

    res.json({ message: 'Post atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar post' });
  }
};
// Deletar Post
export const deletePost = async (req, res) => {
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

