import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { getSesionActual } from '@/lib/supabase/auth.adapter';
import { obtenerUsuarioPorAuthId, requiereRol } from '@/lib/auth';
import * as puestoService from '@/modelo/puestos/puesto.service';
import { PuestoCreateSchema } from '@/modelo/puestos/puesto.dto';

/**
 * GET /api/puestos — Lista de puestos (público)
 * Query params: proyectoId (puesto asignado a un proyecto)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proyectoId = searchParams.get("proyectoId");
    if (proyectoId) {
      const { buscarPorProyecto } = await import("@/modelo/puestos/puesto.repository");
      return ok(await buscarPorProyecto(Number(proyectoId)));
    }
    const puestos = await puestoService.listar();
    return ok(puestos);
  } catch (e) {
    return err(e);
  }
}

/**
 * POST /api/puestos — Crear puesto (solo ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    requiereRol(usuario, 'ADMIN');

    const body = await request.json();
    const datos = PuestoCreateSchema.parse(body);
    const puesto = await puestoService.crear(datos);
    return ok(puesto, 201);
  } catch (e) {
    return err(e);
  }
}
