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

/**
 * Registro con credenciales propias (reemplaza el signUp de Supabase Auth).
 * La contraseña nunca se guarda en claro: se hashea con bcrypt.
 */
export const RegistroSchema = z.object({
  email: z
    .string()
    .email('Correo inválido')
    .refine(esCorreoInstitucional, 'Solo se permiten correos @unimayor.edu.co'),
  password: z.string().min(8, 'La contraseña debe tener mínimo 8 caracteres').max(72),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo'),
  nombre: z.string().min(1).max(50),
  apellido: z.string().min(1).max(50),
  facultad: z.string().max(100).optional(),
  programa: z.string().max(100).optional(),
  semestre: z.number().int().min(1).max(10).optional(),
});

export type RegistroDTO = z.infer<typeof RegistroSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

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
