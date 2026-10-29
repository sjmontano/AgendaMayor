import { Prisma, type Evento as EventoBD, type TipoEntrada as TipoEntradaBD } from "@prisma/client";
import { prisma } from "@/lib/db";

const TX_OPTS = { maxWait: 15_000, timeout: 30_000 } as const;

function transaccion<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn, TX_OPTS);
}
import type { EventoQueryDTO } from "./evento.dto";

/**
 * Repository de eventos — patrón Repository (Fowler).
 * Lectura pública de publicados + creación/edición con taquilla.
 */
export interface EventoRow {
  id_evento: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  es_virtual: boolean;
  url_virtual: string | null;
  facultad: string | null;
  edicion: string | null;
  imagen: string | null;
  activo: boolean;
  estado: string;
  permite_entradas: boolean;
  aforo: number | null;
  max_por_compra: number;
  venta_inicio: string | null;
  venta_fin: string | null;
  politica_devolucion: string | null;
  url_acceso_privado: string | null;
  motivo_cancelacion: string | null;
  publicado_en: string | null;
  autor_id: number;
}

export interface TipoEntradaRow {
  id_tipo_entrada: number;
  evento_id: number;
  nombre: string;
  descripcion: string | null;
  precio_centavos: number;
  cantidad_total: number;
  cantidad_vendida: number;
  cantidad_reservada: number;
  activo: boolean;
  creado_en: string;
}

export interface EventoDetalleRow extends EventoRow {
  autor: {
    id_usuario: number;
    username: string;
    nombre: string;
    apellido: string;
    facultad: string | null;
    avatar: string | null;
  };
  tipos_entrada: TipoEntradaRow[];
}

const autorSelect = {
  id_usuario: true,
  username: true,
  nombre: true,
  apellido: true,
  facultad: true,
  avatar: true,
} satisfies Prisma.UsuarioSelect;

type EventoConRelaciones = Prisma.EventoGetPayload<{
  include: {
    autor: { select: typeof autorSelect };
    tiposEntrada: true;
  };
}>;

function aFila(e: EventoBD): EventoRow {
  return {
    id_evento: e.id_evento,
    titulo: e.titulo,
    descripcion: e.descripcion,
    tipo: e.tipo,
    fecha_inicio: e.fecha_inicio.toISOString(),
    fecha_fin: e.fecha_fin.toISOString(),
    lugar: e.lugar,
    es_virtual: e.es_virtual,
    url_virtual: e.url_virtual,
    facultad: e.facultad,
    edicion: e.edicion,
    imagen: e.imagen,
    activo: e.activo,
    estado: e.estado,
    permite_entradas: e.permite_entradas,
    aforo: e.aforo,
    max_por_compra: e.max_por_compra,
    venta_inicio: e.venta_inicio?.toISOString() ?? null,
    venta_fin: e.venta_fin?.toISOString() ?? null,
    politica_devolucion: e.politica_devolucion,
    url_acceso_privado: e.url_acceso_privado,
    motivo_cancelacion: e.motivo_cancelacion,
    publicado_en: e.publicado_en?.toISOString() ?? null,
    autor_id: e.autor_id,
  };
}

function aTipo(t: TipoEntradaBD): TipoEntradaRow {
  return {
    id_tipo_entrada: t.id_tipo_entrada,
    evento_id: t.evento_id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    precio_centavos: t.precio_centavos,
    cantidad_total: t.cantidad_total,
    cantidad_vendida: t.cantidad_vendida,
    cantidad_reservada: t.cantidad_reservada,
    activo: t.activo,
    creado_en: t.creado_en.toISOString(),
  };
}

function aDetalle(e: EventoConRelaciones): EventoDetalleRow {
  return {
    ...aFila(e),
    autor: e.autor,
    tipos_entrada: e.tiposEntrada.map(aTipo),
  };
}

export async function listarActivos(
  filtros: EventoQueryDTO
): Promise<{ data: EventoRow[]; total: number }> {
  const where: Prisma.EventoWhereInput = { activo: true, estado: "PUBLICADO" };
  const [filas, total] = await Promise.all([
    prisma.evento.findMany({
      where,
      orderBy: { fecha_inicio: "asc" },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    }),
    prisma.evento.count({ where }),
  ]);

  return { data: filas.map(aFila), total };
}

