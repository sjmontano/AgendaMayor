import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { crearSesion } from "@/lib/sesion";
import { iniciarSesion } from "@/modelo/usuarios/usuario.service";
import { LoginSchema } from "@/modelo/usuarios/usuario.dto";

/**
 * POST /api/auth/login — Verifica correo/contraseña contra la tabla usuario
 * y deja la sesión (JWT) en una cookie httpOnly. Reemplaza a Supabase Auth.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const datos = LoginSchema.parse(body);

    const usuario = await iniciarSesion(datos.email, datos.password);
    await crearSesion({ id_usuario: usuario.id_usuario, correo: usuario.correo });

    return ok({ id_usuario: usuario.id_usuario, username: usuario.username });
  } catch (e) {
    return err(e);
  }
}
