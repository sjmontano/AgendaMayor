import { Prisma, type Entrada as EntradaBD } from "@prisma/client";
import { prisma } from "@/lib/db";
import { codigoPublico } from "@/lib/codigos";
import { conflict } from "@/lib/errors";

/**
 * Repository de taquilla.
 * - La reserva de cupo es atómica (UPDATE condicional), no un read-modify-write.
 * - Confirmar pago es idempotente: el webhook puede repetirse sin duplicar entradas.
 */

/**
 * Neon puede tardar más que el timeout por defecto de Prisma (5 s) en una
 * transacción interactiva con varias idas y vueltas. Damos margen suficiente
 * para no liberar una reserva a medias en la nube.
 */
const TX_OPTS = { maxWait: 15_000, timeout: 30_000 } as const;

function transaccion<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn, TX_OPTS);
}

const eventoDeOrdenSelect = {
  id_evento: true,
  titulo: true,
  descripcion: true,
  tipo: true,
  fecha_inicio: true,
  fecha_fin: true,
  lugar: true,
  es_virtual: true,
  imagen: true,
  facultad: true,
  estado: true,
  permite_entradas: true,
  url_acceso_privado: true,
  autor: {
    select: { id_usuario: true, username: true, nombre: true, apellido: true },
  },
} satisfies Prisma.EventoSelect;

const ordenInclude = {
  evento: { select: eventoDeOrdenSelect },
  items: { include: { tipoEntrada: true }, orderBy: { id_orden_item: "asc" } },
  entradas: { orderBy: { id_entrada: "asc" } },
} satisfies Prisma.OrdenInclude;

type OrdenConRelaciones = Prisma.OrdenGetPayload<{
  include: {
    evento: { select: typeof eventoDeOrdenSelect };
    items: { include: { tipoEntrada: true } };
    entradas: true;
  };
}>;

export interface EventoDeOrden {
  id_evento: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  es_virtual: boolean;
  imagen: string | null;
  facultad: string | null;
  estado: string;
  permite_entradas: boolean;
  url_acceso_privado: string | null;
  autor: { id_usuario: number; username: string; nombre: string; apellido: string };
}

export interface EntradaRow {
  id_entrada: number;
  codigo: string;
  orden_id: number;
  tipo_entrada_id: number;
  evento_id: number;
  asistente_id: number | null;
  nombre_asistente: string;
  correo_asistente: string;
  estado: string;
  usada_en: string | null;
  validada_por_id: number | null;
  creada_en: string;
}

export interface OrdenItemRow {
  id_orden_item: number;
  tipo_entrada_id: number;
  cantidad: number;
  precio_unitario_centavos: number;
  subtotal_centavos: number;
  tipo_entrada: { id_tipo_entrada: number; nombre: string };
}

export interface OrdenDetalleRow {
  id_orden: number;
  codigo: string;
  evento_id: number;
  comprador_id: number | null;
  nombre_comprador: string;
  correo_comprador: string;
  documento: string | null;
  telefono: string | null;
  total_centavos: number;
  moneda: string;
  estado: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  metodo_pago: string | null;
  pasarela: string;
  pasarela_referencia: string | null;
  expira_en: string;
  pagada_en: string | null;
  reembolsada_en: string | null;
  creada_en: string;
  actualizada_en: string;
  evento: EventoDeOrden;
  items: OrdenItemRow[];
  entradas: EntradaRow[];
}

function aEntrada(e: EntradaBD): EntradaRow {
  return {
    id_entrada: e.id_entrada,
    codigo: e.codigo,
    orden_id: e.orden_id,
    tipo_entrada_id: e.tipo_entrada_id,
    evento_id: e.evento_id,
    asistente_id: e.asistente_id,
    nombre_asistente: e.nombre_asistente,
    correo_asistente: e.correo_asistente,
    estado: e.estado,
    usada_en: e.usada_en?.toISOString() ?? null,
    validada_por_id: e.validada_por_id,
    creada_en: e.creada_en.toISOString(),
  };
}

