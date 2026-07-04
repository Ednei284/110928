const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas'));
  }
}).single('photo');

const createPhoto = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma foto enviada' });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
      }

      const photo = await prisma.photo.create({
        data: {
          title,
          url: `/uploads/${req.file.filename}`,
          userId: req.userId
        }
      });

      res.status(201).json(photo);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar foto' });
  }
};

const getPhotos = async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
};

const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    res.json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar foto' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    await prisma.photo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Foto deletada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar foto' });
  }
};

module.exports = { createPhoto, getPhotos, getPhotoById, deletePhoto };