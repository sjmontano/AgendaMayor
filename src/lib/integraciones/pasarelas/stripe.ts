import { crearSesionCheckout, obtenerSesionStripe, stripeConfigurado } from "@/lib/integraciones/stripe";
import { internal } from "@/lib/errors";
import type { CrearPagoInput, PagoConsultado, PagoCreado, Pasarela } from "./tipos";

/**
 * Stripe — adaptador de la integración existente (lib/integraciones/stripe.ts).
 * Su confirmación principal es el webhook firmado; consultarPago sirve de
 * respaldo cuando el comprador vuelve antes que el webhook.
 */
export const stripe: Pasarela = {
  id: "STRIPE",
  nombre: "Stripe",
  metodos: ["Tarjeta crédito/débito internacional"],

  configurada: stripeConfigurado,

  async crearPago({ orden, baseUrl, token, minutos }: CrearPagoInput): Promise<PagoCreado> {
    const sesion = await crearSesionCheckout({ baseUrl, orden, token, minutos });
    if (!sesion.url) throw internal("Stripe no devolvió la URL de pago");
    return { url: sesion.url, referencia: sesion.id };
  },

  async consultarPago({ pasarela_referencia }): Promise<PagoConsultado> {
    if (!pasarela_referencia) return { estado: "PENDIENTE", transaccionId: null, metodo: null };
    const sesion = await obtenerSesionStripe(pasarela_referencia);
    const pi = typeof sesion.payment_intent === "string" ? sesion.payment_intent : sesion.payment_intent?.id ?? null;
    if (sesion.payment_status === "paid") return { estado: "APROBADO", transaccionId: pi, metodo: "card" };
    if (sesion.status === "expired") return { estado: "EXPIRADO", transaccionId: pi, metodo: null };
    return { estado: "PENDIENTE", transaccionId: pi, metodo: null };
  },
};
