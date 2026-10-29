import { badRequest, forbidden, notFound } from "@/lib/errors";
import { aCentavos } from "@/lib/utils";
import type { UsuarioAuth } from "@/lib/auth";
import {
  actualizar as actualizarEnBd,
  anularEntradasDeEvento,
  crear as crearEnBd,
  listarPorAutor,
  obtenerPorId,
  type EventoActualizar,
  type EventoDetalleRow,
  type EventoRow,
} from "./evento.repository";
import type { EventoCreateDTO, EventoUpdateDTO } from "./evento.dto";
import { obtenerTransicionEvento, type EstadoEvento } from "./evento.state";

/**
 * Service de eventos — reglas por rol (HU-11) + taquilla.
 * ADMIN crea OFICIAL · DOCENTE crea EAFI de su facultad · cualquiera COMUNIDAD.
 *
 * Los eventos se publican de inmediato. Si más adelante se activa
 * EVENTOS_REQUIEREN_APROBACION=true, los eventos pagos de estudiantes entran
 * a EN_REVISION y un moderador los publica desde el panel.
 */
export type EventoPublico = Omit<EventoDetalleRow, "url_acceso_privado"> & {
  es_pagado: boolean;
  precio_desde_centavos: number | null;
  acceso_privado_disponible: boolean;
};

function esPagado(evento: Pick<EventoDetalleRow, "tipos_entrada">) {
  return evento.tipos_entrada.some((t) => t.activo && t.precio_centavos > 0);
}

/** Vista de lista pública: nunca incluye el enlace privado de acceso. */
export function aResumenPublico(evento: EventoRow): Omit<EventoRow, "url_acceso_privado"> {
  const { url_acceso_privado, ...publico } = evento;
  void url_acceso_privado;
  return publico;
}

function aPublico(evento: EventoDetalleRow): EventoPublico {
  const { url_acceso_privado, ...resto } = evento;
  const tipos = resto.tipos_entrada.filter((t) => t.activo);
  const pagado = tipos.some((t) => t.precio_centavos > 0);
  const precios = tipos.map((t) => t.precio_centavos).filter((p) => p > 0);

  return {
    ...resto,
    tipos_entrada: tipos,
    // Un evento virtual pago no debe filtrar el enlace de acceso en la vitrina.
    url_virtual: pagado && url_acceso_privado ? null : resto.url_virtual,
    es_pagado: pagado,
    precio_desde_centavos: precios.length > 0 ? Math.min(...precios) : null,
    acceso_privado_disponible: Boolean(url_acceso_privado),
  };
}

