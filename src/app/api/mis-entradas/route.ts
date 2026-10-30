import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { misEntradas } from "@/modelo/taquilla/taquilla.service";

/**
 * GET /api/mis-entradas — Entradas compradas por el usuario autenticado.
 */
export async function GET() {
  try {
    const usuario = await usuarioActual();
    return ok(await misEntradas(usuario));
  } catch (e) {
    return err(e);
  }
}
