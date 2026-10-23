import { prisma } from "@/lib/db";

/**
 * Repository de notificaciones — patrón Repository.
 * El Service notifica sin conocer la BD.
 */
export async function crear(
  usuarioId: number,
  mensaje: string,
  proyectoId: number | null
): Promise<void> {
  await prisma.notificacion.create({
    data: { mensaje, usuario_id: usuarioId, proyecto_id: proyectoId },
  });
}

export interface NotificacionRow {
  id_notificacion: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  proyecto_id: number | null;
}

export async function listarPorUsuario(usuarioId: number): Promise<NotificacionRow[]> {
  const filas = await prisma.notificacion.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { fecha: "desc" },
    take: 50,
    select: {
      id_notificacion: true,
      mensaje: true,
      fecha: true,
      leida: true,
      proyecto_id: true,
    },
  });
  return filas.map((n) => ({ ...n, fecha: n.fecha.toISOString() }));
}

export async function marcarTodasLeidas(usuarioId: number): Promise<number> {
  const r = await prisma.notificacion.updateMany({
    where: { usuario_id: usuarioId, leida: false },
    data: { leida: true },
  });
  return r.count;
}

export async function marcarLeida(id: number, usuarioId: number): Promise<void> {
  await prisma.notificacion.updateMany({
    where: { id_notificacion: id, usuario_id: usuarioId },
    data: { leida: true },
  });
}
