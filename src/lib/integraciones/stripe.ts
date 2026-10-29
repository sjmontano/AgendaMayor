import Stripe from "stripe";
import { badRequest, serviceUnavailable } from "@/lib/errors";
import type { OrdenDetalleRow } from "@/modelo/taquilla/taquilla.repository";

/**
 * Integración Stripe — Checkout alojado (no tocamos datos de tarjeta).
 * El monto siempre sale de la base de datos, nunca del cliente.
 */
let cliente: Stripe | null = null;

export function stripeConfigurado() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) {
    throw serviceUnavailable(
      "Stripe no está configurado. Agrega STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET al .env y reinicia el servidor."
    );
  }
  cliente ??= new Stripe(clave, { maxNetworkRetries: 2 });
  return cliente;
}

export function monedaStripe() {
  return (process.env.STRIPE_CURRENCY ?? "cop").toLowerCase();
}

export interface SesionCheckoutInput {
  baseUrl: string;
  orden: OrdenDetalleRow;
  token: string;
  /** Minutos de vigencia de la sesión (Stripe exige ≥ 30). */
  minutos?: number;
}

export async function crearSesionCheckout({
  baseUrl,
  orden,
  token,
  minutos = 30,
}: SesionCheckoutInput): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const base = baseUrl.replace(/\/+$/, "");
  const currency = monedaStripe();
  const cantidadTotal = orden.items.reduce((s, i) => s + i.cantidad, 0);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = orden.items.map((item) => ({
    quantity: item.cantidad,
    price_data: {
      currency,
      unit_amount: item.precio_unitario_centavos,
      product_data: {
        name: item.tipo_entrada.nombre,
        description: `${orden.evento.titulo} · ${cantidadTotal} ${cantidadTotal === 1 ? "entrada" : "entradas"}`,
      },
    },
  }));

  // Stripe exige >= 30 min. Sumamos un minuto para que el reloj de red no
  // convierta la sesión en inválida antes de que Stripe la reciba.
  const expira = Math.floor(Date.now() / 1000) + Math.max(31, minutos) * 60;

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      locale: "es",
      allowed_payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: orden.correo_comprador,
      client_reference_id: orden.codigo,
      metadata: {
        orden: orden.codigo,
        evento: String(orden.evento_id),
        orden_id: String(orden.id_orden),
      },
      payment_intent_data: {
        metadata: { orden: orden.codigo, orden_id: String(orden.id_orden) },
        description: `Agenda Mayor · ${orden.evento.titulo}`,
      },
      success_url: `${base}/checkout/resultado?orden=${encodeURIComponent(orden.codigo)}&token=${encodeURIComponent(token)}`,
      cancel_url: `${base}/eventos/${orden.evento_id}?pago=cancelado`,
      expires_at: expira,
      allow_promotion_codes: false,
    },
    { idempotencyKey: `checkout-${orden.codigo}` }
  );
}

export function construirEventoStripe(payload: string, firma: string | null): Stripe.Event {
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) {
    throw serviceUnavailable("Falta STRIPE_WEBHOOK_SECRET para verificar el webhook");
  }
  if (!firma) throw badRequest("Webhook sin firma de Stripe");
  try {
    return getStripe().webhooks.constructEvent(payload, firma, secreto);
  } catch (e) {
    throw badRequest(`Firma de webhook inválida: ${e instanceof Error ? e.message : "error"}`);
  }
}

export async function obtenerSesionStripe(sessionId: string): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export async function reembolsarPago(
  paymentIntentId: string,
  montoCentavos?: number
): Promise<Stripe.Refund> {
  return getStripe().refunds.create(
    {
      payment_intent: paymentIntentId,
      ...(montoCentavos ? { amount: montoCentavos } : {}),
      reason: "requested_by_customer",
    },
    { idempotencyKey: `refund-${paymentIntentId}` }
  );
}
