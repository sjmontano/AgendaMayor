import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { EventoUpdateSchema } from "@/modelo/eventos/evento.dto";
import { actualizar, obtenerDetallePublico } from "@/modelo/eventos/evento.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/eventos/[id] — Detalle público (incluye tipos de entrada).
 * El organizador y ADMIN pueden ver eventos no publicados.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await usuarioActual();
    return ok(await obtenerDetallePublico(Number(id), usuario));
  } catch (e) {
    return err(e);
  }
}

/**
 * PATCH /api/eventos/[id] — Editar o cancelar un evento.
 * Solo el organizador o ADMIN.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await usuarioActual();
    if (!usuario) {
      const { unauthorized } = await import("@/lib/errors");
      throw unauthorized();
    }
    const body = await request.json();
    const datos = EventoUpdateSchema.parse(body);
    return ok(await actualizar(Number(id), datos, usuario));
  } catch (e) {
    return err(e);
  }
}
