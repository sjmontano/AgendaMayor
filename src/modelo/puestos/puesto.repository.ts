import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { PuestoCreateDTO, PuestoUpdateDTO } from "./puesto.dto";

/**
 * Repository de puestos — patrón Repository (Fowler).
 * Cada puesto pertenece a un evento y puede ser ocupado por un proyecto.
 */

export interface PuestoRow {
  id_puesto: number;
  codigo: string;
  edificio: string;
  piso: number;
  salon: string;
  ubicacion: string;
  estado: string;
  evento_id: number;
  proyecto_id: number | null;
}

export async function listar(): Promise<PuestoRow[]> {
  return prisma.puesto.findMany({ orderBy: { codigo: "asc" } });
}

export async function listarPorEvento(eventoId: number): Promise<PuestoRow[]> {
  return prisma.puesto.findMany({
    where: { evento_id: eventoId },
    orderBy: { codigo: "asc" },
  });
}

export async function buscarPorProyecto(proyectoId: number): Promise<PuestoRow | null> {
  return prisma.puesto.findFirst({ where: { proyecto_id: proyectoId } });
}

export async function buscarPorId(id: number): Promise<PuestoRow | null> {
  return prisma.puesto.findUnique({ where: { id_puesto: id } });
}

export async function crear(datos: PuestoCreateDTO): Promise<PuestoRow> {
  return prisma.puesto.create({
    data: {
      codigo: datos.codigo,
      edificio: datos.edificio,
      piso: datos.piso,
      salon: datos.salon,
      ubicacion: datos.ubicacion,
      evento_id: datos.eventoId,
      proyecto_id: datos.proyectoId ?? null,
      estado: datos.proyectoId ? "OCUPADO" : "DISPONIBLE",
    },
  });
}

export async function actualizar(id: number, datos: PuestoUpdateDTO): Promise<PuestoRow> {
  const data: Prisma.PuestoUncheckedUpdateInput = {};

  if (datos.codigo !== undefined) data.codigo = datos.codigo;
  if (datos.edificio !== undefined) data.edificio = datos.edificio;
  if (datos.piso !== undefined) data.piso = datos.piso;
  if (datos.salon !== undefined) data.salon = datos.salon;
  if (datos.ubicacion !== undefined) data.ubicacion = datos.ubicacion;
  if (datos.estado !== undefined) data.estado = datos.estado;
  if (datos.proyectoId !== undefined) data.proyecto_id = datos.proyectoId;

  return prisma.puesto.update({ where: { id_puesto: id }, data });
}

export async function eliminar(id: number): Promise<void> {
  await prisma.puesto.delete({ where: { id_puesto: id } });
}
