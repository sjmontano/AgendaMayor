import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { getSesionActual } from '@/lib/supabase/auth.adapter';
import { obtenerUsuarioPorAuthId, requiereRol } from '@/lib/auth';
import * as puestoService from '@/modelo/puestos/puesto.service';
import { PuestoUpdateSchema } from '@/modelo/puestos/puesto.dto';
import { z } from 'zod';

const AccionSchema = z.object({
  accion: z.enum(['asignar', 'liberar']),
  proyectoId: z.number().int().optional(),
});

/**
 * GET /api/puestos/[id] — Detalle de un puesto
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const puesto = await puestoService.obtenerPorId(Number(id));
    return ok(puesto);
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/puestos/[id] — Asignar/liberar puesto (ADMIN)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    requiereRol(usuario, 'ADMIN');

    const { id } = await params;
    const body = await request.json();
    const puestoId = Number(id);

    if ('accion' in body) {
      const accion = AccionSchema.parse(body);
      if (accion.accion === 'asignar' && accion.proyectoId) {
        await puestoService.asignarProyecto(puestoId, accion.proyectoId);
      } else if (accion.accion === 'liberar') {
        await puestoService.liberar(puestoId);
      }
      return ok({ message: `Puesto actualizado` });
    }

    const datos = PuestoUpdateSchema.parse(body);
    const actualizado = await (await import('@/modelo/puestos/puesto.repository')).actualizar(puestoId, datos);
    return ok(actualizado);
  } catch (e) {
    return err(e);
  }
}

/**
 * DELETE /api/puestos/[id] — Eliminar puesto (ADMIN)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    requiereRol(usuario, 'ADMIN');

    const { id } = await params;
    await puestoService.eliminar(Number(id));
    return ok({ message: 'Puesto eliminado' });
  } catch (e) {
    return err(e);
  }
}
