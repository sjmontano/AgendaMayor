import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { getSesionDesdeCookies } from '@/lib/sesion';
import { obtenerUsuarioPorId } from '@/lib/auth';
import { actualizarMiPerfil } from '@/modelo/usuarios/usuario.service';
import { PerfilUpdateSchema } from '@/modelo/usuarios/usuario.dto';

/**
 * GET /api/perfil — Mi perfil (autenticado)
 */
export async function GET() {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    return ok(usuario);
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/perfil — Actualizar mi perfil (autenticado)
 */
export async function PATCH(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const body = await request.json();
    const datos = PerfilUpdateSchema.parse(body);
    const actualizado = await actualizarMiPerfil(Number(sesion.userId), datos);
    return ok(actualizado);
  } catch (e) {
    return err(e);
  }
}
