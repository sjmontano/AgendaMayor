import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { CheckoutSchema } from "@/modelo/taquilla/taquilla.dto";
import { crearCheckout } from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function origenPublico(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const proto =
    request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  return `${proto}://${host}`;
}

/**
 * POST /api/checkout — Reserva cupo y crea la sesión de Stripe Checkout.
 * Acepta compradores invitados (no exige sesión).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const datos = CheckoutSchema.parse(body);
    const usuario = await usuarioActual();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;

    const resultado = await crearCheckout(datos, usuario, ip, origenPublico(request));

    return ok(
      {
        url: resultado.url,
        gratis: resultado.gratis,
        codigo: resultado.orden.codigo,
        total_centavos: resultado.orden.total_centavos,
      },
      201
    );
  } catch (e) {
    return err(e);
  }
}
