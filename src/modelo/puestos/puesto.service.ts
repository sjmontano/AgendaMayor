import * as repo from './puesto.repository';
import { notFound, badRequest, conflict } from '@/lib/errors';
import type { PuestoCreateDTO, PuestoUpdateDTO } from './puesto.dto';

/**
 * Service de puestos — lógica de negocio para ubicación de proyectos en ferias.
 * Cada puesto pertenece a un evento (EAFI) y puede ser ocupado por un proyecto.
 */

export async function listar() {
  return repo.listar();
}

export async function listarPorEvento(eventoId: number) {
  return repo.listarPorEvento(eventoId);
}

export async function obtenerPorId(id: number) {
  const puesto = await repo.buscarPorId(id);
  if (!puesto) throw notFound('Puesto no encontrado');
  return puesto;
}

export async function crear(datos: PuestoCreateDTO) {
  return repo.crear(datos);
}

export async function asignarProyecto(id: number, proyectoId: number) {
  const puesto = await repo.buscarPorId(id);
  if (!puesto) throw notFound('Puesto no encontrado');

  if (puesto.estado === 'OCUPADO') {
    throw conflict(`El puesto "${puesto.codigo}" ya está ocupado`);
  }

  return repo.actualizar(id, {
    estado: 'OCUPADO',
    proyectoId,
  });
}

export async function liberar(id: number) {
  const puesto = await repo.buscarPorId(id);
  if (!puesto) throw notFound('Puesto no encontrado');

  return repo.actualizar(id, {
    estado: 'DISPONIBLE',
    proyectoId: null,
  });
}

export async function eliminar(id: number) {
  const puesto = await repo.buscarPorId(id);
  if (!puesto) throw notFound('Puesto no encontrado');

  if (puesto.estado === 'OCUPADO') {
    throw badRequest('No se puede eliminar un puesto ocupado. Libérelo primero.');
  }

  return repo.eliminar(id);
}
