import { badRequest, forbidden, notFound } from "@/lib/errors";
import * as repo from "./evento.repository";
import type { EventoCreateDTO, TipoEvento } from "./evento.dto";
import type { UsuarioAuth } from "@/lib/auth";

/**
 * Service de eventos.
 *
 * Patrón Strategy (HU-11): cada tipo de evento tiene su propia regla de
 * creación. El service elige la regla según el tipo y la ejecuta, sin
 * cadenas de if. Para agregar un tipo nuevo basta con agregar su regla.
 *   OFICIAL   → solo ADMIN
 *   EAFI      → DOCENTE de su facultad (o ADMIN), exige facultad y edición
 *   COMUNIDAD → cualquier usuario registrado
 */
type ReglaDeCreacion = (datos: EventoCreateDTO, usuario: UsuarioAuth) => void;

const REGLAS_POR_TIPO: Record<TipoEvento, ReglaDeCreacion> = {
  OFICIAL: (_datos, usuario) => {
    if (usuario.nombre_rol !== "ADMIN") {
      throw forbidden("Solo ADMIN crea eventos oficiales");
    }
  },

  EAFI: (datos, usuario) => {
    if (usuario.nombre_rol !== "DOCENTE" && usuario.nombre_rol !== "ADMIN") {
      throw forbidden("Solo DOCENTE crea eventos EAFI");
    }
    if (!datos.facultad || !datos.edicion) {
      throw badRequest("EAFI exige facultad + edición (ej. EAFI 2026-1)");
    }
    if (usuario.nombre_rol === "DOCENTE" && usuario.facultad !== datos.facultad) {
      throw forbidden("Solo EAFI de su propia facultad");
    }
  },

  COMUNIDAD: () => {
    // Cualquier usuario con sesión puede crear eventos de comunidad.
  },
};

export async function crear(datos: EventoCreateDTO, usuario: UsuarioAuth) {
  // 1. Estrategia según el tipo de evento
  const regla = REGLAS_POR_TIPO[datos.tipo];
  regla(datos, usuario);

  // 2. Validaciones comunes a todos los tipos
  if (new Date(datos.fechaFin) < new Date(datos.fechaInicio)) {
    throw badRequest("La fecha de fin debe ser posterior a la de inicio");
  }
  if (datos.esVirtual && !datos.urlVirtual) {
    throw badRequest("Un evento virtual necesita el enlace de conexión");
  }
  if (!datos.esVirtual && !datos.lugar) {
    throw badRequest("Un evento presencial necesita el lugar");
  }

  return repo.crear({
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
    max_por_compra: datos.maxPorCompra,
    tiposEntrada: datos.tiposEntrada,
  });
}

export async function listarProximos(cantidad = 3) {
  return repo.listarProximos(cantidad);
}

export async function obtenerDetalle(id: number) {
  const evento = await repo.buscarDetalle(id);
  if (!evento) throw notFound("Evento no encontrado");
  return evento;
}
