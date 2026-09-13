import { ok, err } from "@/lib/errors";
import { listarActivos } from "@/modelo/avisos/aviso.repository";

/**
 * GET /api/avisos — Avisos activos (público, HU-14).
 */
export async function GET() {
  try {
    return ok(await listarActivos());
  } catch (e) {
    return err(e);
  }
}
