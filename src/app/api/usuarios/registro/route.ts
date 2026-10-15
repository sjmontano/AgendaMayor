import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { crearSesion } from "@/lib/sesion";
import { registrar } from "@/modelo/usuarios/usuario.service";
import { RegistroSchema } from "@/modelo/usuarios/usuario.dto";

/**
 * POST /api/usuarios/registro — Crea la cuenta (rol ESTUDIANTE) con
 * contraseña propia (bcrypt) y deja la sesión iniciada.
 * Reemplaza el flujo signUp de Supabase Auth + completar perfil.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const datos = RegistroSchema.parse(body);

    const usuario = await registrar(datos);
    await crearSesion({ id_usuario: usuario.id_usuario, correo: usuario.correo });

    return ok(usuario, 201);
  } catch (e) {
    return err(e);
  }
}
