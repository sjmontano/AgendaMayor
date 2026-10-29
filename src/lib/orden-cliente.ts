import type { OrdenDetalleRow } from "@/modelo/taquilla/taquilla.repository";

/**
 * Recorta datos internos de Stripe y oculta el enlace privado hasta que la
 * orden esté pagada. Se usa en las respuestas JSON y en las vistas.
 */
export function ordenParaCliente(orden: OrdenDetalleRow) {
  const { stripe_session_id, stripe_payment_intent_id, pasarela_referencia, ...resto } = orden;
  void stripe_session_id;
  void stripe_payment_intent_id;
  void pasarela_referencia;
  return {
    ...resto,
    evento: {
      ...resto.evento,
      url_acceso_privado:
        resto.estado === "PAGADA" && resto.evento.estado !== "CANCELADO"
          ? resto.evento.url_acceso_privado
          : null,
    },
  };
}

export type OrdenCliente = ReturnType<typeof ordenParaCliente>;
