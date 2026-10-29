import { ok } from "@/lib/errors";
import { pasarelasDisponibles } from "@/lib/integraciones/pasarelas";

export const dynamic = "force-dynamic";

/** GET /api/pagos/metodos — Pasarelas configuradas y sus métodos (sin secretos). */
export async function GET() {
  return ok(pasarelasDisponibles());
}