export async function crear(datos: EventoCreateDTO, usuario: UsuarioAuth): Promise<EventoDetalleRow> {
  if (datos.tipo === "OFICIAL" && usuario.nombre_rol !== "ADMIN") {
    throw forbidden("Solo ADMIN crea eventos oficiales");
  }
  if (datos.tipo === "EAFI") {
    if (usuario.nombre_rol !== "DOCENTE" && usuario.nombre_rol !== "ADMIN") {
      throw forbidden("Solo DOCENTE crea eventos EAFI");
    }
    if (!datos.facultad || !datos.edicion) {
      throw badRequest("EAFI exige facultad + edición (ej. EAFI 2026-1)");
    }
    if (usuario.nombre_rol === "DOCENTE" && usuario.facultad !== datos.facultad) {
      throw forbidden("Solo EAFI de su propia facultad");
    }
  }

  const inicio = new Date(datos.fechaInicio);
  const fin = new Date(datos.fechaFin);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw badRequest("Las fechas del evento no son válidas");
  }
  if (fin <= inicio) throw badRequest("fechaFin debe ser posterior a fechaInicio");

  if (datos.ventaInicio && datos.ventaFin) {
    const vi = new Date(datos.ventaInicio);
    const vf = new Date(datos.ventaFin);
    if (vf <= vi) throw badRequest("La venta debe terminar después de empezar");
    if (vf > fin) throw badRequest("La venta no puede terminar después del evento");
  }
  if (datos.ventaInicio && new Date(datos.ventaInicio) >= fin) {
    throw badRequest("La venta debe empezar antes de que termine el evento");
  }
  if (datos.ventaFin && new Date(datos.ventaFin) > fin) {
    throw badRequest("La venta no puede terminar después del evento");
  }

  if (datos.esVirtual && !datos.urlVirtual && !datos.urlAccesoPrivado) {
    throw badRequest("Evento virtual exige un enlace público o un enlace privado para compradores");
  }
  if (!datos.esVirtual && !datos.lugar) {
    throw badRequest("Evento presencial exige lugar");
  }

  const tipos = datos.tiposEntrada ?? [];
  const totalEntradas = tipos.reduce((s, t) => s + t.cantidad, 0);
  if (tipos.length > 0 && totalEntradas < 1) {
    throw badRequest("Define al menos una entrada con cupo");
  }

  const aforo = datos.aforo ?? (tipos.length > 0 ? totalEntradas : null);
  if (aforo !== null && totalEntradas > aforo) {
    throw badRequest(`El cupo de las entradas (${totalEntradas}) supera el aforo (${aforo})`);
  }

  const hayPago = tipos.some((t) => t.precioCop > 0);
  const requiereAprobacion =
    process.env.EVENTOS_REQUIEREN_APROBACION === "true" &&
    usuario.nombre_rol === "ESTUDIANTE" &&
    hayPago;

  return crearEnBd(
    {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      fecha_inicio: datos.fechaInicio,
      fecha_fin: datos.fechaFin,
      lugar: datos.esVirtual ? (datos.lugar ?? "Virtual") : datos.lugar!,
      es_virtual: datos.esVirtual,
      url_virtual: datos.urlVirtual ?? null,
      facultad: datos.facultad ?? null,
      edicion: datos.edicion ?? null,
      imagen: datos.imagen ?? null,
      autor_id: usuario.id_usuario,
      estado: requiereAprobacion ? "EN_REVISION" : "PUBLICADO",
      permite_entradas: tipos.length > 0,
      aforo,
      max_por_compra: datos.maxPorCompra,
      venta_inicio: datos.ventaInicio ?? null,
      venta_fin: datos.ventaFin ?? null,
      politica_devolucion:
        datos.politicaDevolucion ??
        (hayPago
          ? "Si el evento se cancela, se devuelve el valor de la entrada. Los demás casos se evalúan con el organizador."
          : null),
      url_acceso_privado: datos.urlAccesoPrivado ?? null,
    },
    tipos.map((t) => ({
      nombre: t.nombre,
      descripcion: t.descripcion ?? null,
      precio_centavos: aCentavos(t.precioCop),
      cantidad_total: t.cantidad,
    }))
  );
}

export async function obtenerDetallePublico(
  id: number,
  usuario: UsuarioAuth | null
): Promise<EventoPublico> {
  const evento = await obtenerPorId(id);
  if (!evento) throw notFound("Evento no encontrado");

  const esGestor = usuario ? puedeGestionarEvento(usuario, evento) : false;

  if ((evento.estado !== "PUBLICADO" || !evento.activo) && !esGestor) {
    throw notFound("Evento no encontrado");
  }

  return aPublico(evento);
}

export function puedeGestionarEvento(
  usuario: UsuarioAuth,
  evento: Pick<EventoDetalleRow, "autor_id" | "tipo" | "facultad">
): boolean {
  if (usuario.nombre_rol === "ADMIN") return true;
  if (evento.autor_id === usuario.id_usuario) return true;
  if (
    usuario.nombre_rol === "DOCENTE" &&
    evento.tipo === "EAFI" &&
    evento.facultad &&
    evento.facultad === usuario.facultad
  ) {
    return true;
  }
  return false;
}

export async function listarParaPanel(usuario: UsuarioAuth): Promise<EventoDetalleRow[]> {
  return listarPorAutor(usuario.nombre_rol === "ADMIN" ? undefined : usuario.id_usuario);
}

