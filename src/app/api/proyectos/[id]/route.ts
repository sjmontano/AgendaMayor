import { NextRequest } from 'next/server';
import { ok, err, forbidden } from '@/lib/errors';
import { usuarioActual, puedeAvalar, requiereRol } from '@/lib/auth';
import * as proyectoService from '@/modelo/proyectos/proyecto.service';
import { ProyectoUpdateSchema } from '@/modelo/proyectos/proyecto.dto';
import { z } from 'zod';

const AccionSchema = z.object({
  accion: z.enum(['publicar', 'rechazar', 'destacar', 'reenviar', 'eliminar']),
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
 * PATCH /api/proyectos/[id]
 * - Autor: { titulo, descripcion, ... } edita su proyecto (BORRADOR o RECHAZADO).
 * - Autor: { accion: 'reenviar' } manda de nuevo a revisión un proyecto RECHAZADO.
 * - Docente/Admin: { accion: 'publicar' | 'rechazar' | 'destacar', motivoRechazo? }.
 * - Autor o Admin: { accion: 'eliminar' }.
 * Las transiciones las valida la máquina de estados (patrón State).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const usuario = await usuarioActual();
    const proyecto = await proyectoService.obtenerPorId(Number(id));
    const esAutor = proyecto.autor_id === usuario.id_usuario;

    // Sin "accion": edición normal del autor
    if (!('accion' in body)) {
      if (!esAutor) throw forbidden('Solo el autor puede editar su proyecto');
      const datos = ProyectoUpdateSchema.parse(body);
      return ok(await proyectoService.editar(proyecto.id_proyecto, datos));
    }

    const accion = AccionSchema.parse(body);
    switch (accion.accion) {
      case 'publicar':
        puedeAvalar(usuario, proyecto.facultad);
        await proyectoService.cambiarEstado(proyecto.id_proyecto, 'PUBLICADO', usuario.nombre_rol);
        break;
      case 'rechazar':
        puedeAvalar(usuario, proyecto.facultad);
        await proyectoService.cambiarEstado(proyecto.id_proyecto, 'RECHAZADO', usuario.nombre_rol, accion.motivoRechazo);
        break;
      case 'destacar':
        requiereRol(usuario, 'DOCENTE', 'ADMIN');
        await proyectoService.destacar(proyecto.id_proyecto, accion.destacado ?? true);
        break;
      case 'reenviar':
        if (!esAutor) throw forbidden('Solo el autor puede reenviar su proyecto');
        await proyectoService.cambiarEstado(proyecto.id_proyecto, 'EN_REVISION', usuario.nombre_rol);
        break;
      case 'eliminar':
        if (!esAutor && usuario.nombre_rol !== 'ADMIN') throw forbidden('Solo el autor o un administrador');
        await proyectoService.cambiarEstado(proyecto.id_proyecto, 'ELIMINADO', usuario.nombre_rol);
        break;
    }
    return ok({ message: `Acción "${accion.accion}" ejecutada` });
  } catch (e) {
    return err(e);
  }
}
