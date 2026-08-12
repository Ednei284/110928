import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SECRET_KEY_SUPABASE;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @param {Array} files - Array de arquivos vindo do req.files
 * @param {string} userId - ID do vendedor
 * @param {string} produtoId - ID ou UUID do produto gerado pelo seu banco
 */
export async function uploadImages(files, folder, userId) {


  const uploadPromises = files.map(async (file) => {
    const fileExt = 'webp';

    const filePath = folder === "photo" ? `${folder}/${userId}img_${Date.now()}.${fileExt}` : `${folder}/${userId}img_${Date.now()}.${fileExt}`;
    const largura = folder === 'photo' ? 300 : 300;
    const altura = folder === 'photo' ? 300 : 300;
    const optimizedBuffer = await sharp(file.buffer)
      .resize(largura, altura) // Redimensiona
      .webp({ quality: 80 }) // Comprime
      .toBuffer();

    const { error } = await supabase.storage
      .from('photo')
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photo')
      .getPublicUrl(filePath);
    return publicUrl;
  });

  // Executa todos os uploads simultaneamente
  const urls = await Promise.all(uploadPromises);
  return urls; // Retorna um array com as URLs das imagens
}