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
 * Flujo (cada paso es una petición distinta a la API):
 *  1. crearOrden()  POST /api/ordenes: valida el carrito, calcula el total con los
 *                   precios de la BD y guarda la orden PENDIENTE con sus ítems.
 *  2. iniciarPago() POST /api/ordenes/[codigo]/pago: pide a Bold un link de pago.
 *  3. El comprador paga en la página de Bold (en otra pestaña).
 *  4. conciliar()   GET /api/ordenes/[codigo]: pregunta a Bold el estado del pago.
 *                   Si está pagado, la orden pasa a PAGADA y se generan las entradas.
 *                   El webhook de Bold también llama a conciliar() (lo que llegue primero).
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

/**
 * Paso 1 — Orden: revisa el carrito contra la BD (evento, cupo y máximo por compra)
 * y guarda la orden PENDIENTE. Los precios se leen de la BD, nunca del navegador.
 * Si es gratis queda PAGADA de una vez.
 */
export async function crearOrden(datos: CompraDTO, usuario: UsuarioAuth) {
  const evento = await eventos.buscarDetalle(datos.eventoId);
  if (!evento || !evento.permite_entradas) throw notFound("Este evento no vende entradas");
  if (new Date(evento.fecha_fin) < new Date()) throw badRequest("El evento ya terminó");

  const cantidadTotal = datos.items.reduce((suma, i) => suma + i.cantidad, 0);
  if (cantidadTotal > evento.max_por_compra) {
    throw badRequest(`Puedes comprar máximo ${evento.max_por_compra} entradas por orden`);
  }

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

  // Evento gratuito: no pasa por Bold, se confirma de una vez
  if (totalCentavos === 0) {
    await confirmar(orden);
    return (await repo.buscarOrdenPorCodigo(orden.codigo))!;
  }
  return orden;
}

/** Paso 2 — Pago: pide a Bold el link de pago de una orden PENDIENTE. */
export async function iniciarPago(codigo: string, usuario: UsuarioAuth, origenPeticion: string) {
  const orden = await repo.buscarOrdenPorCodigo(codigo);
  if (!orden) throw notFound("Orden no encontrada");
  if (orden.comprador_id !== usuario.id_usuario) throw forbidden("Esta orden no es tuya");
  if (orden.estado !== "PENDIENTE") throw conflict("Esta orden ya no está pendiente de pago");
  // Una orden = un solo link de Bold, así no se puede pagar dos veces
  if (orden.pasarela_referencia) throw conflict("Esta orden ya tiene un link de pago");

  const minutosRestantes = Math.ceil((new Date(orden.expira_en).getTime() - Date.now()) / 60_000);
  if (minutosRestantes <= 0) {
    await repo.cerrarOrden(orden.id_orden, "EXPIRADA");
    throw conflict("El tiempo para pagar esta orden terminó");
  }

  const link = await crearLinkDePago({
    referencia: orden.codigo,
    totalPesos: orden.total,
    descripcion: `Agenda Mayor · ${orden.evento.titulo}`,
    correo: usuario.correo,
    urlRetorno: `${urlDelSitio(origenPeticion)}/checkout/resultado?orden=${orden.codigo}`,
    minutosVigencia: minutosRestantes,
  });
  await repo.guardarReferenciaDePago(orden.id_orden, link.idLink);
  return { codigo: orden.codigo, idLink: link.idLink, urlPago: link.url };
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

/** Ventas de los eventos del organizador; el administrador ve las de todos los eventos. */
export async function ventasDeMisEventos(usuario: UsuarioAuth) {
  return repo.ventasPorEvento(usuario.nombre_rol === "ADMIN" ? undefined : usuario.id_usuario);
}
