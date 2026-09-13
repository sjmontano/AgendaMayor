import { getSupabaseServer } from '@/lib/supabase/server';
import { forbidden, unauthorized } from '@/lib/errors';

/**
 * Servicio de autorización.
 * Consulta el rol del usuario en la BD y aplica reglas de negocio.
 */

export type RolUsuario = 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN';

export interface UsuarioAuth {
  id_usuario: number;
  auth_id: string;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: number;
  nombre_rol: RolUsuario;
  facultad: string | null;
}

/**
 * Dado un auth_id de Supabase, retorna el usuario completo con su rol.
 * Lanza 401 si no existe en la tabla usuario.
 */
export async function obtenerUsuarioPorAuthId(authId: string): Promise<UsuarioAuth> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('usuario')
    .select('*, rol:rol!inner(nombre)')
    .eq('auth_id', authId)
    .single();

  if (error || !data) {
    throw unauthorized('Usuario no registrado en el sistema');
  }

  return {
    id_usuario: data.id_usuario,
    auth_id: data.auth_id,
    username: data.username,
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    rol: data.rol,
    nombre_rol: data.rol.nombre as RolUsuario,
    facultad: data.facultad,
  };
}

/**
 * Verifica que el usuario tenga el rol indicado.
 */
export function requiereRol(usuario: UsuarioAuth, ...roles: RolUsuario[]) {
  if (!roles.includes(usuario.nombre_rol)) {
    throw forbidden(`Requiere rol: ${roles.join(' o ')}`);
  }
}

/**
 * Verifica que un docente pueda avalar proyectos de una facultad.
 */
export function puedeAvalar(usuario: UsuarioAuth, facultadProyecto: string): void {
  requiereRol(usuario, 'DOCENTE', 'ADMIN');

  if (usuario.nombre_rol === 'DOCENTE' && usuario.facultad !== facultadProyecto) {
    throw forbidden('Solo puede avalar proyectos de su propia facultad');
  }
}
