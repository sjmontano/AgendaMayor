import * as repo from './proyecto.repository';
import { obtenerTransicion } from './proyecto.state';
import { badRequest, notFound, forbidden } from '@/lib/errors';
import type { ProyectoCreateDTO, ProyectoUpdateDTO, ProyectoQueryDTO } from './proyecto.dto';
import type { EstadoProyecto } from './proyecto.state';

/**
 * Service de proyectos — lógica de negocio central.
 * Aplica transiciones de estado (State), reglas de rol, validaciones.
 */

export async function listarPublicados(filtros: ProyectoQueryDTO) {
  return repo.listarPublicados(filtros);
}

export async function obtenerPorId(id: number) {
  const proyecto = await repo.buscarPorId(id);
  if (!proyecto) throw notFound('Proyecto no encontrado');
  return proyecto;
}

export async function crear(datos: ProyectoCreateDTO, autorId: number) {
  if (datos.tipo === 'EAFI' && !datos.eventoOrigenId) {
    throw badRequest('Los proyectos EAFI deben estar asociados a un evento origen (eventoOrigenId)');
  }

  const proyecto = await repo.crear(datos, autorId);

  // Crear notificación al autor
  await crearNotificacion(
    autorId,
    `Tu proyecto "${datos.titulo}" fue enviado a revisión`,
    proyecto.id_proyecto
  );

  return proyecto;
}

export async function cambiarEstado(
  id: number,
  destino: EstadoProyecto,
  rolUsuario: string,
  motivoRechazo?: string
) {
  const proyecto = await repo.buscarPorId(id);
  if (!proyecto) throw notFound('Proyecto no encontrado');

  const transicion = obtenerTransicion(
    proyecto.estado as EstadoProyecto,
    destino,
    rolUsuario
  );

  if (!transicion) {
    throw forbidden(
      `No se puede transicionar de "${proyecto.estado}" a "${destino}" con rol ${rolUsuario}`
    );
  }

  if (destino === 'RECHAZADO' && !motivoRechazo) {
    throw badRequest('Debe indicar un motivo de rechazo');
  }

  const actualizado = await repo.actualizar(id, {
    estado: destino,
    motivoRechazo: destino === 'RECHAZADO' ? motivoRechazo : undefined,
  });

  // Notificar al autor
  const mensaje =
    destino === 'PUBLICADO'
      ? `Tu proyecto "${proyecto.titulo}" fue publicado`
      : destino === 'RECHAZADO'
        ? `Tu proyecto "${proyecto.titulo}" fue rechazado: ${motivoRechazo}`
        : `Tu proyecto "${proyecto.titulo}" cambió de estado a ${destino}`;

  await crearNotificacion(proyecto.autor_id, mensaje, id);

  return actualizado;
}

export async function destacar(id: number, destacado: boolean) {
  const proyecto = await repo.buscarPorId(id);
  if (!proyecto) throw notFound('Proyecto no encontrado');

  return repo.actualizar(id, { destacado });
}

async function crearNotificacion(usuarioId: number, mensaje: string, proyectoId: number) {
  const { crear } = await import('../notificaciones/notificacion.repository');
  await crear(usuarioId, mensaje, proyectoId);
}