function aOrden(o: OrdenConRelaciones): OrdenDetalleRow {
  return {
    id_orden: o.id_orden,
    codigo: o.codigo,
    evento_id: o.evento_id,
    comprador_id: o.comprador_id,
    nombre_comprador: o.nombre_comprador,
    correo_comprador: o.correo_comprador,
    documento: o.documento,
    telefono: o.telefono,
    total_centavos: o.total_centavos,
    moneda: o.moneda,
    estado: o.estado,
    stripe_session_id: o.stripe_session_id,
    stripe_payment_intent_id: o.stripe_payment_intent_id,
    metodo_pago: o.metodo_pago,
    pasarela: o.pasarela,
    pasarela_referencia: o.pasarela_referencia,
    expira_en: o.expira_en.toISOString(),
    pagada_en: o.pagada_en?.toISOString() ?? null,
    reembolsada_en: o.reembolsada_en?.toISOString() ?? null,
    creada_en: o.creada_en.toISOString(),
    actualizada_en: o.actualizada_en.toISOString(),
    evento: {
      ...o.evento,
      fecha_inicio: o.evento.fecha_inicio.toISOString(),
      fecha_fin: o.evento.fecha_fin.toISOString(),
    },
    items: o.items.map((i) => ({
      id_orden_item: i.id_orden_item,
      tipo_entrada_id: i.tipo_entrada_id,
      cantidad: i.cantidad,
      precio_unitario_centavos: i.precio_unitario_centavos,
      subtotal_centavos: i.subtotal_centavos,
      tipo_entrada: { id_tipo_entrada: i.tipoEntrada.id_tipo_entrada, nombre: i.tipoEntrada.nombre },
    })),
    entradas: o.entradas.map(aEntrada),
  };
}

export interface ReservaInput {
  codigo: string;
  token_hash: string;
  evento_id: number;
  tipo_entrada_id: number;
  cantidad: number;
  precio_unitario_centavos: number;
  nombre: string;
  correo: string;
  documento?: string;
  telefono?: string;
  comprador_id: number | null;
  ip: string | null;
  expira_en: Date;
}

export async function reservarYCrearOrden(datos: ReservaInput): Promise<OrdenDetalleRow> {
  const fila = await transaccion(async (tx) => {
    const actualizados = await tx.$executeRaw`
      UPDATE tipo_entrada
      SET cantidad_reservada = cantidad_reservada + ${datos.cantidad}
      WHERE id_tipo_entrada = ${datos.tipo_entrada_id}
        AND evento_id = ${datos.evento_id}
        AND activo = true
        AND cantidad_vendida + cantidad_reservada + ${datos.cantidad} <= cantidad_total
    `;
    if (Number(actualizados) === 0) {
      throw conflict("No hay cupo suficiente para esa cantidad de entradas");
    }

    const total = datos.precio_unitario_centavos * datos.cantidad;
    return tx.orden.create({
      data: {
        codigo: datos.codigo,
        token_hash: datos.token_hash,
        evento_id: datos.evento_id,
        comprador_id: datos.comprador_id,
        nombre_comprador: datos.nombre,
        correo_comprador: datos.correo,
        documento: datos.documento ?? null,
        telefono: datos.telefono ?? null,
        total_centavos: total,
        estado: "PENDIENTE",
        ip: datos.ip,
        expira_en: datos.expira_en,
        items: {
          create: {
            tipo_entrada_id: datos.tipo_entrada_id,
            cantidad: datos.cantidad,
            precio_unitario_centavos: datos.precio_unitario_centavos,
            subtotal_centavos: total,
          },
        },
      },
      include: ordenInclude,
    });
  });

  return aOrden(fila);
}

export interface OrdenGratisInput {
  codigo: string;
  token_hash: string;
  evento_id: number;
  tipo_entrada_id: number;
  cantidad: number;
  nombre: string;
  correo: string;
  documento?: string;
  telefono?: string;
  comprador_id: number | null;
  ip: string | null;
}

