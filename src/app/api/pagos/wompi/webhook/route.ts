import type { Prisma } from "@prisma/client";
import { verificarEventoWompi } from "@/lib/integraciones/pasarelas/wompi";
import * as repo from "@/modelo/taquilla/taquilla.repository";
import { conciliarOrden } from "@/modelo/taquilla/taquilla.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/pagos/wompi/webhook — evento transaction.updated de Wompi.
 * Se verifica el checksum y luego se concilia consultando la API de Wompi
 * (el payload no se usa como fuente de verdad). Responde 200 para que Wompi
 * no reintente; 500 si algo falló y conviene el reintento.
 */
export async function POST(request: Request) {
  const cuerpo = await request.text();
  let evento: ReturnType<typeof verificarEventoWompi>;
  try {
    evento = verificarEventoWompi(cuerpo, request.headers.get("x-event-checksum"));
  } catch (e) {
    console.error("[Wompi webhook] firma inválida", e);
    return Response.json({ error: "Firma inválida" }, { status: 400 });
  }

  const tx = (evento.data?.transaction ?? {}) as { id?: string; reference?: string; status?: string };
  const idEvento = `${tx.id ?? "sin-id"}:${tx.status ?? "?"}:${evento.timestamp ?? 0}`;
  if (await repo.pagoEventoExiste("WOMPI", idEvento)) return Response.json({ received: true, duplicate: true });

  try {
    let ordenId: number | null = null;
    if (evento.event === "transaction.updated" && tx.reference) {
      const orden = await repo.obtenerOrdenPorCodigo(tx.reference);
      if (orden && orden.pasarela === "WOMPI") {
        ordenId = (await conciliarOrden(orden, tx.id ?? null)).id_orden;
      }
    }
    await repo.registrarPagoEvento("WOMPI", idEvento, evento.event, ordenId, JSON.parse(cuerpo) as Prisma.InputJsonValue);
    return Response.json({ received: true });
  } catch (e) {
    console.error("[Wompi webhook] error procesando", e);
    return Response.json({ error: "Error procesando el evento" }, { status: 500 });
  }
}
