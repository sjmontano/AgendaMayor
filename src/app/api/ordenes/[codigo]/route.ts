import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { verOrden } from "@/modelo/taquilla/taquilla.service";

/**
 * GET /api/ordenes/[codigo] — Estado de la orden (consulta a Bold si sigue pendiente).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await params;
    const usuario = await usuarioActual();
    return ok(await verOrden(codigo, usuario));
  } catch (e) {
    return err(e);
  }
}
