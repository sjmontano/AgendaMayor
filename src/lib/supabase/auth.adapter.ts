import { getSesionDesdeCookies } from './sesion';

/**
 * Adapter de autenticación.
 * Desacopla Supabase Auth del dominio — patrón Adapter (GoF).
 * Lee la sesión de las cookies que el middleware refresca (ver sesion.ts).
 */

export interface SesionActual {
  userId: string;
  email: string;
}

/**
 * Obtiene la sesión del usuario actual.
 * Lanza ApiError 401 si no hay sesión.
 */
export async function getSesionActual(): Promise<SesionActual> {
  return getSesionDesdeCookies();
}
