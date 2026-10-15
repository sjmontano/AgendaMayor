import { NextRequest } from "next/server";
import { ok, err, badRequest } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/sesion";
import { obtenerUsuarioPorId, requiereRol } from "@/lib/auth";
import { listarPorEstado } from "@/modelo/proyectos/proyecto.repository";

/**
 * GET /api/admin/proyectos?estado= — Cola de moderación.
 * ADMIN ve todo; DOCENTE solo su facultad.
 */
export async function GET(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    requiereRol(usuario, "ADMIN", "DOCENTE");

    const estado = new URL(request.url).searchParams.get("estado") ?? "EN_REVISION";
    if (!["BORRADOR", "EN_REVISION", "PUBLICADO", "RECHAZADO"].includes(estado)) {
      throw badRequest("Estado inválido");
    }

    const facultad = usuario.nombre_rol === "DOCENTE" ? usuario.facultad : null;
    return ok(await listarPorEstado(estado, facultad));
  } catch (e) {
    return err(e);
  }
}