/** Crea y confirma una orden de valor 0 sin pasar por Stripe. */
export async function crearOrdenGratis(datos: OrdenGratisInput): Promise<OrdenDetalleRow> {
  const fila = await transaccion(async (tx) => {
    const actualizados = await tx.$executeRaw`
      UPDATE tipo_entrada
      SET cantidad_vendida = cantidad_vendida + ${datos.cantidad}
      WHERE id_tipo_entrada = ${datos.tipo_entrada_id}
        AND evento_id = ${datos.evento_id}
        AND activo = true
        AND cantidad_vendida + cantidad_reservada + ${datos.cantidad} <= cantidad_total
    `;
    if (Number(actualizados) === 0) {
      throw conflict("No hay cupo suficiente para esa cantidad de entradas");
    }

    const orden = await tx.orden.create({
      data: {
        codigo: datos.codigo,
        token_hash: datos.token_hash,
        evento_id: datos.evento_id,
        comprador_id: datos.comprador_id,
        nombre_comprador: datos.nombre,
        correo_comprador: datos.correo,
        documento: datos.documento ?? null,
        telefono: datos.telefono ?? null,
        total_centavos: 0,
        estado: "PAGADA",
        pagada_en: new Date(),
        ip: datos.ip,
        expira_en: new Date(),
        items: {
          create: {
            tipo_entrada_id: datos.tipo_entrada_id,
            cantidad: datos.cantidad,
            precio_unitario_centavos: 0,
            subtotal_centavos: 0,
          },
        },
      },
    });

    await tx.entrada.createMany({
      data: Array.from({ length: datos.cantidad }, () => ({
        codigo: codigoPublico("AME"),
        orden_id: orden.id_orden,
        tipo_entrada_id: datos.tipo_entrada_id,
        evento_id: datos.evento_id,
        asistente_id: datos.comprador_id,
        nombre_asistente: datos.nombre,
        correo_asistente: datos.correo,
        estado: "VALIDA",
      })),
    });

    return tx.orden.findUniqueOrThrow({
      where: { id_orden: orden.id_orden },
      include: ordenInclude,
    });
  });

  return aOrden(fila);
}

export interface PagoAprobadoInput {
  ordenId: number;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  metodoPago?: string | null;
}

/**
 * Confirma el pago y emite las entradas. Si la orden ya está PAGADA, devuelve
 * el detalle existente (idempotencia ante reintentos de Stripe).
 */
export async function marcarOrdenPagada(datos: PagoAprobadoInput): Promise<OrdenDetalleRow> {
  const fila = await transaccion(async (tx) => {
    const orden = await tx.orden.findUnique({
      where: { id_orden: datos.ordenId },
      include: { items: true },
    });
    if (!orden) throw new Error("Orden no encontrada");

    if (orden.estado === "PAGADA") {
      return tx.orden.findUniqueOrThrow({
        where: { id_orden: orden.id_orden },
        include: ordenInclude,
      });
    }
    if (!["PENDIENTE", "EXPIRADA", "FALLIDA"].includes(orden.estado)) {
      throw conflict(`La orden está ${orden.estado} y no puede confirmarse`);
    }

    const cambio = await tx.orden.updateMany({
      where: { id_orden: orden.id_orden, estado: orden.estado },
      data: {
        estado: "PAGADA",
        pagada_en: new Date(),
        stripe_session_id: datos.stripeSessionId ?? orden.stripe_session_id,
        stripe_payment_intent_id:
          datos.stripePaymentIntentId ?? orden.stripe_payment_intent_id,
        metodo_pago: datos.metodoPago ?? orden.metodo_pago,
      },
    });
    if (cambio.count === 0) {
      return tx.orden.findUniqueOrThrow({
        where: { id_orden: orden.id_orden },
        include: ordenInclude,
      });
    }

    for (const item of orden.items) {
      if (orden.estado === "PENDIENTE") {
        await tx.$executeRaw`
          UPDATE tipo_entrada
          SET cantidad_reservada = GREATEST(cantidad_reservada - ${item.cantidad}, 0),
              cantidad_vendida = cantidad_vendida + ${item.cantidad}
          WHERE id_tipo_entrada = ${item.tipo_entrada_id}
        `;
      } else {
        // Pago tardío: la reserva ya se había liberado; se emite igual.
        await tx.$executeRaw`
          UPDATE tipo_entrada
          SET cantidad_vendida = cantidad_vendida + ${item.cantidad}
          WHERE id_tipo_entrada = ${item.tipo_entrada_id}
        `;
      }
    }

    for (const item of orden.items) {
      await tx.entrada.createMany({
        data: Array.from({ length: item.cantidad }, () => ({
          codigo: codigoPublico("AME"),
          orden_id: orden.id_orden,
          tipo_entrada_id: item.tipo_entrada_id,
          evento_id: orden.evento_id,
          asistente_id: orden.comprador_id,
          nombre_asistente: orden.nombre_comprador,
          correo_asistente: orden.correo_comprador,
          estado: "VALIDA",
        })),
      });
    }

    return tx.orden.findUniqueOrThrow({
      where: { id_orden: orden.id_orden },
      include: ordenInclude,
    });
  });

  return aOrden(fila);
}

