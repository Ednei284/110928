import { generatePDFBuffer } from '../utils/generetePDFBuffer.js';
import { prisma } from '../utils/prisma.js';
import { deleteImage, uploadImages } from '../utils/supabase.js';

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
    const images = await uploadImages(files, 'photo', parseInt(userId));

    // 4. Criação da Postagem no Prisma
    await prisma.post.create({
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
    return res.status(500).json({ error: 'Erro ao criar post' });
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
    return res.status(500).json({ error: 'Erro ao buscar posts' });
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

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar post' });
  }
};

// Update Post por ID
export const updatePostById = async (req, res) => {
  try {
    const { title, content, existingUrls } = req.body;
    const { id } = req.params;
    const userId = req.userId;
    const files = req.files;
    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    let images = [];
    if (files && files.length > 0 && existingUrls === undefined) {
      images = await uploadImages(files, 'photo', parseInt(userId));
    }

    await prisma.post.update({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      data: {
        title: title === post.title ? post.title : title,
        content: content === post.content ? post.content : content,
        url: images.length > 0 ? images : post.url
      }
    });

    return res.status(200).json({ message: 'Post atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar post' });
  }
};

// Deletar Post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });


    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    post.url.forEach(async (url) => {
      await deleteImage(url.split('/').slice(-1)[0]); // Deleta a imagem do Supabase
    });

    return res.status(200).json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao deletar post' });
  }
};

export const generatePDF = async (req, res) => {
  try {

    // 1. Primeiro: Busque os dados no banco
    const posts = await prisma.post.findMany({
      where: {
        userId: parseInt(req.userId)
      },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Segundo: Valide se existem dados ANTES de alterar os headers de PDF
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: 'Nenhum post encontrado para este usuário.' });
    }

    // 3. Terceiro: Se passou pela validação, configure os headers para o PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=posts_${req.user.name || 'usuario'}.pdf`);

    // 4. Quarto: Gere o PDF e envie
    const pdfBuffer = await generatePDFBuffer(posts);
    // console.log('generatePdf-pdfBuffer', pdfBuffer);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
}
