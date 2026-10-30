import { NextRequest } from "next/server";
import { ok, err } from "@/lib/errors";
import { usuarioActual } from "@/lib/auth";
import { ValidarEntradaSchema } from "@/modelo/taquilla/taquilla.dto";
import { validarEntrada } from "@/modelo/taquilla/taquilla.service";

/**
 * POST /api/entradas/validar — { codigo } marca la entrada como USADA (DOCENTE/ADMIN).
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await usuarioActual();
    const { codigo } = ValidarEntradaSchema.parse(await request.json());
    return ok(await validarEntrada(codigo, usuario));
  } catch (e) {
    return err(e);
  }
}
