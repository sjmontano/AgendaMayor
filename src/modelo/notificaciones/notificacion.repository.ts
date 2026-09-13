import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Repository de notificaciones — patrón Repository.
 * El Service notifica sin conocer Supabase.
 */
export async function crear(
  usuarioId: number,
  mensaje: string,
  proyectoId: number
): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("notificacion").insert({
    mensaje,
    usuario_id: usuarioId,
    proyecto_id: proyectoId,
  });
  if (error) throw error;
}

export interface NotificacionRow {
  id_notificacion: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  proyecto_id: number | null;
}

export async function listarPorUsuario(usuarioId: number): Promise<NotificacionRow[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("notificacion")
    .select("id_notificacion, mensaje, fecha, leida, proyecto_id")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data as NotificacionRow[]) ?? [];
}

export async function marcarLeida(id: number, usuarioId: number): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("notificacion")
    .update({ leida: true })
    .eq("id_notificacion", id)
    .eq("usuario_id", usuarioId);
  if (error) throw error;
}
