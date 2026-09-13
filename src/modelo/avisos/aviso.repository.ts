import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Repository de avisos — patrón Repository (Fowler).
 */
export interface AvisoRow {
  id_aviso: number;
  titulo: string;
  texto: string;
  fecha: string;
  activo: boolean;
}

export async function listarActivos(): Promise<AvisoRow[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("aviso")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: false })
    .limit(3);
  if (error) throw error;
  return (data as AvisoRow[]) ?? [];
}
