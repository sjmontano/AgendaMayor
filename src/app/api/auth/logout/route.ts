import { ok, err } from "@/lib/errors";
import { cerrarSesion } from "@/lib/sesion";

/**
 * POST /api/auth/logout — Invalida la sesión eliminando la cookie.
 */
export async function POST() {
  try {
    await cerrarSesion();
    return ok({ message: "Sesión cerrada" });
  } catch (e) {
    return err(e);
  }
}
