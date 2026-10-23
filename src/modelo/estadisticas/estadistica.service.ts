import * as repo from "./estadistica.repository";

/**
 * Service de estadísticas — compone los agregados que consumen
 * la landing (cifras públicas) y el panel (cifras por rol).
 */

export async function resumenPublico() {
  const [totales, porFacultad, actividad] = await Promise.all([
    repo.totalesGenerales(),
    repo.contarPublicadosPorFacultad(),
    repo.registrosPorDia(30),
  ]);
  return { totales, porFacultad, actividad };
}

export async function resumenEstudiante(usuarioId: number) {
  const [porEstado, sinLeer] = await Promise.all([
    repo.contarPorEstado({ autorId: usuarioId }),
    repo.contarNotificacionesSinLeer(usuarioId),
  ]);
  return { porEstado, sinLeer };
}

/** Docente: su facultad. Admin: toda la institución (facultad null). */
export async function resumenModeracion(facultad: string | null) {
  const [porEstado, actividad, porFacultad] = await Promise.all([
    repo.contarPorEstado({ facultad }),
    repo.registrosPorDia(30, { facultad }),
    repo.contarPublicadosPorFacultad(),
  ]);
  const decididos = porEstado.PUBLICADO + porEstado.RECHAZADO;
  const tasaAprobacion = decididos === 0 ? 0 : Math.round((porEstado.PUBLICADO / decididos) * 100);
  return { porEstado, actividad, porFacultad, tasaAprobacion };
}
