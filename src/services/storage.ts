import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

export async function uploadDishPhoto(localUri: string, userId: string): Promise<string> {
  // Determinar extensión
  const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
 
  // Leer el archivo como base64 con expo-file-system (funciona con rutas file:// en Android)
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
 
  // Convertir base64 a ArrayBuffer
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
 
  // Subir a Supabase Storage
  const { error } = await supabase.storage
    .from('dish-photos')
    .upload(fileName, bytes.buffer, {
      contentType,
      upsert: false,
    });
 
  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);
 
  // Retornar URL pública permanente
  const { data } = supabase.storage
    .from('dish-photos')
    .getPublicUrl(fileName);
 
  return data.publicUrl;
}