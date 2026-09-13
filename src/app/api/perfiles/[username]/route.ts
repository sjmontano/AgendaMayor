import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { obtenerPerfilPublico } from '@/modelo/usuarios/usuario.service';

/**
 * GET /api/perfiles/[username] — Perfil público de un usuario
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const perfil = await obtenerPerfilPublico(username);
    return ok(perfil);
  } catch (e) {
    return err(e);
  }
}
