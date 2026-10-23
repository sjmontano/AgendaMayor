import { NextRequest } from 'next/server';
import { ok, err, badRequest, forbidden } from '@/lib/errors';
import { getSesionDesdeCookies } from '@/lib/sesion';
import { obtenerUsuarioPorId, puedeAvalar } from '@/lib/auth';
import * as proyectoService from '@/modelo/proyectos/proyecto.service';
import { ProyectoUpdateSchema } from '@/modelo/proyectos/proyecto.dto';
import { z } from 'zod';

const AccionSchema = z.object({
  accion: z.enum(['publicar', 'rechazar', 'destacar', 'eliminar', 'reenviar']),
  motivoRechazo: z.string().max(500).optional(),
  destacado: z.boolean().optional(),
});

/**
 * GET /api/proyectos/[id] — Detalle de un proyecto
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proyecto = await proyectoService.obtenerPorId(Number(id));
    return ok(proyecto);
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/proyectos/[id] — Actualizar proyecto
 * Body: { titulo, descripcion, facultad, programa, tipo, fotos } para el autor
 * Body: { accion: 'publicar'|'rechazar'|'destacar', motivoRechazo? } para docente/admin
 * Body: { accion: 'reenviar'|'eliminar' } para el autor (RECHAZADO → EN_REVISION)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    const proyectoId = Number(id);

    // Si viene "accion", es una transición de estado (State pattern)
    if ('accion' in body) {
      const accion = AccionSchema.parse(body);
      const actual = await proyectoService.obtenerPorId(proyectoId);

      // Moderación: el docente solo avala proyectos de su facultad
      if (accion.accion === 'publicar' || accion.accion === 'rechazar' || accion.accion === 'destacar') {
        puedeAvalar(usuario, actual.facultad);
      }
      // El estudiante solo opera sobre sus propios proyectos
      if (usuario.nombre_rol === 'ESTUDIANTE' && actual.autor_id !== usuario.id_usuario) {
        throw forbidden('Solo el autor puede modificar este proyecto');
      }

      switch (accion.accion) {
        case 'publicar':
          await proyectoService.cambiarEstado(proyectoId, 'PUBLICADO', usuario.nombre_rol);
          break;
        case 'rechazar':
          await proyectoService.cambiarEstado(proyectoId, 'RECHAZADO', usuario.nombre_rol, accion.motivoRechazo);
          break;
        case 'destacar':
          await proyectoService.destacar(proyectoId, accion.destacado ?? true);
          break;
        case 'reenviar':
          await proyectoService.cambiarEstado(proyectoId, 'EN_REVISION', usuario.nombre_rol);
          break;
        case 'eliminar':
          await proyectoService.cambiarEstado(proyectoId, 'ELIMINADO', usuario.nombre_rol);
          break;
      }
      return ok({ message: `Acción "${accion.accion}" ejecutada` });
    }

    // Si no viene "accion", es una edición normal del autor
    // El autor edita contenido; estado/destacado/motivo solo cambian por transición
    const datos = ProyectoUpdateSchema.omit({ estado: true, destacado: true, motivoRechazo: true }).parse(body);
    const proyecto = await proyectoService.obtenerPorId(proyectoId);

    if (proyecto.autor_id !== usuario.id_usuario) {
      throw forbidden('Solo el autor puede editar su proyecto');
    }
    if (proyecto.estado === 'PUBLICADO') {
      throw badRequest('Un proyecto publicado no se puede editar');
    }

    const { actualizar } = await import('@/modelo/proyectos/proyecto.repository');
    const actualizado = await actualizar(proyectoId, datos);
    return ok(actualizado);
  } catch (e) {
    return err(e);
  }
}
