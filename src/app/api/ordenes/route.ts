import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { CompraSchema } from "@/modelo/taquilla/taquilla.dto";
import { crearOrden } from "@/modelo/taquilla/taquilla.service";

/**
 * POST /api/ordenes — Paso 1 de la compra: crea la orden PENDIENTE con el carrito.
 * Body: { eventoId, items: [{ tipoEntradaId, cantidad }] }
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await usuarioActual();
    const datos = CompraSchema.parse(await request.json());
    return ok(await crearOrden(datos, usuario), 201);
  } catch (e) {
    return err(e);
  }
}
