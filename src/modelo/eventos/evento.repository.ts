import type { Evento as EventoBD } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EventoQueryDTO } from "./evento.dto";

/**
 * Repository de eventos — patrón Repository (Fowler).
 * Lectura pública de activos, detalle con sus entradas y creación
 * (HU-11 / importación RSS).
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
  permite_entradas: boolean;
  max_por_compra: number;
}

export interface TipoEntradaRow {
  id_tipo_entrada: number;
  nombre: string;
  precio: number; // en pesos
  disponibles: number;
}

export interface EventoDetalleRow extends EventoRow {
  autor: { username: string; nombre: string; apellido: string };
  tiposEntrada: TipoEntradaRow[];
}

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
    permite_entradas: e.permite_entradas,
    max_por_compra: e.max_por_compra,
  };
}

export async function listarActivos(
  filtros: EventoQueryDTO
): Promise<{ data: EventoRow[]; total: number }> {
  const where = { activo: true };
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

/** Próximos eventos (que no han terminado) para la página de inicio. */
export async function listarProximos(cantidad: number): Promise<EventoRow[]> {
  const filas = await prisma.evento.findMany({
    where: { activo: true, fecha_fin: { gte: new Date() } },
    orderBy: { fecha_inicio: "asc" },
    take: cantidad,
  });
  return filas.map(aFila);
}

/** Eventos EAFI activos (para asociar proyectos y puestos). */
export async function listarEafi(): Promise<EventoRow[]> {
  const filas = await prisma.evento.findMany({
    where: { activo: true, tipo: "EAFI" },
    orderBy: { fecha_inicio: "desc" },
  });
  return filas.map(aFila);
}

/** Detalle del evento con su autor y los tipos de entrada a la venta. */
export async function buscarDetalle(id: number): Promise<EventoDetalleRow | null> {
  const fila = await prisma.evento.findFirst({
    where: { id_evento: id, activo: true },
    include: {
      autor: { select: { username: true, nombre: true, apellido: true } },
      tiposEntrada: { where: { activo: true }, orderBy: { precio_centavos: "asc" } },
    },
  });
  if (!fila) return null;

  return {
    ...aFila(fila),
    autor: fila.autor,
    tiposEntrada: fila.tiposEntrada.map((t) => ({
      id_tipo_entrada: t.id_tipo_entrada,
      nombre: t.nombre,
      precio: t.precio_centavos / 100,
      disponibles: Math.max(0, t.cantidad_total - t.cantidad_vendida),
    })),
  };
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
  max_por_compra?: number;
  tiposEntrada?: { nombre: string; precio: number; cantidad: number }[];
}

/** Crea el evento y, si los trae, sus tipos de entrada (en una sola operación). */
export async function crear(datos: EventoCrear): Promise<EventoRow> {
  const { tiposEntrada = [], ...evento } = datos;
  const fila = await prisma.evento.create({
    data: {
      ...evento,
      activo: true,
      permite_entradas: tiposEntrada.length > 0,
      tiposEntrada: {
        create: tiposEntrada.map((t) => ({
          nombre: t.nombre,
          precio_centavos: t.precio * 100,
          cantidad_total: t.cantidad,
        })),
      },
    },
  });
  return aFila(fila);
}

/** Cuenta eventos con un título exacto (idempotencia de la importación RSS). */
export async function contarPorTitulo(titulo: string): Promise<number> {
  return prisma.evento.count({ where: { titulo } });
}
