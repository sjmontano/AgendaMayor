import { NextRequest } from "next/server";
import { ok, err, badRequest } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/supabase/sesion";
import { obtenerUsuarioPorAuthId, requiereRol } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/admin/proyectos?estado= — Cola de moderación.
 * ADMIN ve todo; DOCENTE solo su facultad.
 */
export async function GET(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    requiereRol(usuario, "ADMIN", "DOCENTE");

    const estado = new URL(request.url).searchParams.get("estado") ?? "EN_REVISION";
    if (!["BORRADOR", "EN_REVISION", "PUBLICADO", "RECHAZADO"].includes(estado)) {
      throw badRequest("Estado inválido");
    }

    const supabase = getSupabaseServer();
    let query = supabase
      .from("proyecto")
      .select("*, autor:usuario!inner(username, nombre, apellido)")
      .eq("estado", estado)
      .order("fecha_registro", { ascending: false });

    if (usuario.nombre_rol === "DOCENTE" && usuario.facultad) {
      query = query.eq("facultad", usuario.facultad);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return err(e);
  }
}
