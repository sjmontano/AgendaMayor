import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Repository de la taquilla — patrón Repository (Fowler).
 * Órdenes, entradas y registro de notificaciones de pago (webhooks).
 */

export interface OrdenRow {
  id_orden: number;
  codigo: string;
  estado: string; // PENDIENTE | PAGADA | RECHAZADA | EXPIRADA
  total: number; // en pesos
  comprador_id: number | null;
  pasarela_referencia: string | null;
  expira_en: string;
  evento: { id_evento: number; titulo: string; fecha_inicio: string; lugar: string };
  items: { nombre: string; cantidad: number; subtotal: number }[];
  entradas: { codigo: string; nombre_tipo: string; estado: string }[];
}

export interface EntradaRow {
  codigo: string;
  estado: string; // VALIDA | USADA
  nombre_tipo: string;
  evento: { id_evento: number; titulo: string; fecha_inicio: string; lugar: string };
}

const INCLUDE_ORDEN = {
  evento: { select: { id_evento: true, titulo: true, fecha_inicio: true, lugar: true } },
  items: { include: { tipoEntrada: { select: { nombre: true } } } },
  entradas: { include: { tipoEntrada: { select: { nombre: true } } } },
} satisfies Prisma.OrdenInclude;

type OrdenCruda = Prisma.OrdenGetPayload<{ include: typeof INCLUDE_ORDEN }>;

function aFila(o: OrdenCruda): OrdenRow {
  return {
    id_orden: o.id_orden,
    codigo: o.codigo,
    estado: o.estado,
    total: o.total_centavos / 100,
    comprador_id: o.comprador_id,
    pasarela_referencia: o.pasarela_referencia,
    expira_en: o.expira_en.toISOString(),
    evento: { ...o.evento, fecha_inicio: o.evento.fecha_inicio.toISOString() },
    items: o.items.map((i) => ({
      nombre: i.tipoEntrada.nombre,
      cantidad: i.cantidad,
      subtotal: i.subtotal_centavos / 100,
    })),
    entradas: o.entradas.map((e) => ({
      codigo: e.codigo,
      nombre_tipo: e.tipoEntrada.nombre,
      estado: e.estado,
    })),
  };
}

/** Tipos de entrada de un evento (para calcular precios y disponibilidad). */
export async function tiposDeEvento(eventoId: number) {
  return prisma.tipoEntrada.findMany({ where: { evento_id: eventoId, activo: true } });
}

export interface OrdenCrear {
  codigo: string;
  evento_id: number;
  comprador_id: number;
  nombre_comprador: string;
  correo_comprador: string;
  total_centavos: number;
  expira_en: Date;
  items: { tipo_entrada_id: number; cantidad: number; precio_unitario_centavos: number }[];
}

export async function crearOrden(datos: OrdenCrear): Promise<OrdenRow> {
  const { items, ...orden } = datos;
  const fila = await prisma.orden.create({
    data: {
      ...orden,
      token_hash: "", // columna heredada, no se usa en esta versión
      pasarela: "BOLD",
      items: {
        create: items.map((i) => ({
          ...i,
          subtotal_centavos: i.precio_unitario_centavos * i.cantidad,
        })),
      },
    },
    include: INCLUDE_ORDEN,
  });
  return aFila(fila);
}

export async function buscarOrdenPorCodigo(codigo: string): Promise<OrdenRow | null> {
  const fila = await prisma.orden.findUnique({ where: { codigo }, include: INCLUDE_ORDEN });
  return fila ? aFila(fila) : null;
}

export async function guardarReferenciaDePago(idOrden: number, referencia: string): Promise<void> {
  await prisma.orden.update({ where: { id_orden: idOrden }, data: { pasarela_referencia: referencia } });
}

/** Cambia el estado de una orden que todavía está PENDIENTE (RECHAZADA o EXPIRADA). */
export async function cerrarOrden(idOrden: number, estado: "RECHAZADA" | "EXPIRADA"): Promise<void> {
  await prisma.orden.updateMany({
    where: { id_orden: idOrden, estado: "PENDIENTE" },
    data: { estado },
  });
}

/**
 * Marca la orden como PAGADA y genera una entrada por cada unidad comprada.
 * Todo ocurre en una transacción: o se hace completo o no se hace nada.
 * Retorna false si la orden ya no estaba PENDIENTE (por ejemplo, si el
 * webhook y la página de resultado llegan al mismo tiempo).
 */
