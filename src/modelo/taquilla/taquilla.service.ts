import type Stripe from "stripe";
import { badRequest, conflict, forbidden, internal, notFound, serviceUnavailable } from "@/lib/errors";
import { hashToken, codigoPublico, tokenSeguro } from "@/lib/codigos";
import { fechaHoraLarga } from "@/lib/utils";
import type { UsuarioAuth } from "@/lib/auth";
import { crearSesionCheckout, reembolsarPago, stripeConfigurado } from "@/lib/integraciones/stripe";
import { obtenerPorId } from "@/modelo/eventos/evento.repository";
import { puedeGestionarEvento } from "@/modelo/eventos/evento.service";
import type { CheckoutDTO } from "./taquilla.dto";
import * as repo from "./taquilla.repository";

/**
 * Service de taquilla — reglas de compra, pago y validación.
 * El cliente nunca decide el precio: se lee de TipoEntrada.
 */
export type ResultadoCheckout = {
  orden: repo.OrdenDetalleRow;
  gratis: boolean;
  url: string;
};

export async function crearCheckout(
  datos: CheckoutDTO,
  usuario: UsuarioAuth | null,
  ip: string | null,
  baseUrl: string
): Promise<ResultadoCheckout> {
  const evento = await obtenerPorId(datos.eventoId);
  if (!evento) throw notFound("Evento no encontrado");
  if (!evento.activo || evento.estado !== "PUBLICADO") {
    throw badRequest("El evento no está disponible para compra");
  }

  const ahora = new Date();
  if (new Date(evento.fecha_fin) < ahora) throw badRequest("El evento ya terminó");
  if (evento.venta_inicio && ahora < new Date(evento.venta_inicio)) {
    throw badRequest(`La venta abre el ${fechaHoraLarga(evento.venta_inicio)}`);
  }
  if (evento.venta_fin && ahora > new Date(evento.venta_fin)) {
    throw badRequest("La venta de entradas ya cerró");
  }

  const tipo = evento.tipos_entrada.find(
    (t) => t.id_tipo_entrada === datos.tipoEntradaId && t.activo
  );
  if (!tipo) throw notFound("Tipo de entrada no encontrado");

  const maxPorCompra = Math.min(evento.max_por_compra > 0 ? evento.max_por_compra : 6, 20);
  if (datos.cantidad > maxPorCompra) {
    throw badRequest(`Máximo ${maxPorCompra} ${maxPorCompra === 1 ? "entrada" : "entradas"} por compra`);
  }

  const disponibles = tipo.cantidad_total - tipo.cantidad_vendida - tipo.cantidad_reservada;
  if (disponibles < datos.cantidad) {
    throw conflict(`Solo quedan ${Math.max(0, disponibles)} entradas de este tipo`);
  }

  const recientes = await repo.contarOrdenesRecientes(datos.correo, ip);
  if (recientes >= 8) {
    throw conflict("Demasiados intentos de compra seguidos. Espera unos minutos e inténtalo de nuevo.");
  }

  const base = baseUrl.replace(/\/+$/, "");
  const codigo = codigoPublico("AM");
  const token = tokenSeguro();
  const tokenHash = hashToken(token);
  const compradorId = usuario?.id_usuario ?? null;
  const total = tipo.precio_centavos * datos.cantidad;

  if (total === 0) {
    const orden = await repo.crearOrdenGratis({
      codigo,
      token_hash: tokenHash,
      evento_id: evento.id_evento,
      tipo_entrada_id: tipo.id_tipo_entrada,
      cantidad: datos.cantidad,
      nombre: datos.nombre,
      correo: datos.correo,
      documento: datos.documento,
      telefono: datos.telefono,
      comprador_id: compradorId,
      ip,
    });
    return {
      orden,
      gratis: true,
      url: `${base}/entradas/${codigo}?token=${encodeURIComponent(token)}`,
    };
  }

  if (!stripeConfigurado()) {
    throw serviceUnavailable(
      "Los pagos con Stripe aún no están configurados. Agrega STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET al .env y reinicia el servidor."
    );
  }

  const orden = await repo.reservarYCrearOrden({
    codigo,
    token_hash: tokenHash,
    evento_id: evento.id_evento,
    tipo_entrada_id: tipo.id_tipo_entrada,
    cantidad: datos.cantidad,
    precio_unitario_centavos: tipo.precio_centavos,
    nombre: datos.nombre,
    correo: datos.correo,
    documento: datos.documento,
    telefono: datos.telefono,
    comprador_id: compradorId,
    ip,
    expira_en: new Date(Date.now() + 40 * 60 * 1000),
  });

  try {
    const sesion = await crearSesionCheckout({ baseUrl: base, orden, token, minutos: 30 });
    if (!sesion.url) throw internal("Stripe no devolvió la URL de pago");
    await repo.guardarSesionStripe(orden.id_orden, sesion.id);
    return { orden, gratis: false, url: sesion.url };
  } catch (e) {
    // Si Stripe falla, liberamos de inmediato el cupo reservado.
    await repo.liberarOrden(orden.id_orden, "CANCELADA");
    throw e;
  }
}

async function ordenDeSesion(session: Stripe.Checkout.Session) {
  const porSesion = await repo.obtenerOrdenPorStripeSession(session.id);
  if (porSesion) return porSesion;
  const codigo = session.client_reference_id ?? session.metadata?.orden;
  return codigo ? repo.obtenerOrdenPorCodigo(codigo) : null;
}

