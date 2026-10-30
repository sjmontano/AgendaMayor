import type { Prisma } from "@prisma/client";
import { verificarFirma } from "@/lib/integraciones/bold";
import * as repo from "@/modelo/taquilla/taquilla.repository";
import { conciliar } from "@/modelo/taquilla/taquilla.service";

/**
 * POST /api/pagos/bold/webhook — Bold avisa que un pago cambió (aprobado, rechazado…).
 * 1. Se verifica la firma (que de verdad lo envía Bold).
 * 2. Se ignora si ya se procesó (Bold puede repetir el aviso).
 * 3. Se concilia la orden consultando a Bold.
 */
interface AvisoBold {
  id: string;
  type: string;
  data?: { metadata?: { reference?: string | null } };
}

export async function POST(request: Request) {
  const cuerpo = await request.text();
  try {
    verificarFirma(cuerpo, request.headers.get("x-bold-signature"));
  } catch {
    return Response.json({ error: "Firma inválida" }, { status: 400 });
  }

  const aviso = JSON.parse(cuerpo) as AvisoBold;
  if (await repo.pagoEventoExiste(aviso.id)) {
    return Response.json({ recibido: true, duplicado: true });
  }

  try {
    let ordenId: number | null = null;
    const codigoOrden = aviso.data?.metadata?.reference;
    if (codigoOrden) {
      const orden = await conciliar(codigoOrden);
      ordenId = orden.id_orden;
    }
    await repo.registrarPagoEvento(aviso.id, aviso.type, ordenId, JSON.parse(cuerpo) as Prisma.InputJsonValue);
    return Response.json({ recibido: true });
  } catch (e) {
    console.error("[Bold webhook]", e);
    return Response.json({ error: "Error procesando el aviso" }, { status: 500 });
  }
}
