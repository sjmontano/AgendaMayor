import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { CompraSchema } from "@/modelo/taquilla/taquilla.dto";
import { comprar } from "@/modelo/taquilla/taquilla.service";

/**
 * POST /api/checkout — Crea la orden con el carrito y retorna la URL de pago de Bold.
 * Body: { eventoId, items: [{ tipoEntradaId, cantidad }] }
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await usuarioActual();
    const datos = CompraSchema.parse(await request.json());
    return ok(await comprar(datos, usuario, request.nextUrl.origin), 201);
  } catch (e) {
    return err(e);
  }
}
