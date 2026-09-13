import { getSupabaseServer } from '@/lib/supabase/server';
import { notFound } from '@/lib/errors';
import type { PerfilUpdateDTO } from './usuario.dto';

/**
 * Repository de usuarios — patrón Repository (Fowler).
 * Aísla el acceso a BD (Supabase) de la lógica de negocio.
 */

export interface UsuarioRow {
  id_usuario: number;
  auth_id: string;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: number;
  facultad: string | null;
  programa: string | null;
  semestre: number | null;
  semillero: string | null;
  bio: string | null;
  avatar: string | null;
  estado: boolean;
}

export interface UsuarioConRol extends UsuarioRow {
  rol_info: { nombre: string } | null;
}

export async function buscarPorAuthId(authId: string): Promise<UsuarioRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error) return null;
  return data as UsuarioRow;
}

export async function buscarPorUsername(username: string): Promise<UsuarioRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('username', username)
    .eq('estado', true)
    .single();

  if (error) return null;
  return data as UsuarioRow;
}

export async function crear(datos: {
  authId: string;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  facultad?: string;
  programa?: string;
  semestre?: number;
  rol?: number;
}): Promise<UsuarioRow> {
  const supabase = getSupabaseServer();

  // Si no se especifica rol, buscar ESTUDIANTE
  let rolId = datos.rol;
  if (!rolId) {
    const { data: rol } = await supabase
      .from('rol')
      .select('id_rol')
      .eq('nombre', 'ESTUDIANTE')
      .single();
    rolId = rol?.id_rol ?? 1;
  }

  const { data, error } = await supabase
    .from('usuario')
    .insert({
      auth_id: datos.authId,
      username: datos.username,
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      rol: rolId,
      facultad: datos.facultad ?? null,
      programa: datos.programa ?? null,
      semestre: datos.semestre ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as UsuarioRow;
}

export async function actualizarPerfil(
  authId: string,
  datos: PerfilUpdateDTO
): Promise<UsuarioRow> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('usuario')
    .update(datos)
    .eq('auth_id', authId)
    .select()
    .single();

  if (error) throw error;
  return data as UsuarioRow;
}

export async function existeUsername(username: string): Promise<boolean> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from('usuario')
    .select('*', { count: 'exact', head: true })
    .eq('username', username);
  return (count ?? 0) > 0;
}
