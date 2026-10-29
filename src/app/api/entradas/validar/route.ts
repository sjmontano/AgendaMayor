import { NextRequest } from "next/server";
import { ok, err, unauthorized } from "@/lib/errors";
import { usuarioActual } from "@/lib/sesion-vista";
import { ValidarEntradaSchema } from "@/modelo/taquilla/taquilla.dto";
import { validarCodigo } from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/entradas/validar — Marca una entrada como USADA (puerta). */
export async function POST(request: NextRequest) {
  try {
    const usuario = await usuarioActual();
    if (!usuario) throw unauthorized();
    const body = await request.json();
    const { codigo } = ValidarEntradaSchema.parse(body);
    return ok(await validarCodigo(codigo, usuario));
  } catch (e) {
    return err(e);
  }
}
