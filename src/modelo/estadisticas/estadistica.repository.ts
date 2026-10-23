import { prisma } from "@/lib/db";

/**
 * Repository de estadísticas — agregados de solo lectura para la landing
 * y el panel (conteos por facultad, por estado y actividad diaria).
 */

export interface ConteoEtiqueta {
  etiqueta: string;
  total: number;
}

export async function contarPublicadosPorFacultad(): Promise<ConteoEtiqueta[]> {
  const filas = await prisma.proyecto.groupBy({
    by: ["facultad"],
    where: { estado: "PUBLICADO" },
    _count: { _all: true },
  });
  return filas
    .map((f) => ({ etiqueta: f.facultad, total: f._count._all }))
    .sort((a, b) => b.total - a.total);
}

export async function contarPorEstado(filtro: { autorId?: number; facultad?: string | null } = {}) {
  const filas = await prisma.proyecto.groupBy({
    by: ["estado"],
    where: {
      estado: { not: "ELIMINADO" },
      ...(filtro.autorId ? { autor_id: filtro.autorId } : {}),
      ...(filtro.facultad ? { facultad: filtro.facultad } : {}),
    },
    _count: { _all: true },
  });
  const base: Record<string, number> = { BORRADOR: 0, EN_REVISION: 0, PUBLICADO: 0, RECHAZADO: 0 };
  for (const f of filas) base[f.estado] = f._count._all;
  return base;
}

/** Proyectos registrados por día en los últimos `dias` (incluye hoy), con ceros. */
export async function registrosPorDia(dias: number, filtro: { facultad?: string | null } = {}) {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const filas = await prisma.proyecto.groupBy({
    by: ["fecha_registro"],
    where: {
      fecha_registro: { gte: desde },
      estado: { not: "ELIMINADO" },
      ...(filtro.facultad ? { facultad: filtro.facultad } : {}),
    },
    _count: { _all: true },
  });

  const mapa = new Map(filas.map((f) => [f.fecha_registro.toISOString().slice(0, 10), f._count._all]));
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(desde);
    d.setDate(desde.getDate() + i);
    const clave = d.toISOString().slice(0, 10);
    return { fecha: clave, total: mapa.get(clave) ?? 0 };
  });
}

export async function totalesGenerales() {
  const [publicados, eventos, estudiantes, docentes] = await Promise.all([
    prisma.proyecto.count({ where: { estado: "PUBLICADO" } }),
    prisma.evento.count({ where: { activo: true } }),
    prisma.usuario.count({ where: { rolRef: { nombre: "ESTUDIANTE" }, estado: true } }),
    prisma.usuario.count({ where: { rolRef: { nombre: "DOCENTE" }, estado: true } }),
  ]);
  return { publicados, eventos, estudiantes, docentes };
}

export async function contarNotificacionesSinLeer(usuarioId: number) {
  return prisma.notificacion.count({ where: { usuario_id: usuarioId, leida: false } });
}
