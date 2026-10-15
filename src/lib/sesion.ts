import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { unauthorized } from "@/lib/errors";

/**
 * Sesión propia — reemplaza a Supabase Auth.
 * Firma un JWT (HS256) en una cookie httpOnly; no hay estado en servidor.
 *
 * `userId` es el id_usuario (clave primaria de la tabla usuario).
 */

export const COOKIE_SESION = "agenda_sesion";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export interface SesionActual {
  userId: string;
  email: string;
}

function secreto(): Uint8Array {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 16) {
    throw new Error("Falta AUTH_SECRET (define una cadena larga y aleatoria en .env)");
  }
  return new TextEncoder().encode(valor);
}

/** Firma el JWT y deja la cookie de sesión en la respuesta. */
export async function crearSesion(usuario: { id_usuario: number; correo: string }): Promise<void> {
  const token = await new SignJWT({ correo: usuario.correo })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id_usuario))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secreto());

  const jar = await cookies();
  jar.set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Elimina la cookie de sesión. */
export async function cerrarSesion(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_SESION);
}

/**
 * Lee y verifica la sesión desde la cookie.
 * Lanza ApiError 401 si no hay cookie o el token es inválido/expirado.
 */
export async function getSesionDesdeCookies(): Promise<SesionActual> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION)?.value;
  if (!token) throw unauthorized("Sesión no válida o expirada");

  try {
    const { payload } = await jwtVerify(token, secreto());
    if (!payload.sub) throw new Error("Token sin sujeto");
    return { userId: payload.sub, email: String(payload.correo ?? "") };
  } catch {
    throw unauthorized("Sesión no válida o expirada");
  }
}

/** Variante sin excepción (para layout/navbar cuando no hay sesión). */
export async function getSesionOpcional(): Promise<SesionActual | null> {
  try {
    return await getSesionDesdeCookies();
  } catch {
    return null;
  }
}

/** Alias histórico usado por las rutas (antes venía de auth.adapter). */
export const getSesionActual = getSesionDesdeCookies;
