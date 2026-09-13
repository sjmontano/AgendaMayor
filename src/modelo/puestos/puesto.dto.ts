import { z } from 'zod';

/**
 * DTO de puestos — patrón Data Transfer Object.
 * Ubicación física de proyectos en ferias EAFI.
 * Cada puesto pertenece a un evento y puede ser ocupado por un proyecto.
 */

export const PuestoCreateSchema = z.object({
  codigo: z.string().min(1).max(20),
  edificio: z.string().min(1).max(100),
  piso: z.number().int().min(0).max(10),
  salon: z.string().min(1).max(100),
  ubicacion: z.string().min(1).max(200),
  eventoId: z.number().int(),
  proyectoId: z.number().int().optional(),
});

export type PuestoCreateDTO = z.infer<typeof PuestoCreateSchema>;

export const PuestoUpdateSchema = z.object({
  codigo: z.string().min(1).max(20).optional(),
  edificio: z.string().min(1).max(100).optional(),
  piso: z.number().int().min(0).max(10).optional(),
  salon: z.string().min(1).max(100).optional(),
  ubicacion: z.string().min(1).max(200).optional(),
  estado: z.enum(['DISPONIBLE', 'OCUPADO', 'RESERVADO']).optional(),
  proyectoId: z.number().int().nullable().optional(),
});

export type PuestoUpdateDTO = z.infer<typeof PuestoUpdateSchema>;
