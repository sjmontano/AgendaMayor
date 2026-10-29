import type { OrdenDetalleRow } from "@/modelo/taquilla/taquilla.repository";

/**
 * Pasarelas de pago — patrón Strategy.
 * Cada pasarela (Stripe, Wompi, Bold) implementa la misma interfaz y el
 * Service de taquilla elige una según lo que pidió el comprador.
 * El monto siempre sale de la base de datos, nunca del cliente.
 */
export type PasarelaId = "STRIPE" | "WOMPI" | "BOLD";

export const PASARELAS: PasarelaId[] = ["STRIPE", "WOMPI", "BOLD"];

export type EstadoPagoExterno = "APROBADO" | "RECHAZADO" | "PENDIENTE" | "EXPIRADO";

export type OrdenParaPago = OrdenDetalleRow;

export interface CrearPagoInput {
  orden: OrdenParaPago;
  /** Origen público del sitio (https://… en producción). */
  baseUrl: string;
  /** Token de acceso a la orden (va en la URL de retorno). */
  token: string;
  /** URL absoluta a la que vuelve el comprador (pantalla de resultado). */
  urlRetorno: string;
  /** URL absoluta si cancela (detalle del evento). */
  urlCancelar: string;
  /** Minutos de vigencia del cobro. */
  minutos: number;
}

export interface PagoCreado {
  url: string;
  /** Id externo para conciliar luego (link Bold, sesión Stripe…). */
  referencia: string | null;
}

export interface PagoConsultado {
  estado: EstadoPagoExterno;
  /** Id de la transacción en la pasarela, si ya existe. */
  transaccionId: string | null;
  /** CARD, PSE, NEQUI, BANCOLOMBIA_TRANSFER… */
  metodo: string | null;
}

export interface Pasarela {
  id: PasarelaId;
  nombre: string;
  /** Métodos que ofrece esta pasarela (para mostrar al comprador). */
  metodos: string[];
  configurada(): boolean;
  crearPago(input: CrearPagoInput): Promise<PagoCreado>;
  /**
   * Consulta el estado real en la pasarela. Es la fuente de verdad para
   * Wompi y Bold: los webhooks solo disparan esta consulta.
   */
  consultarPago(orden: { codigo: string; pasarela_referencia: string | null }): Promise<PagoConsultado>;
}
