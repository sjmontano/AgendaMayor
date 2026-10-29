import { z } from "zod";

export const CheckoutSchema = z.object({
  eventoId: z.coerce.number().int().positive(),
  tipoEntradaId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().min(1).max(20),
  nombre: z.string().trim().min(3).max(100),
  correo: z.string().trim().email().max(100),
  documento: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || undefined),
  telefono: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || undefined),
  /** Pasarela elegida por el comprador (Strategy en lib/integraciones/pasarelas). */
  pasarela: z.enum(["STRIPE", "WOMPI", "BOLD"]).default("STRIPE"),
  aceptaDatos: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar el tratamiento de datos para continuar",
  }),
});

export const ValidarEntradaSchema = z.object({
  codigo: z.string().trim().min(4).max(64),
});

export const ReembolsoSchema = z.object({
  motivo: z.string().trim().max(300).optional(),
});

export type CheckoutDTO = z.infer<typeof CheckoutSchema>;
export type ValidarEntradaDTO = z.infer<typeof ValidarEntradaSchema>;
