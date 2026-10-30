import { forbidden, unauthorized } from "@/lib/errors";
import { getSesionDesdeCookies, getSesionOpcional } from "@/lib/sesion";
import { buscarConRol } from "@/modelo/usuarios/usuario.repository";

/**
 * Servicio de autorización.
 * Obtiene el usuario de la sesión (a través del Repository de usuarios)
 * y aplica las reglas de rol.
 */

export type RolUsuario = "ESTUDIANTE" | "DOCENTE" | "ADMIN";

export interface UsuarioAuth {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: number;
  nombre_rol: RolUsuario;
  facultad: string | null;
}

/**
 * Dado el id_usuario, retorna el usuario con su rol.
 * Lanza 401 si no existe o está desactivado.
 */
export async function obtenerUsuarioPorId(id: number): Promise<UsuarioAuth> {
  const data = await buscarConRol(id);

  if (!data || !data.estado) {
    throw unauthorized("Usuario no registrado o desactivado");
  }

  return {
    id_usuario: data.id_usuario,
    username: data.username,
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    rol: data.rol,
    nombre_rol: data.rolRef.nombre as RolUsuario,
    facultad: data.facultad,
  };
}

/** Usuario de la sesión actual. Lanza 401 si no hay sesión. */
export async function usuarioActual(): Promise<UsuarioAuth> {
  const sesion = await getSesionDesdeCookies();
  return obtenerUsuarioPorId(Number(sesion.userId));
}

/** Igual que usuarioActual, pero retorna null si no hay sesión (para las páginas). */
export async function usuarioActualOpcional(): Promise<UsuarioAuth | null> {
  const sesion = await getSesionOpcional();
  if (!sesion) return null;
  try {
    return await obtenerUsuarioPorId(Number(sesion.userId));
  } catch {
    return null;
  }
}

/**
 * Verifica que el usuario tenga el rol indicado.
 */
export function requiereRol(usuario: UsuarioAuth, ...roles: RolUsuario[]) {
  if (!roles.includes(usuario.nombre_rol)) {
    throw forbidden(`Requiere rol: ${roles.join(" o ")}`);
  }
}

/**
 * Verifica que un docente pueda avalar proyectos de una facultad.
 */
export function puedeAvalar(usuario: UsuarioAuth, facultadProyecto: string): void {
  requiereRol(usuario, "DOCENTE", "ADMIN");

  if (usuario.nombre_rol === "DOCENTE" && usuario.facultad !== facultadProyecto) {
    throw forbidden("Solo puede avalar proyectos de su propia facultad");
  }
}
