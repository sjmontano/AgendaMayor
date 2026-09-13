import * as repo from './usuario.repository';
import { esCorreoInstitucional } from './usuario.dto';
import { badRequest, conflict, notFound } from '@/lib/errors';
import type { PerfilUpdateDTO, PerfilPublico } from './usuario.dto';

/**
 * Service de usuarios — lógica de negocio.
 * No conoce Supabase: solo usa el repository.
 */

export async function registrar(
  authId: string,
  email: string,
  datos: { username: string; nombre: string; apellido: string; facultad?: string; programa?: string; semestre?: number }
): Promise<repo.UsuarioRow> {
  if (!esCorreoInstitucional(email)) {
    throw badRequest('Solo se permiten correos @unimayor.edu.co');
  }

  if (await repo.existeUsername(datos.username)) {
    throw conflict(`El username "${datos.username}" ya está en uso`);
  }

  return repo.crear({
    authId,
    username: datos.username,
    nombre: datos.nombre,
    apellido: datos.apellido,
    correo: email,
    facultad: datos.facultad,
    programa: datos.programa,
    semestre: datos.semestre,
  });
}

export async function obtenerPerfilPublico(
  username: string
): Promise<PerfilPublico> {
  const usuario = await repo.buscarPorUsername(username);
  if (!usuario) throw notFound('Usuario no encontrado');

  return {
    username: usuario.username,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    facultad: usuario.facultad,
    programa: usuario.programa,
    semestre: usuario.semestre,
    semillero: usuario.semillero,
    bio: usuario.bio,
    avatar: usuario.avatar,
    rol: '',
  };
}

export async function actualizarMiPerfil(
  authId: string,
  datos: PerfilUpdateDTO
): Promise<repo.UsuarioRow> {
  const actual = await repo.buscarPorAuthId(authId);
  if (!actual) throw notFound('Usuario no encontrado');

  return repo.actualizarPerfil(authId, datos);
}
