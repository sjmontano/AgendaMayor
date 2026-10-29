/**
 * Máquina de estados de una orden de taquilla.
 * PENDIENTE → PAGADA | EXPIRADA | FALLIDA | CANCELADA
 * PAGADA    → REEMBOLSADA
 */
export type EstadoOrden =
  | "PENDIENTE"
  | "PAGADA"
  | "FALLIDA"
  | "EXPIRADA"
  | "CANCELADA"
  | "REEMBOLSADA";

const TRANSICIONES: Record<EstadoOrden, EstadoOrden[]> = {
  PENDIENTE: ["PAGADA", "EXPIRADA", "FALLIDA", "CANCELADA"],
  PAGADA: ["REEMBOLSADA"],
  FALLIDA: [],
  EXPIRADA: ["PAGADA"],
  CANCELADA: [],
  REEMBOLSADA: [],
};

export function puedeTransicionarOrden(actual: EstadoOrden, destino: EstadoOrden) {
  return (TRANSICIONES[actual] ?? []).includes(destino);
}

export function estadosQueOcupanCupo(estado: string) {
  return estado === "PENDIENTE" || estado === "PAGADA";
}
