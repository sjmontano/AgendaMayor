import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/supabase/sesion";
import { registrar } from "@/modelo/usuarios/usuario.service";
import { RegistroSchema } from "@/modelo/usuarios/usuario.dto";
import { buscarPorAuthId } from "@/modelo/usuarios/usuario.repository";

/**
 * POST /api/usuarios/registro — Completa el registro tras el signUp de Auth.
 * Crea la fila USUARIO (rol ESTUDIANTE) enlazada por auth_id.
 */
export async function POST(request: NextRequest) {
  try {
    const sesion = await getSesionDesdeCookies();

    const existente = await buscarPorAuthId(sesion.userId);
    if (existente) return ok(existente);

    const body = await request.json();
    const datos = RegistroSchema.parse(body);
    const usuario = await registrar(sesion.userId, sesion.email, datos);
    return ok(usuario, 201);
  } catch (e) {
    return err(e);
  }
}
