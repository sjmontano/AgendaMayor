import { NextRequest } from 'next/server';
import { ok, err, badRequest } from '@/lib/errors';
import { getSesionActual } from '@/lib/supabase/auth.adapter';
import { obtenerUsuarioPorAuthId } from '@/lib/auth';
import * as proyectoService from '@/modelo/proyectos/proyecto.service';
import { ProyectoUpdateSchema } from '@/modelo/proyectos/proyecto.dto';
import { z } from 'zod';

const AccionSchema = z.object({
  accion: z.enum(['publicar', 'rechazar', 'destacar', 'eliminar']),
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
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    const proyectoId = Number(id);

    // Si viene "accion", es una transición de estado (State pattern)
    if ('accion' in body) {
      const accion = AccionSchema.parse(body);

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
        case 'eliminar':
          await proyectoService.cambiarEstado(proyectoId, 'ELIMINADO', usuario.nombre_rol);
          break;
      }
      return ok({ message: `Acción "${accion.accion}" ejecutada` });
    }

    // Si no viene "accion", es una edición normal del autor
    const datos = ProyectoUpdateSchema.parse(body);
    const supabase = (await import('@/lib/supabase/server')).getSupabaseServer();
    const { data: proyecto } = await supabase
      .from('proyecto')
      .select('autor_id')
      .eq('id_proyecto', proyectoId)
      .single();

    if (!proyecto || proyecto.autor_id !== usuario.id_usuario) {
      return err(badRequest('Solo el autor puede editar su proyecto'));
    }

    const actualizado = await (await import('@/modelo/proyectos/proyecto.repository')).actualizar(proyectoId, datos);
    return ok(actualizado);
  } catch (e) {
    return err(e);
  }
}
