import { NextRequest } from "next/server";
import { ok, err, unauthorized } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { ordenParaCliente } from "@/lib/orden-cliente";
import { reembolsarOrden } from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ordenes/[codigo]/reembolso — Reembolso total (organizador/ADMIN). */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const usuario = await usuarioActual();
    if (!usuario) throw unauthorized();
    const { codigo } = await params;
    const orden = await reembolsarOrden(codigo, usuario);
    return ok(ordenParaCliente(orden));
  } catch (e) {
    return err(e);
  }
}
