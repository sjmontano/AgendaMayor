import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { iniciarPago } from "@/modelo/taquilla/taquilla.service";

/**
 * POST /api/ordenes/[codigo]/pago — Paso 2 de la compra: pide a Bold el link de pago.
 * Retorna { codigo, idLink, urlPago }.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await params;
    const usuario = await usuarioActual();
    return ok(await iniciarPago(codigo, usuario, request.nextUrl.origin), 201);
  } catch (e) {
    return err(e);
  }
}
