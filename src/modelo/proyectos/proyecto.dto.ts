import { z } from 'zod';

/**
 * DTO de proyectos — patrón Data Transfer Object.
 * Validación con Zod antes de llegar a la BD.
 */

export const ProyectoCreateSchema = z.object({
  titulo: z.string().min(1).max(100),
  descripcion: z.string().min(1).max(5000),
  facultad: z.string().min(1).max(100),
  programa: z.string().min(1).max(100),
  tipo: z.enum(['INSTITUCIONAL', 'EAFI', 'COMUNIDAD']),
  fotos: z.array(z.string().url()).max(10).default([]),
  eventoOrigenId: z.number().int().optional(),
  docenteAvalId: z.number().int().optional(),
});

export type ProyectoCreateDTO = z.infer<typeof ProyectoCreateSchema>;

export const ProyectoUpdateSchema = z.object({
  titulo: z.string().min(1).max(100).optional(),
  descripcion: z.string().min(1).max(5000).optional(),
  facultad: z.string().min(1).max(100).optional(),
  programa: z.string().min(1).max(100).optional(),
  tipo: z.enum(['INSTITUCIONAL', 'EAFI', 'COMUNIDAD']).optional(),
  fotos: z.array(z.string().url()).max(10).optional(),
  destacado: z.boolean().optional(),
  // Estados internos (usado por service/repository)
  estado: z.enum(['BORRADOR', 'EN_REVISION', 'PUBLICADO', 'RECHAZADO', 'ELIMINADO']).optional(),
  motivoRechazo: z.string().max(500).optional(),
});

export type ProyectoUpdateDTO = z.infer<typeof ProyectoUpdateSchema>;

export const ProyectoQuerySchema = z.object({
  facultad: z.string().optional(),
  tipo: z.enum(['INSTITUCIONAL', 'EAFI', 'COMUNIDAD']).optional(),
  q: z.string().optional(),
  autor: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProyectoQueryDTO = z.infer<typeof ProyectoQuerySchema>;
