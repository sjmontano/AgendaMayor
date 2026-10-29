import { bold } from "./bold";
import { stripe } from "./stripe";
import { wompi } from "./wompi";
import type { Pasarela, PasarelaId } from "./tipos";

/** Registro de pasarelas (Strategy): el Service pide una por id. */
const REGISTRO: Record<PasarelaId, Pasarela> = { STRIPE: stripe, WOMPI: wompi, BOLD: bold };

export function obtenerPasarela(id: PasarelaId): Pasarela {
  return REGISTRO[id];
}

/** Pasarelas con llaves configuradas, para ofrecerlas al comprador. */
export function pasarelasDisponibles() {
  return Object.values(REGISTRO)
    .filter((p) => p.configurada())
    .map((p) => ({ id: p.id, nombre: p.nombre, metodos: p.metodos }));
}

export type { Pasarela, PasarelaId } from "./tipos";
