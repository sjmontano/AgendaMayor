import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { PerfilUpdateDTO } from "./usuario.dto";

/**
 * Repository de usuarios — patrón Repository (Fowler).
 * Aísla el acceso a BD (Postgres vía Prisma) de la lógica de negocio.
 */

export interface UsuarioRow {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: number;
  facultad: string | null;
  programa: string | null;
  semestre: number | null;
  semillero: string | null;
  bio: string | null;
  avatar: string | null;
  estado: boolean;
}

export interface UsuarioConHash extends UsuarioRow {
  contrasena_hash: string;
}

/** Proyección pública: nunca incluye contrasena_hash. */
const CAMPOS_PUBLICOS = {
  id_usuario: true,
  username: true,
  nombre: true,
  apellido: true,
  correo: true,
  rol: true,
  facultad: true,
  programa: true,
  semestre: true,
  semillero: true,
  bio: true,
  avatar: true,
  estado: true,
} satisfies Prisma.UsuarioSelect;

export async function buscarPorId(id: number): Promise<UsuarioRow | null> {
  return prisma.usuario.findUnique({ where: { id_usuario: id }, select: CAMPOS_PUBLICOS });
}

export async function buscarPorUsername(username: string): Promise<UsuarioRow | null> {
  return prisma.usuario.findFirst({
    where: { username, estado: true },
    select: CAMPOS_PUBLICOS,
  });
}

/** Solo para el login: necesita el hash para compararlo. */
export async function buscarPorCorreoConHash(correo: string): Promise<UsuarioConHash | null> {
  return prisma.usuario.findUnique({
    where: { correo },
    select: { ...CAMPOS_PUBLICOS, contrasena_hash: true },
  });
}

export async function crear(datos: {
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasenaHash: string;
  facultad?: string;
  programa?: string;
  semestre?: number;
  rol?: number;
}): Promise<UsuarioRow> {
  // Si no se especifica rol, buscar ESTUDIANTE
  let rolId = datos.rol;
  if (!rolId) {
    const rol = await prisma.rol.findUnique({
      where: { nombre: "ESTUDIANTE" },
      select: { id_rol: true },
    });
    rolId = rol?.id_rol ?? 1;
  }

  return prisma.usuario.create({
    data: {
      username: datos.username,
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      contrasena_hash: datos.contrasenaHash,
      rol: rolId,
      facultad: datos.facultad ?? null,
      programa: datos.programa ?? null,
      semestre: datos.semestre ?? null,
    },
    select: CAMPOS_PUBLICOS,
  });
}

export async function actualizarPerfil(id: number, datos: PerfilUpdateDTO): Promise<UsuarioRow> {
  return prisma.usuario.update({
    where: { id_usuario: id },
    data: datos,
    select: CAMPOS_PUBLICOS,
  });
}

export async function existeUsername(username: string): Promise<boolean> {
  const total = await prisma.usuario.count({ where: { username } });
  return total > 0;
}

export async function existeCorreo(correo: string): Promise<boolean> {
  const total = await prisma.usuario.count({ where: { correo } });
  return total > 0;
}
