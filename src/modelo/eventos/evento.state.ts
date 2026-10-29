/**
 * Máquina de estados de evento — patrón State (GoF).
 * El MVP publica de inmediato los eventos de la comunidad y deja CANCELADO
 * como salida administrativa. La estructura queda lista para moderación.
 */
export type EstadoEvento = "BORRADOR" | "EN_REVISION" | "PUBLICADO" | "CANCELADO" | "FINALIZADO";

type TransicionPermitida = { destino: EstadoEvento; roles: string[] };

const TRANSICIONES: Record<EstadoEvento, TransicionPermitida[]> = {
  BORRADOR: [
    { destino: "EN_REVISION", roles: ["ESTUDIANTE", "DOCENTE", "ADMIN"] },
    { destino: "PUBLICADO", roles: ["DOCENTE", "ADMIN"] },
  ],
  EN_REVISION: [
    { destino: "PUBLICADO", roles: ["DOCENTE", "ADMIN"] },
    { destino: "CANCELADO", roles: ["DOCENTE", "ADMIN"] },
  ],
  PUBLICADO: [
    { destino: "CANCELADO", roles: ["ESTUDIANTE", "DOCENTE", "ADMIN"] },
    { destino: "FINALIZADO", roles: ["DOCENTE", "ADMIN"] },
  ],
  CANCELADO: [],
  FINALIZADO: [],
};

export function obtenerTransicionEvento(
  estadoActual: EstadoEvento,
  destino: EstadoEvento,
  rolUsuario: string
): TransicionPermitida | null {
  return (TRANSICIONES[estadoActual] ?? []).find(
    (t) => t.destino === destino && t.roles.includes(rolUsuario)
  ) ?? null;
}

export function transicionesEventoPermitidas(
  estadoActual: EstadoEvento,
  rolUsuario: string
): EstadoEvento[] {
  return (TRANSICIONES[estadoActual] ?? [])
    .filter((t) => t.roles.includes(rolUsuario))
    .map((t) => t.destino);
}
