import type { Prisma } from "@prisma/client";
import { verificarFirmaBold } from "@/lib/integraciones/pasarelas/bold";
import * as repo from "@/modelo/taquilla/taquilla.repository";
import { conciliarOrden } from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EventoBold {
  id: string;
  type: string;
  subject?: string;
  data?: { payment_id?: string; metadata?: { reference?: string | null } };
}

/**
 * POST /api/pagos/bold/webhook — SALE_APPROVED / SALE_REJECTED / VOID_*.
 * Se verifica x-bold-signature y se concilia consultando el link en Bold.
 * Bold exige responder 200 en menos de 2 s y puede enviar duplicados.
 */
export async function POST(request: Request) {
  const cuerpo = await request.text();
  try {
    verificarFirmaBold(cuerpo, request.headers.get("x-bold-signature"));
  } catch (e) {
    console.error("[Bold webhook] firma inválida", e);
    return Response.json({ error: "Firma inválida" }, { status: 400 });
  }

  let evento: EventoBold;
  try {
    evento = JSON.parse(cuerpo) as EventoBold;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (await repo.pagoEventoExiste("BOLD", evento.id)) return Response.json({ received: true, duplicate: true });

  try {
    let ordenId: number | null = null;
    const referencia = evento.data?.metadata?.reference;
    if (referencia) {
      const orden = await repo.obtenerOrdenPorCodigo(referencia);
      if (orden && orden.pasarela === "BOLD") ordenId = (await conciliarOrden(orden)).id_orden;
    }
    await repo.registrarPagoEvento("BOLD", evento.id, evento.type, ordenId, JSON.parse(cuerpo) as Prisma.InputJsonValue);
    return Response.json({ received: true });
  } catch (e) {
    console.error("[Bold webhook] error procesando", e);
    return Response.json({ error: "Error procesando el evento" }, { status: 500 });
  }
}
