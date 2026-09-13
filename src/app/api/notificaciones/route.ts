import { NextRequest } from "next/server";
import { ok, err, badRequest } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/supabase/sesion";
import { obtenerUsuarioPorAuthId } from "@/lib/auth";
import { listarPorUsuario, marcarLeida } from "@/modelo/notificaciones/notificacion.repository";

/**
 * GET /api/notificaciones — Solo las del usuario autenticado (HU-10).
 */
export async function GET() {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    return ok(await listarPorUsuario(usuario.id_usuario));
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/notificaciones — { id } marca como leída (solo la propia).
 */
export async function PATCH(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    const body = await request.json();
    if (typeof body?.id !== "number") throw badRequest("Se requiere id numérico");
    await marcarLeida(body.id, usuario.id_usuario);
    return ok({ message: "Marcada como leída" });
  } catch (e) {
    return err(e);
  }
}
