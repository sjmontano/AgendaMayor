import { z } from "zod";

/**
 * DTO de la taquilla — patrón Data Transfer Object.
 * El "carrito" es la lista de tipos de entrada con la cantidad elegida.
 * El precio NUNCA viene del navegador: el service lo lee de la base de datos.
 */
export const CompraSchema = z.object({
  eventoId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        tipoEntradaId: z.number().int().positive(),
        cantidad: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Elige al menos una entrada"),
});

export type CompraDTO = z.infer<typeof CompraSchema>;

export const ValidarEntradaSchema = z.object({
  codigo: z.string().trim().toUpperCase().min(4).max(32),
});

export type ValidarEntradaDTO = z.infer<typeof ValidarEntradaSchema>;
