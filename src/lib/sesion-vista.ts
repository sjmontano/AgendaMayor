import { getSesionOpcional } from "@/lib/sesion";
import { obtenerUsuarioPorId, type UsuarioAuth } from "@/lib/auth";

/**
 * Usuario de la sesión actual para Server Components (layout, páginas).
 * Lee la cookie y la BD directamente: el self-fetch HTTP a /api/perfil
 * falla en Vercel y añade una ida y vuelta innecesaria.
 */
export async function usuarioActual(): Promise<UsuarioAuth | null> {
  const sesion = await getSesionOpcional();
  if (!sesion) return null;
  try {
    return await obtenerUsuarioPorId(Number(sesion.userId));
  } catch {
    return null;
  }
}
