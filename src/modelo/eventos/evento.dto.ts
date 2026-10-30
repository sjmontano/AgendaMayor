import { z } from "zod";

/**
 * DTO de eventos — patrón Data Transfer Object.
 */
export const EventoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type EventoQueryDTO = z.infer<typeof EventoQuerySchema>;

export const TIPOS_EVENTO = ["OFICIAL", "EAFI", "COMUNIDAD"] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

/** Un tipo de entrada que se vende para el evento (precio en pesos; 0 = gratis). */
export const TipoEntradaSchema = z.object({
  nombre: z.string().min(1).max(80),
  precio: z.number().int().min(0).max(5_000_000),
  cantidad: z.number().int().min(1).max(5000),
});

export const EventoCreateSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1),
  tipo: z.enum(TIPOS_EVENTO),
  fechaInicio: z.string().datetime({ offset: true }),
  fechaFin: z.string().datetime({ offset: true }),
  lugar: z.string().min(1).max(100).optional(),
  esVirtual: z.boolean().default(false),
  urlVirtual: z.string().url().max(255).optional(),
  facultad: z.string().max(100).optional(),
  edicion: z.string().max(50).optional(),
  imagen: z.string().url().max(255).optional(),
  // Taquilla (opcional): si trae tipos de entrada, el evento vende entradas
  tiposEntrada: z.array(TipoEntradaSchema).max(5).default([]),
  maxPorCompra: z.number().int().min(1).max(10).default(6),
});

export type EventoCreateDTO = z.infer<typeof EventoCreateSchema>;
