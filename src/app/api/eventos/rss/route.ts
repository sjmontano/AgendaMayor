import { ok, err } from "@/lib/errors";
import { obtenerEventosUnimayor } from "@/lib/integraciones/unimayor-rss";

/**
 * GET /api/eventos/rss — Devuelve eventos del feed RSS de UNIMAYOR en vivo.
 * Solo lectura, caché 1h (revalidate en obtenerEventosUnimayor).
 * Público: no requiere autenticación.
 */
export async function GET() {
  try {
    const eventos = await obtenerEventosUnimayor();
    return ok(eventos);
  } catch (e) {
    return err(e);
  }
}