export async function confirmarPago(
  idOrden: number,
  generarCodigo: () => string
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const cambio = await tx.orden.updateMany({
      where: { id_orden: idOrden, estado: "PENDIENTE" },
      data: { estado: "PAGADA", pagada_en: new Date() },
    });
    if (cambio.count === 0) return false;

    const orden = await tx.orden.findUniqueOrThrow({
      where: { id_orden: idOrden },
      include: { items: true },
    });

    for (const item of orden.items) {
      await tx.tipoEntrada.update({
        where: { id_tipo_entrada: item.tipo_entrada_id },
        data: { cantidad_vendida: { increment: item.cantidad } },
      });

      for (let i = 0; i < item.cantidad; i++) {
        await tx.entrada.create({
          data: {
            codigo: generarCodigo(),
            orden_id: orden.id_orden,
            tipo_entrada_id: item.tipo_entrada_id,
            evento_id: orden.evento_id,
            asistente_id: orden.comprador_id,
            nombre_asistente: orden.nombre_comprador,
            correo_asistente: orden.correo_comprador,
          },
        });
      }
    }
    return true;
  });
}

/** Entradas del usuario (de órdenes pagadas). */
export async function entradasDeUsuario(usuarioId: number): Promise<EntradaRow[]> {
  const filas = await prisma.entrada.findMany({
    where: { asistente_id: usuarioId },
    include: {
      tipoEntrada: { select: { nombre: true } },
      evento: { select: { id_evento: true, titulo: true, fecha_inicio: true, lugar: true } },
    },
    orderBy: { creada_en: "desc" },
  });
  return filas.map((e) => ({
    codigo: e.codigo,
    estado: e.estado,
    nombre_tipo: e.tipoEntrada.nombre,
    evento: { ...e.evento, fecha_inicio: e.evento.fecha_inicio.toISOString() },
  }));
}

export async function buscarEntrada(codigo: string) {
  return prisma.entrada.findUnique({
    where: { codigo },
    include: { evento: { select: { titulo: true } }, tipoEntrada: { select: { nombre: true } } },
  });
}

/**
 * Marca la entrada como USADA solo si estaba VALIDA. Retorna true si se marcó.
 * Así una misma entrada no puede ingresar dos veces.
 */
export async function usarEntrada(codigo: string, validadorId: number): Promise<boolean> {
  const cambio = await prisma.entrada.updateMany({
    where: { codigo, estado: "VALIDA" },
    data: { estado: "USADA", usada_en: new Date(), validada_por_id: validadorId },
  });
  return cambio.count === 1;
}

/** ¿Ya procesamos este aviso de Bold? (Bold puede enviar el mismo webhook varias veces) */
export async function pagoEventoExiste(idExterno: string): Promise<boolean> {
  const total = await prisma.pagoEvento.count({
    where: { pasarela: "BOLD", evento_externo_id: idExterno },
  });
  return total > 0;
}

export async function registrarPagoEvento(
  idExterno: string,
  tipo: string,
  ordenId: number | null,
  payload: Prisma.InputJsonValue
): Promise<void> {
  await prisma.pagoEvento.create({
    data: { pasarela: "BOLD", evento_externo_id: idExterno, tipo, orden_id: ordenId, payload },
  });
}

export interface VentasEventoRow {
  id_evento: number;
  titulo: string;
  fecha_inicio: string;
  tipos: { nombre: string; precio: number; vendidas: number; total: number }[];
  recaudado: number; // en pesos, solo órdenes pagadas
  entradas: { codigo: string; asistente: string; correo: string; tipo: string; estado: string }[];
}

/**
 * Ventas de los eventos con taquilla. Si se pasa autorId, solo los eventos de ese autor
 * (el organizador); sin autorId, todos (administrador).
 */
export async function ventasPorEvento(autorId?: number): Promise<VentasEventoRow[]> {
  const eventos = await prisma.evento.findMany({
    where: { permite_entradas: true, ...(autorId ? { autor_id: autorId } : {}) },
    orderBy: { fecha_inicio: "desc" },
    include: {
      tiposEntrada: true,
      ordenes: { where: { estado: "PAGADA" }, select: { total_centavos: true } },
      entradas: {
        include: { tipoEntrada: { select: { nombre: true } } },
        orderBy: { creada_en: "desc" },
      },
    },
  });

  return eventos.map((e) => ({
    id_evento: e.id_evento,
    titulo: e.titulo,
    fecha_inicio: e.fecha_inicio.toISOString(),
    tipos: e.tiposEntrada.map((t) => ({
      nombre: t.nombre,
      precio: t.precio_centavos / 100,
      vendidas: t.cantidad_vendida,
      total: t.cantidad_total,
    })),
    recaudado: e.ordenes.reduce((suma, o) => suma + o.total_centavos, 0) / 100,
    entradas: e.entradas.map((en) => ({
      codigo: en.codigo,
      asistente: en.nombre_asistente,
      correo: en.correo_asistente,
      tipo: en.tipoEntrada.nombre,
      estado: en.estado,
    })),
  }));
}