export interface TipoEntradaCrear {
  nombre: string;
  descripcion: string | null;
  precio_centavos: number;
  cantidad_total: number;
}

export interface EventoCrear {
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  es_virtual: boolean;
  url_virtual: string | null;
  facultad: string | null;
  edicion: string | null;
  imagen: string | null;
  autor_id: number;
  /** Campos de taquilla opcionales para no romper la importación del RSS. */
  estado?: string;
  permite_entradas?: boolean;
  aforo?: number | null;
  max_por_compra?: number;
  venta_inicio?: string | null;
  venta_fin?: string | null;
  politica_devolucion?: string | null;
  url_acceso_privado?: string | null;
}

export async function crear(
  datos: EventoCrear,
  tipos: TipoEntradaCrear[] = []
): Promise<EventoDetalleRow> {
  const estado = datos.estado ?? "PUBLICADO";
  const fila = await transaccion(async (tx) => {
    const evento = await tx.evento.create({
      data: {
        ...datos,
        estado,
        permite_entradas: datos.permite_entradas ?? tipos.length > 0,
        aforo: datos.aforo ?? null,
        max_por_compra: datos.max_por_compra ?? 6,
        venta_inicio: datos.venta_inicio ?? null,
        venta_fin: datos.venta_fin ?? null,
        politica_devolucion: datos.politica_devolucion ?? null,
        url_acceso_privado: datos.url_acceso_privado ?? null,
        activo: true,
        publicado_en: estado === "PUBLICADO" ? new Date() : null,
      },
    });

    if (tipos.length > 0) {
      await tx.tipoEntrada.createMany({
        data: tipos.map((t) => ({ ...t, evento_id: evento.id_evento })),
      });
    }

    return tx.evento.findUniqueOrThrow({
      where: { id_evento: evento.id_evento },
      include: {
        autor: { select: autorSelect },
        tiposEntrada: { orderBy: { id_tipo_entrada: "asc" } },
      },
    });
  });

  return aDetalle(fila);
}

export async function obtenerPorId(id: number): Promise<EventoDetalleRow | null> {
  const fila = await prisma.evento.findUnique({
    where: { id_evento: id },
    include: {
      autor: { select: autorSelect },
      tiposEntrada: { orderBy: { id_tipo_entrada: "asc" } },
    },
  });
  return fila ? aDetalle(fila) : null;
}

/** Eventos de un organizador (todos si se omite el id, para ADMIN). */
export async function listarPorAutor(autorId?: number): Promise<EventoDetalleRow[]> {
  const filas = await prisma.evento.findMany({
    where: autorId ? { autor_id: autorId } : undefined,
    orderBy: [{ fecha_inicio: "desc" }, { id_evento: "desc" }],
    include: {
      autor: { select: autorSelect },
      tiposEntrada: { orderBy: { id_tipo_entrada: "asc" } },
    },
  });
  return filas.map(aDetalle);
}

export interface EventoActualizar {
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  lugar?: string;
  es_virtual?: boolean;
  url_virtual?: string | null;
  facultad?: string | null;
  edicion?: string | null;
  imagen?: string | null;
  estado?: string;
  aforo?: number | null;
  max_por_compra?: number;
  venta_inicio?: string | null;
  venta_fin?: string | null;
  politica_devolucion?: string | null;
  url_acceso_privado?: string | null;
  motivo_cancelacion?: string | null;
  publicado_en?: Date | null;
}

export async function actualizar(id: number, datos: EventoActualizar): Promise<EventoDetalleRow> {
  const fila = await prisma.evento.update({
    where: { id_evento: id },
    data: datos,
    include: {
      autor: { select: autorSelect },
      tiposEntrada: { orderBy: { id_tipo_entrada: "asc" } },
    },
  });
  return aDetalle(fila);
}

/** Cuenta eventos con un título exacto (idempotencia de la importación RSS). */
export async function contarPorTitulo(titulo: string): Promise<number> {
  return prisma.evento.count({ where: { titulo } });
}

/**
 * Anula las entradas aún no usadas de un evento cancelado. Las ya usadas se
 * conservan como registro de acceso; el control de puerta igual las rechaza.
 */
export async function anularEntradasDeEvento(eventoId: number): Promise<number> {
  const resultado = await prisma.entrada.updateMany({
    where: { evento_id: eventoId, estado: "VALIDA" },
    data: { estado: "ANULADA" },
  });
  return resultado.count;
}