export async function actualizar(
  id: number,
  datos: EventoUpdateDTO,
  usuario: UsuarioAuth
): Promise<EventoDetalleRow> {
  const evento = await obtenerPorId(id);
  if (!evento) throw notFound("Evento no encontrado");
  if (!puedeGestionarEvento(usuario, evento)) {
    throw forbidden("Solo el organizador o la administración pueden editar este evento");
  }
  if (datos.tipo !== undefined && datos.tipo !== evento.tipo) {
    throw badRequest("El tipo de evento no se puede cambiar después de crearlo");
  }

  const cambios: EventoActualizar = {};

  if (datos.titulo !== undefined) cambios.titulo = datos.titulo;
  if (datos.descripcion !== undefined) cambios.descripcion = datos.descripcion;
  if (datos.tipo !== undefined) cambios.tipo = datos.tipo;
  if (datos.fechaInicio !== undefined) cambios.fecha_inicio = datos.fechaInicio;
  if (datos.fechaFin !== undefined) cambios.fecha_fin = datos.fechaFin;
  if (datos.lugar !== undefined) cambios.lugar = datos.lugar;
  if (datos.esVirtual !== undefined) cambios.es_virtual = datos.esVirtual;
  if (datos.urlVirtual !== undefined) cambios.url_virtual = datos.urlVirtual;
  if (datos.facultad !== undefined) cambios.facultad = datos.facultad;
  if (datos.edicion !== undefined) cambios.edicion = datos.edicion;
  if (datos.imagen !== undefined) cambios.imagen = datos.imagen;
  if (datos.maxPorCompra !== undefined) cambios.max_por_compra = datos.maxPorCompra;
  if (datos.ventaInicio !== undefined) cambios.venta_inicio = datos.ventaInicio;
  if (datos.ventaFin !== undefined) cambios.venta_fin = datos.ventaFin;
  if (datos.politicaDevolucion !== undefined) cambios.politica_devolucion = datos.politicaDevolucion;
  if (datos.urlAccesoPrivado !== undefined) cambios.url_acceso_privado = datos.urlAccesoPrivado;

  if (datos.aforo !== undefined) {
    const vendidas = evento.tipos_entrada.reduce((s, t) => s + t.cantidad_vendida, 0);
    if (datos.aforo !== null && datos.aforo < vendidas) {
      throw badRequest(`El aforo no puede ser menor que las entradas ya vendidas (${vendidas})`);
    }
    cambios.aforo = datos.aforo;
  }

  if (datos.estado !== undefined) {
    const transicion = obtenerTransicionEvento(
      evento.estado as EstadoEvento,
      datos.estado as EstadoEvento,
      usuario.nombre_rol
    );
    if (!transicion) {
      throw badRequest(`No se puede pasar de ${evento.estado} a ${datos.estado}`);
    }
    cambios.estado = datos.estado;
    if (datos.estado === "PUBLICADO" && !evento.publicado_en) {
      cambios.publicado_en = new Date();
    }
    if (datos.estado === "CANCELADO") {
      cambios.motivo_cancelacion =
        datos.motivoCancelacion ?? "Evento cancelado por el organizador";
    }
  }

  if (cambios.fecha_inicio || cambios.fecha_fin) {
    const inicio = new Date(cambios.fecha_inicio ?? evento.fecha_inicio);
    const fin = new Date(cambios.fecha_fin ?? evento.fecha_fin);
    if (fin <= inicio) throw badRequest("fechaFin debe ser posterior a fechaInicio");
  }
  if (cambios.es_virtual && !cambios.url_virtual && !cambios.url_acceso_privado && !evento.url_acceso_privado) {
    throw badRequest("Evento virtual exige un enlace de acceso");
  }
  if (cambios.es_virtual === false && !cambios.lugar && !evento.lugar) {
    throw badRequest("Evento presencial exige lugar");
  }

  const actualizado = await actualizarEnBd(id, cambios);
  if (cambios.estado === "CANCELADO") {
    await anularEntradasDeEvento(id);
  }
  return actualizado;
}

export { esPagado };
