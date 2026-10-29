import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { construirEventoStripe } from "@/lib/integraciones/stripe";
import * as repo from "@/modelo/taquilla/taquilla.repository";
import {
  procesarPagoFallido,
  procesarPagoSesion,
  procesarReembolsoStripe,
  procesarSesionExpirada,
} from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook — Eventos de Stripe.
 * Se responde 200 rápido y se registra el evento para idempotencia. Si el
 * procesamiento falla, se responde 500 para que Stripe reintente (3 veces/24 h).
 */
export async function POST(request: NextRequestLike) {
  let evento: Stripe.Event;
  try {
    const payload = await request.text();
    const firma = request.headers.get("stripe-signature");
    evento = construirEventoStripe(payload, firma);
  } catch (e) {
    console.error("[Stripe webhook] firma inválida", e);
    return Response.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (await repo.eventoStripeExiste(evento.id)) {
    return Response.json({ received: true, duplicate: true });
  }

  let ordenId: number | null = null;

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const sesion = evento.data.object as Stripe.Checkout.Session;
        const orden = await procesarPagoSesion(sesion);
        ordenId = orden?.id_orden ?? null;
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const sesion = evento.data.object as Stripe.Checkout.Session;
        const orden = await procesarPagoSesion(sesion);
        ordenId = orden?.id_orden ?? null;
        break;
      }
      case "checkout.session.async_payment_failed": {
        const sesion = evento.data.object as Stripe.Checkout.Session;
        await procesarPagoFallido(sesion);
        break;
      }
      case "checkout.session.expired": {
        const sesion = evento.data.object as Stripe.Checkout.Session;
        await procesarSesionExpirada(sesion);
        break;
      }
      case "charge.refunded": {
        const cargo = evento.data.object as Stripe.Charge;
        if (cargo.amount_refunded >= cargo.amount && cargo.payment_intent) {
          const paymentIntent =
            typeof cargo.payment_intent === "string"
              ? cargo.payment_intent
              : cargo.payment_intent.id;
          const orden = await procesarReembolsoStripe(paymentIntent);
          ordenId = orden?.id_orden ?? null;
        }
        break;
      }
      default:
        break;
    }

    // Idempotencia: se registra al final, cuando el efecto ya se aplicó.
    await repo.registrarEventoStripe(
      evento.id,
      evento.type,
      ordenId,
      JSON.parse(JSON.stringify(evento)) as Prisma.InputJsonValue
    );

    return Response.json({ received: true });
  } catch (e) {
    console.error("[Stripe webhook] error procesando", evento.type, e);
    return Response.json({ error: "Error procesando el evento" }, { status: 500 });
  }
}

/** Tipo mínimo para no acoplar el route al tipo NextRequest en el build. */
type NextRequestLike = {
  text(): Promise<string>;
  headers: { get(name: string): string | null };
};
