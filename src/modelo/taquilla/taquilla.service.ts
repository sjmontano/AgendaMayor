import { randomBytes } from "crypto";
import { badRequest, conflict, forbidden, notFound } from "@/lib/errors";
import { crearLinkDePago, consultarPago } from "@/lib/integraciones/bold";
import { requiereRol, type UsuarioAuth } from "@/lib/auth";
import * as repo from "./taquilla.repository";
import * as eventos from "../eventos/evento.repository";
import * as notificaciones from "../notificaciones/notificacion.repository";
import type { CompraDTO } from "./taquilla.dto";

/**
 * Service de la taquilla (carrito → orden → pago con Bold → entradas).
 *
 * Flujo:
 *  1. comprar(): valida el carrito, calcula el total con los precios de la BD,
 *     crea la orden PENDIENTE y pide a Bold un link de pago.
 *  2. El comprador paga en la página de Bold y vuelve a /checkout/resultado.
 *  3. conciliar(): pregunta a Bold el estado del pago. Si está pagado,
 *     la orden pasa a PAGADA y se generan las entradas con su código.
 *     El webhook de Bold también llama a conciliar() (lo que llegue primero).
 */
const MINUTOS_PARA_PAGAR = 30;

/** Código legible para órdenes y entradas, ej. ENT-4F9A2C1B7D3E */
function generarCodigo(prefijo: string) {
  return `${prefijo}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

/** URL pública del sitio (para que Bold devuelva al comprador). */
function urlDelSitio(origenPeticion: string) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? origenPeticion;
}

export async function comprar(datos: CompraDTO, usuario: UsuarioAuth, origenPeticion: string) {
  const evento = await eventos.buscarDetalle(datos.eventoId);
  if (!evento || !evento.permite_entradas) throw notFound("Este evento no vende entradas");
  if (new Date(evento.fecha_fin) < new Date()) throw badRequest("El evento ya terminó");

  const cantidadTotal = datos.items.reduce((suma, i) => suma + i.cantidad, 0);
  if (cantidadTotal > evento.max_por_compra) {
    throw badRequest(`Puedes comprar máximo ${evento.max_por_compra} entradas por orden`);
  }

  // Los precios y la disponibilidad se leen de la BD, nunca del navegador
  const tipos = await repo.tiposDeEvento(evento.id_evento);
  const items = datos.items.map((item) => {
    const tipo = tipos.find((t) => t.id_tipo_entrada === item.tipoEntradaId);
    if (!tipo) throw badRequest("Tipo de entrada no válido");
    if (tipo.cantidad_total - tipo.cantidad_vendida < item.cantidad) {
      throw conflict(`No quedan suficientes entradas "${tipo.nombre}"`);
    }
    return {
      tipo_entrada_id: tipo.id_tipo_entrada,
      cantidad: item.cantidad,
      precio_unitario_centavos: tipo.precio_centavos,
    };
  });
  const totalCentavos = items.reduce((suma, i) => suma + i.precio_unitario_centavos * i.cantidad, 0);

  const orden = await repo.crearOrden({
    codigo: generarCodigo("ORD"),
    evento_id: evento.id_evento,
    comprador_id: usuario.id_usuario,
    nombre_comprador: `${usuario.nombre} ${usuario.apellido}`,
    correo_comprador: usuario.correo,
    total_centavos: totalCentavos,
    expira_en: new Date(Date.now() + MINUTOS_PARA_PAGAR * 60_000),
    items,
  });
  const urlResultado = `${urlDelSitio(origenPeticion)}/checkout/resultado?orden=${orden.codigo}`;

  // Evento gratuito: no pasa por Bold, se confirma de una vez
  if (totalCentavos === 0) {
    await confirmar(orden);
    return { urlPago: urlResultado };
  }

  const link = await crearLinkDePago({
    referencia: orden.codigo,
    totalPesos: totalCentavos / 100,
    descripcion: `Agenda Mayor · ${evento.titulo}`,
    correo: usuario.correo,
    urlRetorno: urlResultado,
    minutosVigencia: MINUTOS_PARA_PAGAR,
  });
  await repo.guardarReferenciaDePago(orden.id_orden, link.idLink);
  return { urlPago: link.url };
}

/** Pregunta a Bold por el pago de una orden PENDIENTE y actualiza su estado. */
export async function conciliar(codigo: string) {
  const orden = await repo.buscarOrdenPorCodigo(codigo);
  if (!orden) throw notFound("Orden no encontrada");
  if (orden.estado !== "PENDIENTE" || !orden.pasarela_referencia) return orden;

  const estado = await consultarPago(orden.pasarela_referencia);

  if (estado === "PAGADA") {
    await confirmar(orden);
  } else if (estado === "RECHAZADA" || estado === "EXPIRADA") {
    await repo.cerrarOrden(orden.id_orden, estado);
  } else if (new Date(orden.expira_en) < new Date()) {
    await repo.cerrarOrden(orden.id_orden, "EXPIRADA");
  }
  return (await repo.buscarOrdenPorCodigo(codigo))!;
}

async function confirmar(orden: repo.OrdenRow) {
  const confirmada = await repo.confirmarPago(orden.id_orden, () => generarCodigo("ENT"));
  if (confirmada && orden.comprador_id) {
    await notificaciones.crear(
      orden.comprador_id,
      `Tu compra para "${orden.evento.titulo}" fue confirmada. Tus entradas están en Mis entradas.`,
      null
    );
  }
}

/** La orden solo la puede ver quien la compró. */
export async function verOrden(codigo: string, usuario: UsuarioAuth) {
  const orden = await conciliar(codigo);
  if (orden.comprador_id !== usuario.id_usuario) throw forbidden("Esta orden no es tuya");
  return orden;
}

export async function misEntradas(usuario: UsuarioAuth) {
  return repo.entradasDeUsuario(usuario.id_usuario);
}

/** Validación en la puerta del evento (solo DOCENTE o ADMIN). */
export async function validarEntrada(codigo: string, usuario: UsuarioAuth) {
  requiereRol(usuario, "DOCENTE", "ADMIN");

  const entrada = await repo.buscarEntrada(codigo);
  if (!entrada) throw notFound("La entrada no existe");

  const usada = await repo.usarEntrada(codigo, usuario.id_usuario);
  if (!usada) throw conflict("Esta entrada ya fue usada");

  return {
    codigo: entrada.codigo,
    evento: entrada.evento.titulo,
    tipo: entrada.tipoEntrada.nombre,
    asistente: entrada.nombre_asistente,
  };
}