/** Libera la reserva de una orden que expiró, falló o se canceló. */
export async function liberarOrden(
  ordenId: number,
  destino: "EXPIRADA" | "FALLIDA" | "CANCELADA"
): Promise<boolean> {
  return transaccion(async (tx) => {
    const orden = await tx.orden.findUnique({
      where: { id_orden: ordenId },
      include: { items: true },
    });
    if (!orden || orden.estado !== "PENDIENTE") return false;

    const cambio = await tx.orden.updateMany({
      where: { id_orden: ordenId, estado: "PENDIENTE" },
      data: { estado: destino },
    });
    if (cambio.count === 0) return false;

    for (const item of orden.items) {
      await tx.$executeRaw`
        UPDATE tipo_entrada
        SET cantidad_reservada = GREATEST(cantidad_reservada - ${item.cantidad}, 0)
        WHERE id_tipo_entrada = ${item.tipo_entrada_id}
      `;
    }
    return true;
  });
}

export async function obtenerOrdenPorCodigo(codigo: string): Promise<OrdenDetalleRow | null> {
  const fila = await prisma.orden.findUnique({
    where: { codigo },
    include: ordenInclude,
  });
  return fila ? aOrden(fila) : null;
}

export async function verificarTokenOrden(codigo: string, tokenHash: string): Promise<boolean> {
  const fila = await prisma.orden.findUnique({
    where: { codigo },
    select: { token_hash: true },
  });
  return Boolean(fila && fila.token_hash === tokenHash);
}

export async function guardarSesionStripe(ordenId: number, sessionId: string): Promise<void> {
  await prisma.orden.update({
    where: { id_orden: ordenId },
    data: { stripe_session_id: sessionId },
  });
}

export async function obtenerOrdenPorId(id: number): Promise<OrdenDetalleRow | null> {
  const fila = await prisma.orden.findUnique({
    where: { id_orden: id },
    include: ordenInclude,
  });
  return fila ? aOrden(fila) : null;
}

export async function obtenerOrdenPorStripeSession(
  sessionId: string
): Promise<OrdenDetalleRow | null> {
  const fila = await prisma.orden.findUnique({
    where: { stripe_session_id: sessionId },
    include: ordenInclude,
  });
  return fila ? aOrden(fila) : null;
}

export async function obtenerOrdenPorPaymentIntent(
  paymentIntentId: string
): Promise<OrdenDetalleRow | null> {
  const fila = await prisma.orden.findFirst({
    where: { stripe_payment_intent_id: paymentIntentId },
    include: ordenInclude,
  });
  return fila ? aOrden(fila) : null;
}

export async function listarOrdenesPorComprador(compradorId: number): Promise<OrdenDetalleRow[]> {
  const filas = await prisma.orden.findMany({
    where: { comprador_id: compradorId },
    orderBy: { creada_en: "desc" },
    include: ordenInclude,
  });
  return filas.map(aOrden);
}

