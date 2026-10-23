import { Prisma } from "@prisma/client";
import type { Proyecto as ProyectoDB } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ProyectoCreateDTO, ProyectoUpdateDTO, ProyectoQueryDTO } from "./proyecto.dto";

/**
 * Repository de proyectos — patrón Repository (Fowler).
 * Aísla la BD (Postgres vía Prisma) de la lógica de negocio.
 */

export interface ProyectoRow {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  fotos: string[];
  facultad: string;
  programa: string;
  tipo: string;
  estado: string;
  evento_origen_id: number | null;
  docente_aval_id: number | null;
  motivo_rechazo: string | null;
  autor_id: number;
  destacado: boolean;
  fecha_registro: string;
  // Join
  autor?: { username: string; nombre: string; apellido: string; avatar: string | null } | null;
}

const INCLUDE_AUTOR = {
  autor: { select: { username: true, nombre: true, apellido: true, avatar: true } },
} satisfies Prisma.ProyectoInclude;

type ProyectoCrudo = ProyectoDB & { autor?: ProyectoRow["autor"] };

/**
 * Normaliza `fotos` a string[].
 * Las filas creadas con doble codificación (string en vez de arreglo jsonb)
 * se parsean aquí para no romper las vistas.
 */
function normalizarFotos(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.filter((f): f is string => typeof f === "string");
  if (typeof valor === "string") {
    if (!valor) return [];
    try {
      const parsed: unknown = JSON.parse(valor);
      if (Array.isArray(parsed)) return parsed.filter((f): f is string => typeof f === "string");
      return [valor];
    } catch {
      return [valor];
    }
  }
  return [];
}

/** Convierte la fila de Prisma al contrato de la API (fecha como ISO). */
function aFila(p: ProyectoCrudo): ProyectoRow {
  return {
    ...p,
    fotos: normalizarFotos(p.fotos),
    fecha_registro: p.fecha_registro.toISOString(),
  };
}

export async function listarPublicados(
  filtros: ProyectoQueryDTO
): Promise<{ data: ProyectoRow[]; total: number }> {
  const where: Prisma.ProyectoWhereInput = { estado: "PUBLICADO" };

  if (filtros.facultad) where.facultad = filtros.facultad;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.autor) where.autor = { username: filtros.autor };
  if (filtros.q) {
    where.OR = [
      { titulo: { contains: filtros.q, mode: "insensitive" } },
      { descripcion: { contains: filtros.q, mode: "insensitive" } },
    ];
  }

  const [filas, total] = await Promise.all([
    prisma.proyecto.findMany({
      where,
      include: INCLUDE_AUTOR,
      orderBy: { fecha_registro: "desc" },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    }),
    prisma.proyecto.count({ where }),
  ]);

  return { data: filas.map(aFila), total };
}

/** Cola de moderación: por estado y (opcional) facultad. */
export async function listarPorEstado(
  estado: string,
  facultad?: string | null
): Promise<ProyectoRow[]> {
  const filas = await prisma.proyecto.findMany({
    where: { estado, ...(facultad ? { facultad } : {}) },
    include: INCLUDE_AUTOR,
    orderBy: { fecha_registro: "desc" },
  });
  return filas.map(aFila);
}

export async function buscarPorId(id: number): Promise<ProyectoRow | null> {
  const fila = await prisma.proyecto.findUnique({
    where: { id_proyecto: id },
    include: INCLUDE_AUTOR,
  });
  return fila ? aFila(fila) : null;
}

export async function crear(datos: ProyectoCreateDTO, autorId: number): Promise<ProyectoRow> {
  const fila = await prisma.proyecto.create({
    data: {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      facultad: datos.facultad,
      programa: datos.programa,
      tipo: datos.tipo,
      fotos: datos.fotos ?? [],
      evento_origen_id: datos.eventoOrigenId ?? null,
      autor_id: autorId,
      estado: "EN_REVISION",
    },
  });
  return aFila(fila);
}

export async function actualizar(id: number, datos: ProyectoUpdateDTO): Promise<ProyectoRow> {
  const updatePayload: Prisma.ProyectoUncheckedUpdateInput = {};

  if (datos.titulo !== undefined) updatePayload.titulo = datos.titulo;
  if (datos.descripcion !== undefined) updatePayload.descripcion = datos.descripcion;
  if (datos.facultad !== undefined) updatePayload.facultad = datos.facultad;
  if (datos.programa !== undefined) updatePayload.programa = datos.programa;
  if (datos.tipo !== undefined) updatePayload.tipo = datos.tipo;
  if (datos.fotos !== undefined) updatePayload.fotos = datos.fotos;
  if (datos.destacado !== undefined) updatePayload.destacado = datos.destacado;
  if (datos.estado !== undefined) updatePayload.estado = datos.estado;
  if (datos.motivoRechazo !== undefined) updatePayload.motivo_rechazo = datos.motivoRechazo;

  const fila = await prisma.proyecto.update({
    where: { id_proyecto: id },
    data: updatePayload,
  });
  return aFila(fila);
}

/** Todos los proyectos del autor (cualquier estado salvo ELIMINADO) — panel del estudiante. */
export async function listarPorAutor(autorId: number): Promise<ProyectoRow[]> {
  const filas = await prisma.proyecto.findMany({
    where: { autor_id: autorId, estado: { not: "ELIMINADO" } },
    include: INCLUDE_AUTOR,
    orderBy: [{ fecha_registro: "desc" }, { id_proyecto: "desc" }],
  });
  return filas.map(aFila);
}

export async function contarPorAutor(autorId: number): Promise<number> {
  return prisma.proyecto.count({ where: { autor_id: autorId } });
}
