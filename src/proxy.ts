import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (Next 16) — redirige a /ingresar las rutas privadas sin cookie de sesión.
 * Solo comprueba presencia de la cookie; la verificación real del JWT y del rol
 * ocurre en las rutas /api/* y en las páginas (lib/sesion.ts).
 */
const COOKIE_SESION = "agenda_sesion";

export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_SESION)) return NextResponse.next();
  const url = new URL("/ingresar", request.url);
  url.searchParams.set("siguiente", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/panel/:path*", "/proyectos/nuevo", "/eventos/nuevo", "/mis-entradas", "/notificaciones", "/admin"],
};
