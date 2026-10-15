import type { Aviso as AvisoBD } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Repository de avisos — patrón Repository (Fowler).
 */
export interface AvisoRow {
  id_aviso: number;
  titulo: string;
  texto: string;
  fecha: string;
  activo: boolean;
}

export async function listarActivos(): Promise<AvisoRow[]> {
  const filas = await prisma.aviso.findMany({
    where: { activo: true },
    orderBy: { fecha: "desc" },
    take: 3,
  });
  return filas.map((a: AvisoBD) => ({ ...a, fecha: a.fecha.toISOString() }));
}
