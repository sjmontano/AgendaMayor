import { getSupabaseServer } from './server';
import { internal, badRequest } from '@/lib/errors';

/**
 * Adapter de Storage.
 * Desacopla Supabase Storage del dominio — patrón Adapter (GoF).
 */

const BUCKETS = {
  avatares: 'avatares',
  proyectos: 'proyectos',
  eventos: 'eventos',
} as const;

type Bucket = keyof typeof BUCKETS;

/**
 * Sube un archivo a un bucket de Supabase Storage.
 * Retorna la URL pública del archivo.
 */
export async function subirArchivo(
  bucket: Bucket,
  carpeta: string,
  nombreArchivo: string,
  archivo: ArrayBuffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseServer();
  const ruta = `${carpeta}/${nombreArchivo}`;

  const { error } = await supabase.storage
    .from(BUCKETS[bucket])
    .upload(ruta, archivo, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw internal(`Error subiendo archivo: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(ruta);

  return urlData.publicUrl;
}

/**
 * Elimina un archivo de un bucket.
 */
export async function eliminarArchivo(bucket: Bucket, ruta: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.storage.from(BUCKETS[bucket]).remove([ruta]);
  if (error) {
    throw internal(`Error eliminando archivo: ${error.message}`);
  }
}
