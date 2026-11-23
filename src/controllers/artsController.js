import { prisma } from '../utils/prisma.js';
import { deleteImage, uploadImages } from '../utils/supabase.js';

// Buscar Arts 
export const getArts = async (req, res) => {
  try {
    const arts = await prisma.art.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(arts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar Arts' });
  }
};
// Criar Art
export const createArt = async (req, res) => {
  try {
    const { title, content } = req.body;
    const files = req.files;
    const userId = req.userId;

    // 1. Validação do Título (Obrigatório)
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título é obrigatório.' });
    }
    // 3. Upload das imagens (fora de loops de validação)
    const images = await uploadImages(files, 'art', parseInt(userId));

    // 4. Criação da Artagem no Prisma
    await prisma.art.create({
      data: {
        title: title.trim(),
        content: content && content.trim() !== '' ? content.trim() : null,
        url: images,
        userId: parseInt(userId),
      },
    });

    // 5. ResArta enviada APENAS UMA VEZ ao final
    return res.status(201).json({
      message: 'Art criado com sucesso'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar Art' });
  }
};
// Buscar Art 
export const getArt = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await prisma.art.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!art) {
      return res.status(404).json({ error: 'Art não encontrado' });
    }

    return res.status(200).json(art);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar Art' });
  }
};
// Update Art 
export const updateArt = async (req, res) => {
  try {
    const { title, content, existingUrls } = req.body;
    const { id } = req.params;
    const userId = req.userId;
    const files = req.files;
    const art = await prisma.art.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });

    if (!art) {
      return res.status(404).json({ error: 'Art não encontrado' });
    }

    let images = [];
    if (files && files.length > 0 && existingUrls === undefined) {
      images = await uploadImages(files, 'art', parseInt(userId));
    }

    await prisma.art.update({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      data: {
        title: title === art.title ? art.title : title,
        content: content === art.content ? art.content : content,
        url: images.length > 0 ? images : art.url
      }
    });

    return res.status(200).json({ message: 'Art atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar Art' });
  }
};
// Deletar Art
export const deleteArt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const art = await prisma.art.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
    if (!art) {
      return res.status(404).json({ error: 'Art não encontrado' });
    }
    art.url.forEach(async (url) => {
      await deleteImage(url.split('/').slice(-1)[0]); // Deleta a imagem do Supabase
    });
    await prisma.art.delete({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
    return res.status(200).json({ message: 'Art deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao deletar Art' });
  }
};
