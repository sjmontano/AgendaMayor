import { z } from "zod";

/**
 * DTO de eventos — patrón Data Transfer Object.
 */
export const EventoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type EventoQueryDTO = z.infer<typeof EventoQuerySchema>;

export const EventoCreateSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1),
  tipo: z.enum(["OFICIAL", "EAFI", "COMUNIDAD"]),
  fechaInicio: z.string().datetime({ offset: true }),
  fechaFin: z.string().datetime({ offset: true }),
  lugar: z.string().min(1).max(100).optional(),
  esVirtual: z.boolean().default(false),
  urlVirtual: z.string().url().max(255).optional(),
  facultad: z.string().max(100).optional(),
  edicion: z.string().max(50).optional(),
  imagen: z.string().url().max(255).optional(),
});

export type EventoCreateDTO = z.infer<typeof EventoCreateSchema>;
