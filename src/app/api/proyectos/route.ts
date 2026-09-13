import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { getSesionActual } from '@/lib/supabase/auth.adapter';
import { obtenerUsuarioPorAuthId } from '@/lib/auth';
import * as proyectoService from '@/modelo/proyectos/proyecto.service';
import { ProyectoCreateSchema, ProyectoQuerySchema } from '@/modelo/proyectos/proyecto.dto';

/**
 * GET /api/proyectos — Lista pública de proyectos publicados
 * Query params: facultad, tipo, q, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filtros = ProyectoQuerySchema.parse({
      facultad: searchParams.get('facultad') ?? undefined,
      tipo: searchParams.get('tipo') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      autor: searchParams.get('autor') ?? undefined,
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 12,
    });

    const resultado = await proyectoService.listarPublicados(filtros);
    return ok(resultado);
  } catch (e) {
    return err(e);
  }
}

/**
 * POST /api/proyectos — Crear proyecto (autenticado → EN_REVISION)
 */
export async function POST(request: NextRequest) {
  try {
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    const body = await request.json();
    const datos = ProyectoCreateSchema.parse(body);
    const proyecto = await proyectoService.crear(datos, usuario.id_usuario);
    return ok(proyecto, 201);
  } catch (e) {
    return err(e);
  }
}
