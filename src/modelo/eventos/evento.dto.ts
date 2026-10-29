import { z } from "zod";

/**
 * DTO de eventos — patrón Data Transfer Object.
 */
export const EventoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type EventoQueryDTO = z.infer<typeof EventoQuerySchema>;

export const TipoEntradaCreateSchema = z.object({
  nombre: z.string().min(1).max(80).default("Entrada general"),
  descripcion: z.string().max(300).optional(),
  /**
   * Precio en pesos colombianos (entero). 0 = entrada gratuita.
   * El tope respeta el máximo por cargo de Stripe (99.999.999 centavos).
   */
  precioCop: z.coerce.number().int().min(0).max(999_999),
  cantidad: z.coerce.number().int().min(1).max(100_000),
});

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

  // Taquilla
  tiposEntrada: z.array(TipoEntradaCreateSchema).max(10).default([]),
  aforo: z.coerce.number().int().min(1).max(100_000).optional(),
  maxPorCompra: z.coerce.number().int().min(1).max(20).default(6),
  ventaInicio: z.string().datetime({ offset: true }).optional(),
  ventaFin: z.string().datetime({ offset: true }).optional(),
  politicaDevolucion: z.string().max(500).optional(),
  /** URL privada para eventos virtuales pagos (no se expone en la API pública). */
  urlAccesoPrivado: z.string().url().max(255).optional(),
});

/**
 * PATCH de evento. Se declara aparte (no con `.partial()`) porque los
 * `default()` del esquema de creación se aplicarían también aquí: un PATCH
 * para cancelar terminaría cambiando `esVirtual` a false y `maxPorCompra` a 6.
 * Las entradas no se editan después de crear el evento.
 */
export const EventoUpdateSchema = z
  .object({
    titulo: z.string().min(1).max(200).optional(),
    descripcion: z.string().min(1).optional(),
    tipo: z.enum(["OFICIAL", "EAFI", "COMUNIDAD"]).optional(),
    fechaInicio: z.string().datetime({ offset: true }).optional(),
    fechaFin: z.string().datetime({ offset: true }).optional(),
    lugar: z.string().min(1).max(100).optional(),
    esVirtual: z.boolean().optional(),
    urlVirtual: z.string().url().max(255).optional(),
    facultad: z.string().max(100).optional(),
    edicion: z.string().max(50).optional(),
    imagen: z.string().url().max(255).optional(),
    aforo: z.coerce.number().int().min(1).max(100_000).nullable().optional(),
    maxPorCompra: z.coerce.number().int().min(1).max(20).optional(),
    ventaInicio: z.string().datetime({ offset: true }).optional(),
    ventaFin: z.string().datetime({ offset: true }).optional(),
    politicaDevolucion: z.string().max(500).optional(),
    urlAccesoPrivado: z.string().url().max(255).optional(),
    estado: z.enum(["PUBLICADO", "CANCELADO"]).optional(),
    motivoCancelacion: z.string().max(500).optional(),
  })
  .strict();

export type TipoEntradaCreateDTO = z.infer<typeof TipoEntradaCreateSchema>;
export type EventoCreateDTO = z.infer<typeof EventoCreateSchema>;
export type EventoUpdateDTO = z.infer<typeof EventoUpdateSchema>;
