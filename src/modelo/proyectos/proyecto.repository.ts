import { getSupabaseServer } from '@/lib/supabase/server';
import { notFound } from '@/lib/errors';
import type { ProyectoCreateDTO, ProyectoUpdateDTO, ProyectoQueryDTO } from './proyecto.dto';

/**
 * Repository de proyectos — patrón Repository (Fowler).
 * Aísla Supabase de la lógica de negocio.
 */

export interface ProyectoRow {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  fotos: string[];
  facultad: string;
  programa: string;
  tipo: string;
  estado: string;
  evento_origen_id: number | null;
  docente_aval_id: number | null;
  motivo_rechazo: string | null;
  autor_id: number;
  destacado: boolean;
  fecha_registro: string;
  // Join
  autor?: { username: string; nombre: string; apellido: string; avatar: string | null } | null;
}

export async function listarPublicados(filtros: ProyectoQueryDTO): Promise<{ data: ProyectoRow[]; total: number }> {
  const supabase = getSupabaseServer();
  let query = supabase
    .from('proyecto')
    .select('*, autor:usuario!inner(username, nombre, apellido, avatar)', { count: 'exact' })
    .eq('estado', 'PUBLICADO')
    .order('fecha_registro', { ascending: false });

  if (filtros.facultad) query = query.eq('facultad', filtros.facultad);
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
  if (filtros.q) {
    query = query.or(`titulo.ilike.%${filtros.q}%,descripcion.ilike.%${filtros.q}%`);
  }
  if (filtros.autor) query = query.eq('autor.username', filtros.autor);

  const from = (filtros.page - 1) * filtros.limit;
  const to = from + filtros.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: (data as ProyectoRow[]) ?? [], total: count ?? 0 };
}

export async function buscarPorId(id: number): Promise<ProyectoRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('proyecto')
    .select('*, autor:usuario!inner(username, nombre, apellido, avatar)')
    .eq('id_proyecto', id)
    .single();

  if (error) return null;
  return data as ProyectoRow;
}

export async function crear(datos: ProyectoCreateDTO, autorId: number): Promise<ProyectoRow> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('proyecto')
    .insert({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      facultad: datos.facultad,
      programa: datos.programa,
      tipo: datos.tipo,
      fotos: JSON.stringify(datos.fotos),
      evento_origen_id: datos.eventoOrigenId ?? null,
      autor_id: autorId,
      estado: 'EN_REVISION',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProyectoRow;
}

export async function actualizar(
  id: number,
  datos: ProyectoUpdateDTO
): Promise<ProyectoRow> {
  const supabase = getSupabaseServer();

  const updatePayload: Record<string, unknown> = {};
  if (datos.titulo !== undefined) updatePayload.titulo = datos.titulo;
  if (datos.descripcion !== undefined) updatePayload.descripcion = datos.descripcion;
  if (datos.facultad !== undefined) updatePayload.facultad = datos.facultad;
  if (datos.programa !== undefined) updatePayload.programa = datos.programa;
  if (datos.tipo !== undefined) updatePayload.tipo = datos.tipo;
  if (datos.fotos !== undefined) updatePayload.fotos = JSON.stringify(datos.fotos);
  if (datos.destacado !== undefined) updatePayload.destacado = datos.destacado;
  if (datos.estado !== undefined) updatePayload.estado = datos.estado;
  if (datos.motivoRechazo !== undefined) updatePayload.motivo_rechazo = datos.motivoRechazo;

  const { data, error } = await supabase
    .from('proyecto')
    .update(updatePayload)
    .eq('id_proyecto', id)
    .select()
    .single();

  if (error) throw error;
  return data as ProyectoRow;
}

export async function contarPorAutor(autorId: number): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from('proyecto')
    .select('*', { count: 'exact', head: true })
    .eq('autor_id', autorId);
  return count ?? 0;
}
