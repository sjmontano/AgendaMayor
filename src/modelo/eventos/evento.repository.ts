import { getSupabaseServer } from "@/lib/supabase/server";
import type { EventoQueryDTO } from "./evento.dto";

/**
 * Repository de eventos — patrón Repository (Fowler).
 * Solo lectura pública de activos (la creación vive en admin).
 */
export interface EventoRow {
  id_evento: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  es_virtual: boolean;
  url_virtual: string | null;
  facultad: string | null;
  edicion: string | null;
  imagen: string | null;
  activo: boolean;
}

export async function listarActivos(
  filtros: EventoQueryDTO
): Promise<{ data: EventoRow[]; total: number }> {
  const supabase = getSupabaseServer();
  const from = (filtros.page - 1) * filtros.limit;
  const to = from + filtros.limit - 1;

  const { data, error, count } = await supabase
    .from("evento")
    .select("*", { count: "exact" })
    .eq("activo", true)
    .order("fecha_inicio", { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { data: (data as EventoRow[]) ?? [], total: count ?? 0 };
}

export interface EventoCrear {
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  es_virtual: boolean;
  url_virtual: string | null;
  facultad: string | null;
  edicion: string | null;
  imagen: string | null;
  autor_id: number;
}

export async function crear(datos: EventoCrear) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("evento")
    .insert({ ...datos, activo: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}
