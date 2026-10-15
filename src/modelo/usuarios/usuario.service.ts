import * as repo from "./usuario.repository";
import { esCorreoInstitucional } from "./usuario.dto";
import { badRequest, conflict, notFound, unauthorized } from "@/lib/errors";
import { hashPassword, verificarPassword } from "@/lib/password";
import type { PerfilUpdateDTO, PerfilPublico, RegistroDTO } from "./usuario.dto";

/**
 * Service de usuarios — lógica de negocio.
 * No conoce la BD: solo usa el repository.
 */

export async function registrar(datos: RegistroDTO): Promise<repo.UsuarioRow> {
  const email = datos.email.toLowerCase().trim();

  if (!esCorreoInstitucional(email)) {
    throw badRequest("Solo se permiten correos @unimayor.edu.co");
  }

  if (await repo.existeUsername(datos.username)) {
    throw conflict(`El username "${datos.username}" ya está en uso`);
  }

  if (await repo.existeCorreo(email)) {
    throw conflict("Ya existe una cuenta con ese correo");
  }

  const contrasenaHash = await hashPassword(datos.password);

  return repo.crear({
    username: datos.username,
    nombre: datos.nombre,
    apellido: datos.apellido,
    correo: email,
    contrasenaHash,
    facultad: datos.facultad,
    programa: datos.programa,
    semestre: datos.semestre,
  });
}

/**
 * Valida credenciales y devuelve el usuario (sin el hash).
 * Mensaje genérico ante credenciales inválidas (HU-02).
 */
export async function iniciarSesion(email: string, password: string): Promise<repo.UsuarioRow> {
  const usuario = await repo.buscarPorCorreoConHash(email.toLowerCase().trim());
  if (!usuario) throw unauthorized("Correo o contraseña incorrectos");

  const valida = await verificarPassword(password, usuario.contrasena_hash);
  if (!valida) throw unauthorized("Correo o contraseña incorrectos");

  const publico: repo.UsuarioRow = {
    id_usuario: usuario.id_usuario,
    username: usuario.username,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    rol: usuario.rol,
    facultad: usuario.facultad,
    programa: usuario.programa,
    semestre: usuario.semestre,
    semillero: usuario.semillero,
    bio: usuario.bio,
    avatar: usuario.avatar,
    estado: usuario.estado,
  };
  return publico;
}

export async function obtenerPerfilPublico(username: string): Promise<PerfilPublico> {
  const usuario = await repo.buscarPorUsername(username);
  if (!usuario) throw notFound("Usuario no encontrado");

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
    rol: "",
  };
}

export async function actualizarMiPerfil(
  idUsuario: number,
  datos: PerfilUpdateDTO
): Promise<repo.UsuarioRow> {
  const actual = await repo.buscarPorId(idUsuario);
  if (!actual) throw notFound("Usuario no encontrado");

  return repo.actualizarPerfil(idUsuario, datos);
}
