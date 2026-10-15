import type { Evento as EventoBD } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EventoQueryDTO } from "./evento.dto";

/**
 * Repository de eventos — patrón Repository (Fowler).
 * Lectura pública de activos + creación (HU-11 / importación RSS).
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
}

function aFila(e: EventoBD): EventoRow {
  return {
    ...e,
    fecha_inicio: e.fecha_inicio.toISOString(),
    fecha_fin: e.fecha_fin.toISOString(),
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
}

export async function crear(datos: EventoCrear): Promise<EventoRow> {
  const fila = await prisma.evento.create({ data: { ...datos, activo: true } });
  return aFila(fila);
}

/** Cuenta eventos con un título exacto (idempotencia de la importación RSS). */
export async function contarPorTitulo(titulo: string): Promise<number> {
  return prisma.evento.count({ where: { titulo } });
}