export async function listarOrdenesDeEvento(eventoId: number): Promise<OrdenDetalleRow[]> {
  const filas = await prisma.orden.findMany({
    where: { evento_id: eventoId },
    orderBy: { creada_en: "desc" },
    include: ordenInclude,
  });
  return filas.map(aOrden);
}

/** Límite antiabuso: máximo de órdenes por correo/IP en 10 minutos. */
export async function contarOrdenesRecientes(correo: string, ip: string | null): Promise<number> {
  const desde = new Date(Date.now() - 10 * 60 * 1000);
  return prisma.orden.count({
    where: {
      creada_en: { gte: desde },
      OR: [{ correo_comprador: correo }, ...(ip ? [{ ip }] : [])],
    },
  });
}

export interface EntradaConEvento extends EntradaRow {
  orden_codigo: string;
  evento: {
    id_evento: number;
    titulo: string;
    tipo: string;
    facultad: string | null;
    autor_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string;
    es_virtual: boolean;
  };
}

const entradaConEventoInclude = {
  orden: { select: { codigo: true } },
  evento: {
    select: {
      id_evento: true,
      titulo: true,
      tipo: true,
      facultad: true,
      autor_id: true,
      fecha_inicio: true,
      fecha_fin: true,
      lugar: true,
      es_virtual: true,
    },
  },
} satisfies Prisma.EntradaInclude;

type EntradaConEventoBD = Prisma.EntradaGetPayload<{ include: typeof entradaConEventoInclude }>;

function aEntradaConEvento(e: EntradaConEventoBD): EntradaConEvento {
  return {
    ...aEntrada(e),
    orden_codigo: e.orden.codigo,
    evento: {
      ...e.evento,
      fecha_inicio: e.evento.fecha_inicio.toISOString(),
      fecha_fin: e.evento.fecha_fin.toISOString(),
    },
  };
}

export type ResultadoValidacion =
  | { ok: true; entrada: EntradaConEvento }
  | { ok: false; motivo: string; entrada: EntradaConEvento | null };

/** Consulta sin efectos secundarios (para verificar permisos antes de validar). */
export async function obtenerEntradaPorCodigo(codigo: string): Promise<EntradaConEvento | null> {
  const entrada = await prisma.entrada.findUnique({
    where: { codigo },
    include: entradaConEventoInclude,
  });
  return entrada ? aEntradaConEvento(entrada) : null;
}

export async function validarEntrada(codigo: string, validadorId: number): Promise<ResultadoValidacion> {
  const entrada = await prisma.entrada.findUnique({
    where: { codigo },
    include: entradaConEventoInclude,
  });
  if (!entrada) return { ok: false, motivo: "Entrada no encontrada", entrada: null };

  if (entrada.estado === "USADA") {
    return {
      ok: false,
      motivo: `Esta entrada ya fue usada${entrada.usada_en ? ` el ${entrada.usada_en.toLocaleString("es-CO", { timeZone: "America/Bogota" })}` : ""}`,
      entrada: aEntradaConEvento(entrada),
    };
  }
  if (entrada.estado === "ANULADA") {
    return { ok: false, motivo: "Esta entrada fue anulada", entrada: aEntradaConEvento(entrada) };
  }

  const cambio = await prisma.entrada.updateMany({
    where: { id_entrada: entrada.id_entrada, estado: "VALIDA" },
    data: { estado: "USADA", usada_en: new Date(), validada_por_id: validadorId },
  });
  if (cambio.count === 0) {
    const actual = await prisma.entrada.findUnique({
      where: { id_entrada: entrada.id_entrada },
      include: entradaConEventoInclude,
    });
    return {
      ok: false,
      motivo: "La entrada cambió de estado mientras se validaba; intenta de nuevo",
      entrada: actual ? aEntradaConEvento(actual) : null,
    };
  }

  const actualizada = await prisma.entrada.findUniqueOrThrow({
    where: { id_entrada: entrada.id_entrada },
    include: entradaConEventoInclude,
  });
  return { ok: true, entrada: aEntradaConEvento(actualizada) };
}

