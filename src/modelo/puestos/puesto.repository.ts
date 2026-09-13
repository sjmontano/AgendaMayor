import { getSupabaseServer } from '@/lib/supabase/server';
import type { PuestoCreateDTO, PuestoUpdateDTO } from './puesto.dto';

/**
 * Repository de puestos — patrón Repository (Fowler).
 * Cada puesto pertenece a un evento y puede ser ocupado por un proyecto.
 */

export interface PuestoRow {
  id_puesto: number;
  codigo: string;
  edificio: string;
  piso: number;
  salon: string;
  ubicacion: string;
  estado: string;
  evento_id: number;
  proyecto_id: number | null;
}

export async function listar(): Promise<PuestoRow[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .select('*')
    .order('codigo', { ascending: true });

  if (error) throw error;
  return (data as PuestoRow[]) ?? [];
}

export async function listarPorEvento(eventoId: number): Promise<PuestoRow[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .select('*')
    .eq('evento_id', eventoId)
    .order('codigo', { ascending: true });

  if (error) throw error;
  return (data as PuestoRow[]) ?? [];
}

export async function buscarPorProyecto(proyectoId: number): Promise<PuestoRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .select('*')
    .eq('proyecto_id', proyectoId)
    .maybeSingle();

  if (error) throw error;
  return (data as PuestoRow | null) ?? null;
}

export async function buscarPorId(id: number): Promise<PuestoRow | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .select('*')
    .eq('id_puesto', id)
    .single();

  if (error) return null;
  return data as PuestoRow;
}

export async function crear(datos: PuestoCreateDTO): Promise<PuestoRow> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .insert({
      codigo: datos.codigo,
      edificio: datos.edificio,
      piso: datos.piso,
      salon: datos.salon,
      ubicacion: datos.ubicacion,
      evento_id: datos.eventoId,
      proyecto_id: datos.proyectoId ?? null,
      estado: datos.proyectoId ? 'OCUPADO' : 'DISPONIBLE',
    })
    .select()
    .single();

  if (error) throw error;
  return data as PuestoRow;
}

export async function actualizar(id: number, datos: PuestoUpdateDTO): Promise<PuestoRow> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('puesto')
    .update(datos)
    .eq('id_puesto', id)
    .select()
    .single();

  if (error) throw error;
  return data as PuestoRow;
}

export async function eliminar(id: number): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from('puesto').delete().eq('id_puesto', id);
  if (error) throw error;
}
