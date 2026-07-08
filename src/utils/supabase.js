import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // use a service role ou anon key conforme o caso
);

export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  return fileName;
};
export const getPublicUrl = (fileName) => {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};
