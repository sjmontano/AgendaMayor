import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { listarMios } from "@/modelo/proyectos/proyecto.service";

/**
 * GET /api/proyectos/mios — Proyectos del usuario autenticado (cualquier estado).
 */
export async function GET() {
  try {
    const usuario = await usuarioActual();
    return ok(await listarMios(usuario.id_usuario));
  } catch (e) {
    return err(e);
  }
}
