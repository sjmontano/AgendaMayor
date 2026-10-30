import { NextRequest } from "next/server";
import { ok, err, badRequest } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/sesion";
import { obtenerUsuarioPorId } from "@/lib/auth";
import { listarPorUsuario, marcarLeida, marcarTodasLeidas } from "@/modelo/notificaciones/notificacion.repository";

/**
 * GET /api/notificaciones — Solo las del usuario autenticado (HU-10).
 */
export async function GET() {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    return ok(await listarPorUsuario(usuario.id_usuario));
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/notificaciones — { id } marca una como leída; { todas: true } marca todas.
 */
export async function PATCH(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    const body = await request.json();
    if (body?.todas === true) {
      await marcarTodasLeidas(usuario.id_usuario);
      return ok({ message: "Todas marcadas como leídas" });
    }
    if (typeof body?.id !== "number") throw badRequest("Se requiere id numérico");
    await marcarLeida(body.id, usuario.id_usuario);
    return ok({ message: "Marcada como leída" });
  } catch (e) {
    return err(e);
  }
}
