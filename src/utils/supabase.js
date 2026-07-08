import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // use a service role ou anon key conforme o caso
);

export const uploadPhotoOrThrow = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = 'webp';
    const fileName = `${Date.now()}-${file.originalname.split('.')[0]}.${fileExt}`;

    const buffer = await sharp(file.buffer)
      .resize(300, 300, { fit: 'inside' })
      .toFormat(fileExt)
      .toBuffer();
    const { error } = await supabase.storage
      .from('photos')
      .upload(fileName, buffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);
    return publicUrl;
  })
  // Executa todos os uploads simultaneamente
  const urls = await Promise.all(uploadPromises);
  return urls; // Retorna um array com as URLs das imagens
};



