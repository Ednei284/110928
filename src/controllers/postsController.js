import { prisma } from '../utils/prisma.js';


// Criar Post
export const createPost = async (req, res) => {
  try {
    // upload para supabase
    const { title, content, publicUrls } = req.body;
    const userId = parseInt(req.userId)
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
        userId
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

// Update Post por ID
export const updatePostById = async (req, res) => {
  try {
    const { id, content, title, publicUrls } = req.body;
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
        userId: parseInt(req.userId)
      },
      data: {
        title,
        content,
        url: publicUrls
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

