import { z } from 'zod';

/**
 * DTO de usuarios — patrón Data Transfer Object.
 * Nunca se expone la fila de BD tal cual (ISO 25010 → Confidencialidad).
 */

/**
 * Regla de dominio pura: solo correos institucionales publican.
 * Vive aquí (no en el adapter) porque no depende de ningún SDK.
 */
export function esCorreoInstitucional(email: string): boolean {
  return email.toLowerCase().endsWith('@unimayor.edu.co');
}

export const PerfilUpdateSchema = z.object({
  nombre: z.string().min(1).max(50).optional(),
  apellido: z.string().min(1).max(50).optional(),
  facultad: z.string().max(100).optional(),
  programa: z.string().max(100).optional(),
  semestre: z.number().int().min(1).max(10).optional(),
  semillero: z.string().max(100).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().url().max(255).optional(),
});

export type PerfilUpdateDTO = z.infer<typeof PerfilUpdateSchema>;

export const RegistroSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo'),
  nombre: z.string().min(1).max(50),
  apellido: z.string().min(1).max(50),
  facultad: z.string().max(100).optional(),
  programa: z.string().max(100).optional(),
  semestre: z.number().int().min(1).max(10).optional(),
});

export type RegistroDTO = z.infer<typeof RegistroSchema>;

/** Respuesta pública de perfil (sin datos sensibles) */
export interface PerfilPublico {
  username: string;
  nombre: string;
  apellido: string;
  facultad: string | null;
  programa: string | null;
  semestre: number | null;
  semillero: string | null;
  bio: string | null;
  avatar: string | null;
  rol: string;
}
