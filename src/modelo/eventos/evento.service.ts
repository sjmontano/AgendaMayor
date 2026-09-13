import { badRequest, forbidden } from "@/lib/errors";
import { crear as crearEnBd } from "./evento.repository";
import type { EventoCreateDTO } from "./evento.dto";
import type { UsuarioAuth } from "@/lib/auth";

/**
 * Service de eventos — reglas por rol (HU-11):
 * ADMIN crea OFICIAL · DOCENTE crea EAFI de su facultad · cualquiera crea COMUNIDAD.
 */
export async function crear(datos: EventoCreateDTO, usuario: UsuarioAuth) {
  if (datos.tipo === "OFICIAL" && usuario.nombre_rol !== "ADMIN") {
    throw forbidden("Solo ADMIN crea eventos oficiales");
  }
  if (datos.tipo === "EAFI") {
    if (usuario.nombre_rol !== "DOCENTE" && usuario.nombre_rol !== "ADMIN") {
      throw forbidden("Solo DOCENTE crea eventos EAFI");
    }
    if (!datos.facultad || !datos.edicion) {
      throw badRequest("EAFI exige facultad + edicion (ej. EAFI 2026-1)");
    }
    if (usuario.nombre_rol === "DOCENTE" && usuario.facultad !== datos.facultad) {
      throw forbidden("Solo EAFI de su propia facultad");
    }
  }
  if (new Date(datos.fechaFin) < new Date(datos.fechaInicio)) {
    throw badRequest("fechaFin debe ser posterior a fechaInicio");
  }
  if (datos.esVirtual && !datos.urlVirtual) {
    throw badRequest("Evento virtual exige urlVirtual");
  }
  if (!datos.esVirtual && !datos.lugar) {
    throw badRequest("Evento presencial exige lugar");
  }

  return crearEnBd({
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    tipo: datos.tipo,
    fecha_inicio: datos.fechaInicio,
    fecha_fin: datos.fechaFin,
    lugar: datos.lugar ?? "Virtual",
    es_virtual: datos.esVirtual,
    url_virtual: datos.urlVirtual ?? null,
    facultad: datos.facultad ?? null,
    edicion: datos.edicion ?? null,
    imagen: datos.imagen ?? null,
    autor_id: usuario.id_usuario,
  });
}