export async function anularEntradasDeOrden(ordenId: number): Promise<void> {
  await prisma.entrada.updateMany({
    where: { orden_id: ordenId, estado: { in: ["VALIDA", "USADA"] } },
    data: { estado: "ANULADA" },
  });
}

export async function marcarOrdenReembolsada(ordenId: number): Promise<OrdenDetalleRow | null> {
  const fila = await transaccion(async (tx) => {
    const orden = await tx.orden.findUnique({
      where: { id_orden: ordenId },
      include: { items: true },
    });
    if (!orden || orden.estado !== "PAGADA") return null;

    const cambio = await tx.orden.updateMany({
      where: { id_orden: ordenId, estado: "PAGADA" },
      data: { estado: "REEMBOLSADA", reembolsada_en: new Date() },
    });
    if (cambio.count === 0) return null;

    await tx.entrada.updateMany({
      where: { orden_id: ordenId, estado: { in: ["VALIDA", "USADA"] } },
      data: { estado: "ANULADA" },
    });

    for (const item of orden.items) {
      await tx.$executeRaw`
        UPDATE tipo_entrada
        SET cantidad_vendida = GREATEST(cantidad_vendida - ${item.cantidad}, 0)
        WHERE id_tipo_entrada = ${item.tipo_entrada_id}
      `;
    }

    return tx.orden.findUniqueOrThrow({
      where: { id_orden: ordenId },
      include: ordenInclude,
    });
  });

  return fila ? aOrden(fila) : null;
}

export async function eventoStripeExiste(stripeEventId: string): Promise<boolean> {
  const encontrado = await prisma.stripeEvento.findUnique({
    where: { stripe_event_id: stripeEventId },
    select: { id_stripe_evento: true },
  });
  return Boolean(encontrado);
}

export async function registrarEventoStripe(
  stripeEventId: string,
  tipo: string,
  ordenId: number | null,
  payload: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.stripeEvento.create({
      data: { stripe_event_id: stripeEventId, tipo, orden_id: ordenId, payload },
    });
  } catch (e) {
    // P2002 = otro proceso ya lo registró; es idempotente.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
    throw e;
  }
}

/* ── Pasarelas Wompi / Bold ─────────────────────────────────── */

export async function guardarPasarela(
  ordenId: number,
  pasarela: string,
  referencia: string | null
): Promise<void> {
  await prisma.orden.update({
    where: { id_orden: ordenId },
    data: {
      pasarela,
      pasarela_referencia: referencia,
      ...(pasarela === "STRIPE" && referencia ? { stripe_session_id: referencia } : {}),
    },
  });
}

/** Guarda el id de transacción que la pasarela devolvió al retornar (si aún no hay). */
export async function guardarReferenciaSiFalta(ordenId: number, referencia: string): Promise<void> {
  await prisma.orden.updateMany({
    where: { id_orden: ordenId, pasarela_referencia: null },
    data: { pasarela_referencia: referencia },
  });
}

export async function obtenerOrdenPorReferenciaPasarela(
  pasarela: string,
  referencia: string
): Promise<OrdenDetalleRow | null> {
  const fila = await prisma.orden.findFirst({
    where: { pasarela, pasarela_referencia: referencia },
    include: ordenInclude,
  });
  return fila ? aOrden(fila) : null;
}

export async function pagoEventoExiste(pasarela: string, eventoExternoId: string): Promise<boolean> {
  const fila = await prisma.pagoEvento.findUnique({
    where: { pasarela_evento_externo_id: { pasarela, evento_externo_id: eventoExternoId } },
    select: { id_pago_evento: true },
  });
  return Boolean(fila);
}

export async function registrarPagoEvento(
  pasarela: string,
  eventoExternoId: string,
  tipo: string,
  ordenId: number | null,
  payload: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.pagoEvento.create({
      data: { pasarela, evento_externo_id: eventoExternoId, tipo, orden_id: ordenId, payload },
    });
  } catch (e) {
    // Un duplicado concurrente ya quedó registrado: no es un error.
    if ((e as { code?: string }).code !== "P2002") throw e;
  }
}
