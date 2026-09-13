/**
 * Máquina de estados de proyecto — patrón State (GoF).
 * Cada estado sabe qué transiciones permite y quién puede ejecutarlas.
 */

export type EstadoProyecto = 'BORRADOR' | 'EN_REVISION' | 'PUBLICADO' | 'RECHAZADO' | 'ELIMINADO';

type TransicionPermitida = {
  destino: EstadoProyecto;
  roles: string[];
};

const TRANSICIONES: Record<EstadoProyecto, TransicionPermitida[]> = {
  BORRADOR: [
    { destino: 'EN_REVISION', roles: ['ESTUDIANTE', 'DOCENTE', 'ADMIN'] },
    { destino: 'ELIMINADO', roles: ['ESTUDIANTE', 'ADMIN'] },
  ],
  EN_REVISION: [
    { destino: 'PUBLICADO', roles: ['DOCENTE', 'ADMIN'] },
    { destino: 'RECHAZADO', roles: ['DOCENTE', 'ADMIN'] },
  ],
  PUBLICADO: [
    { destino: 'ELIMINADO', roles: ['DOCENTE', 'ADMIN'] },
  ],
  RECHAZADO: [
    { destino: 'EN_REVISION', roles: ['ESTUDIANTE'] },
    { destino: 'ELIMINADO', roles: ['ESTUDIANTE', 'ADMIN'] },
  ],
  ELIMINADO: [],
};

/**
 * Valida si una transición es permitida.
 * Retorna la transición si es válida, o null si no lo es.
 */
export function obtenerTransicion(
  estadoActual: EstadoProyecto,
  destino: EstadoProyecto,
  rolUsuario: string
): TransicionPermitida | null {
  const transiciones = TRANSICIONES[estadoActual] ?? [];
  const transicion = transiciones.find(
    (t) => t.destino === destino && t.roles.includes(rolUsuario)
  );
  return transicion ?? null;
}

/**
 * Retorna las transiciones permitidas para un estado y rol dados.
 */
export function transicionesPermitidas(
  estadoActual: EstadoProyecto,
  rolUsuario: string
): EstadoProyecto[] {
  const transiciones = TRANSICIONES[estadoActual] ?? [];
  return transiciones
    .filter((t) => t.roles.includes(rolUsuario))
    .map((t) => t.destino);
}
