import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { ordenParaCliente } from "@/lib/orden-cliente";
import { obtenerOrdenParaVer } from "@/modelo/taquilla/taquilla.service";

export const dynamic = "force-dynamic";

/** GET /api/ordenes/[codigo]?token=… — Estado y entradas de una orden. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const token = request.nextUrl.searchParams.get("token");
    const usuario = await usuarioActual();
    const orden = await obtenerOrdenParaVer(codigo, token, usuario);
    return ok(ordenParaCliente(orden));
  } catch (e) {
    return err(e);
  }
}
