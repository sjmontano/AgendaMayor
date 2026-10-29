import { createHash, timingSafeEqual } from "node:crypto";
import { badRequest, serviceUnavailable } from "@/lib/errors";
import type { CrearPagoInput, PagoConsultado, PagoCreado, Pasarela } from "./tipos";

/**
 * Wompi (Bancolombia) — Web Checkout por redirección.
 * Métodos: tarjeta crédito/débito, PSE, Nequi, Botón Bancolombia, Daviplata…
 * Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
 */
const CHECKOUT_URL = "https://checkout.wompi.co/p/";

function llaves() {
  return {
    publica: process.env.WOMPI_PUBLIC_KEY ?? "",
    privada: process.env.WOMPI_PRIVATE_KEY ?? "",
    integridad: process.env.WOMPI_INTEGRITY_SECRET ?? "",
    eventos: process.env.WOMPI_EVENTS_SECRET ?? "",
  };
}

/** Sandbox si la llave pública es de pruebas (pub_test_). */
export function wompiApiBase() {
  return llaves().publica.startsWith("pub_prod_")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

/**
 * Firma de integridad: SHA256(referencia + monto + moneda [+ expiración] + secreto).
 * Con expiration-time la fecha va entre la moneda y el secreto.
 */
export function firmaIntegridadWompi(
  referencia: string,
  montoCentavos: number,
  moneda: string,
  secreto: string,
  expiracion?: string
) {
  return createHash("sha256")
    .update(`${referencia}${montoCentavos}${moneda}${expiracion ?? ""}${secreto}`)
    .digest("hex");
}

interface EventoWompi {
  event: string;
  data: Record<string, unknown>;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
  environment?: string;
}

function leerRuta(obj: Record<string, unknown>, ruta: string): unknown {
  return ruta.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

/**
 * Verifica el checksum del evento: SHA256(valores de signature.properties
 * en orden + timestamp + secreto de eventos). Las propiedades se leen del
 * propio evento porque Wompi puede cambiarlas.
 */
export function verificarEventoWompi(cuerpo: string, checksumHeader: string | null): EventoWompi {
  const secreto = llaves().eventos;
  if (!secreto) throw serviceUnavailable("Falta WOMPI_EVENTS_SECRET para verificar eventos de Wompi");
  let evento: EventoWompi;
  try {
    evento = JSON.parse(cuerpo) as EventoWompi;
  } catch {
    throw badRequest("Evento de Wompi con JSON inválido");
  }
  const props = evento.signature?.properties ?? [];
  const recibido = (checksumHeader ?? evento.signature?.checksum ?? "").toLowerCase();
  if (props.length === 0 || !recibido || evento.timestamp === undefined) {
    throw badRequest("Evento de Wompi sin firma");
  }
  const valores = props.map((p) => String(leerRuta(evento.data, p) ?? "")).join("");
  const esperado = createHash("sha256").update(`${valores}${evento.timestamp}${secreto}`).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw badRequest("Firma de evento Wompi inválida");
  return evento;
}

function mapearEstado(status: string | undefined): PagoConsultado["estado"] {
  switch (status) {
    case "APPROVED":
      return "APROBADO";
    case "DECLINED":
    case "VOIDED":
    case "ERROR":
      return "RECHAZADO";
    default:
      return "PENDIENTE";
  }
}

interface TransaccionWompi {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_method_type?: string;
  created_at?: string;
}

export const wompi: Pasarela = {
  id: "WOMPI",
  nombre: "Wompi",
  metodos: ["Tarjeta crédito/débito", "PSE", "Nequi", "Botón Bancolombia"],

  configurada() {
    const k = llaves();
    return Boolean(k.publica && k.integridad);
  },

  async crearPago({ orden, urlRetorno, minutos }: CrearPagoInput): Promise<PagoCreado> {
    const k = llaves();
    if (!k.publica || !k.integridad) throw serviceUnavailable("Wompi no está configurado (WOMPI_PUBLIC_KEY / WOMPI_INTEGRITY_SECRET)");
    const moneda = "COP";
    const expira = new Date(Date.now() + minutos * 60_000).toISOString();
    const firma = firmaIntegridadWompi(orden.codigo, orden.total_centavos, moneda, k.integridad, expira);
    const params = new URLSearchParams({
      "public-key": k.publica,
      currency: moneda,
      "amount-in-cents": String(orden.total_centavos),
      reference: orden.codigo,
      "signature:integrity": firma,
      "redirect-url": urlRetorno,
      "expiration-time": expira,
      "customer-data:email": orden.correo_comprador,
      "customer-data:full-name": orden.nombre_comprador,
    });
    // La transacción de Wompi aún no existe: se concilia por referencia.
    return { url: `${CHECKOUT_URL}?${params.toString()}`, referencia: null };
  },

  async consultarPago({ codigo, pasarela_referencia }): Promise<PagoConsultado> {
    const k = llaves();
    let tx: TransaccionWompi | undefined;
    if (pasarela_referencia) {
      // Consulta directa por id de transacción (no requiere llave privada).
      const r = await fetch(`${wompiApiBase()}/transactions/${encodeURIComponent(pasarela_referencia)}`, { cache: "no-store" });
      if (r.ok) tx = ((await r.json()) as { data: TransaccionWompi }).data;
    }
    if (!tx && k.privada) {
      const r = await fetch(`${wompiApiBase()}/transactions?reference=${encodeURIComponent(codigo)}`, {
        headers: { Authorization: `Bearer ${k.privada}` },
        cache: "no-store",
      });
      if (r.ok) {
        const lista = ((await r.json()) as { data: TransaccionWompi[] }).data ?? [];
        // Si hubo varios intentos, gana el aprobado; si no, el más reciente.
        tx = lista.find((t) => t.status === "APPROVED") ?? lista[0];
      }
    }
    if (!tx || tx.reference !== codigo) return { estado: "PENDIENTE", transaccionId: null, metodo: null };
    return { estado: mapearEstado(tx.status), transaccionId: tx.id, metodo: tx.payment_method_type ?? null };
  },
};
