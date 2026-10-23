import { ok, err } from '@/lib/errors';
import { getSesionDesdeCookies } from '@/lib/sesion';
import { obtenerUsuarioPorId } from '@/lib/auth';
import * as proyectoService from '@/modelo/proyectos/proyecto.service';

/**
 * GET /api/proyectos/mios — Proyectos del usuario autenticado en cualquier estado
 * (BORRADOR, EN_REVISION, PUBLICADO, RECHAZADO). Alimenta el panel del estudiante.
 */
export async function GET() {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    return ok(await proyectoService.listarMios(usuario.id_usuario));
  } catch (e) {
    return err(e);
  }
}
