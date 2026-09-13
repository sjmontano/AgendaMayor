import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/supabase/sesion";
import { obtenerUsuarioPorAuthId } from "@/lib/auth";
import { listarActivos } from "@/modelo/eventos/evento.repository";
import { crear } from "@/modelo/eventos/evento.service";
import { EventoQuerySchema, EventoCreateSchema } from "@/modelo/eventos/evento.dto";

/**
 * GET /api/eventos — Cartelera pública (solo activos)
 * Query params: page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filtros = EventoQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 12,
    });
    return ok(await listarActivos(filtros));
  } catch (e) {
    return err(e);
  }
}

/**
 * POST /api/eventos — Crear evento (autenticado, tipo según rol, HU-11).
 */
export async function POST(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    const body = await request.json();
    const datos = EventoCreateSchema.parse(body);
    return ok(await crear(datos, usuario), 201);
  } catch (e) {
    return err(e);
  }
}
