import { prisma } from '../utils/prisma.js';
import { uploadImages } from '../utils/supabase.js';


// Criar Post
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const files = req.files;
    const userId = req.userId;

    // 1. Validação do Título (Obrigatório)
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título é obrigatório.' });
    }
    // 3. Upload das imagens (fora de loops de validação)
    const images = await uploadImages(files, 'photo');

    // 4. Criação da Postagem no Prisma
    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content && content.trim() !== '' ? content.trim() : null,
        url: images,
        userId: parseInt(userId),
      },
    });

    // 5. Resposta enviada APENAS UMA VEZ ao final
    return res.status(201).json({
      message: 'Post criado com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
};

// Buscar todos os Posts do usuário
export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
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

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
};

// Update Post por ID
export const updatePostById = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;
    const userId = parseInt(req.userId)
    const files = req.files;


    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    let images = [];
    if (files && files.length > 0) {
      images = await uploadImages(files, 'photo');

    }
    await prisma.post.update({
      where: {
        id: parseInt(id),
        userId: req.userId
      },
      data: {
        title,
        content,
        url: images
      }
    });

    res.status(200).json({ message: 'Post atualizado com sucesso' });
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

    res.status(200).json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
};

