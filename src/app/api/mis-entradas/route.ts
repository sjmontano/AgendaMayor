import { ok, err, unauthorized } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { ordenParaCliente } from "@/lib/orden-cliente";
import { listarMisEntradas } from "@/modelo/taquilla/taquilla.service";

export const dynamic = "force-dynamic";

/** GET /api/mis-entradas — Órdenes y entradas del usuario autenticado. */
export async function GET() {
  try {
    const usuario = await usuarioActual();
    if (!usuario) throw unauthorized();
    const ordenes = await listarMisEntradas(usuario);
    return ok(ordenes.map(ordenParaCliente));
  } catch (e) {
    return err(e);
  }
}