export async function procesarPagoSesion(
  session: Stripe.Checkout.Session
): Promise<repo.OrdenDetalleRow | null> {
  // Con tarjeta el pago es síncrono; los métodos asíncronos llegan por
  // checkout.session.async_payment_succeeded y comparten este mismo camino.
  if (session.payment_status !== "paid") return null;

  const orden = await ordenDeSesion(session);
  if (!orden) throw notFound("Orden no encontrada para la sesión de Stripe");
  if (orden.estado === "REEMBOLSADA" || orden.estado === "CANCELADA") {
    return orden;
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Si el organizador canceló el evento mientras el comprador pagaba, no se
  // emiten entradas: se devuelve el dinero y la orden queda reembolsada.
  if (orden.evento.estado === "CANCELADO") {
    if (orden.total_centavos > 0 && paymentIntent) {
      if (!stripeConfigurado()) {
        throw serviceUnavailable("Stripe no está configurado para devolver el pago");
      }
      await reembolsarPago(paymentIntent, orden.total_centavos);
    }
    const pagada = await repo.marcarOrdenPagada({
      ordenId: orden.id_orden,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
      metodoPago: "card",
    });
    return (await repo.marcarOrdenReembolsada(pagada.id_orden)) ?? pagada;
  }

  return repo.marcarOrdenPagada({
    ordenId: orden.id_orden,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntent,
    metodoPago: "card",
  });
}

export async function procesarSesionExpirada(session: Stripe.Checkout.Session): Promise<boolean> {
  const orden = await ordenDeSesion(session);
  if (!orden) return false;
  return repo.liberarOrden(orden.id_orden, "EXPIRADA");
}

export async function procesarPagoFallido(session: Stripe.Checkout.Session): Promise<boolean> {
  const orden = await ordenDeSesion(session);
  if (!orden) return false;
  return repo.liberarOrden(orden.id_orden, "FALLIDA");
}

export async function procesarReembolsoStripe(
  paymentIntentId: string
): Promise<repo.OrdenDetalleRow | null> {
  const orden = await repo.obtenerOrdenPorPaymentIntent(paymentIntentId);
  if (!orden) return null;
  return repo.marcarOrdenReembolsada(orden.id_orden);
}

/**
 * Acceso a una orden/entradas: token secreto, comprador autenticado,
 * organizador del evento o ADMIN.
 */
export async function obtenerOrdenParaVer(
  codigo: string,
  token: string | null,
  usuario: UsuarioAuth | null
): Promise<repo.OrdenDetalleRow> {
  const orden = await repo.obtenerOrdenPorCodigo(codigo);
  if (!orden) throw notFound("Orden no encontrada");

  const porToken = token ? await repo.verificarTokenOrden(codigo, hashToken(token)) : false;
  const porSesion = usuario
    ? orden.comprador_id === usuario.id_usuario ||
      puedeGestionarEvento(usuario, {
        autor_id: orden.evento.autor.id_usuario,
        tipo: orden.evento.tipo,
        facultad: orden.evento.facultad,
      })
    : false;

  if (!porToken && !porSesion) throw notFound("Orden no encontrada");
  return orden;
}

export async function listarMisEntradas(usuario: UsuarioAuth): Promise<repo.OrdenDetalleRow[]> {
  return repo.listarOrdenesPorComprador(usuario.id_usuario);
}

export async function validarCodigo(
  codigo: string,
  usuario: UsuarioAuth
): Promise<repo.ResultadoValidacion> {
  const entrada = await repo.obtenerEntradaPorCodigo(codigo);
  if (!entrada) throw notFound("Entrada no encontrada");

  const evento = await obtenerPorId(entrada.evento.id_evento);
  if (!evento) throw notFound("Evento no encontrado");
  if (!puedeGestionarEvento(usuario, evento)) {
    throw forbidden("Solo el organizador o la administración pueden validar entradas");
  }
  if (evento.estado === "CANCELADO") {
    throw badRequest("El evento fue cancelado; esta entrada no puede validarse");
  }

  return repo.validarEntrada(codigo, usuario.id_usuario);
}

export async function listarOrdenesDelEvento(
  eventoId: number,
  usuario: UsuarioAuth
): Promise<repo.OrdenDetalleRow[]> {
  const evento = await obtenerPorId(eventoId);
  if (!evento) throw notFound("Evento no encontrado");
  if (!puedeGestionarEvento(usuario, evento)) {
    throw forbidden("Solo el organizador o la administración pueden ver las ventas");
  }
  return repo.listarOrdenesDeEvento(eventoId);
}

/** Reembolso total. El organizador o ADMIN lo ejecutan desde el panel. */
export async function reembolsarOrden(
  codigo: string,
  usuario: UsuarioAuth
): Promise<repo.OrdenDetalleRow> {
  const orden = await repo.obtenerOrdenPorCodigo(codigo);
  if (!orden) throw notFound("Orden no encontrada");
  const puedeGestionar = puedeGestionarEvento(usuario, {
    autor_id: orden.evento.autor.id_usuario,
    tipo: orden.evento.tipo,
    facultad: orden.evento.facultad,
  });
  if (!puedeGestionar) {
    throw forbidden("Solo el organizador o la administración pueden reembolsar");
  }
  if (orden.estado !== "PAGADA") {
    throw badRequest(`La orden está ${orden.estado}; solo se reembolsan órdenes pagadas`);
  }

  if (orden.stripe_payment_intent_id && orden.total_centavos > 0) {
    if (!stripeConfigurado()) {
      throw serviceUnavailable("Stripe no está configurado para procesar el reembolso");
    }
    await reembolsarPago(orden.stripe_payment_intent_id, orden.total_centavos);
  }

  const actualizada = await repo.marcarOrdenReembolsada(orden.id_orden);
  if (!actualizada) throw conflict("No se pudo marcar la orden como reembolsada");
  return actualizada;
}
