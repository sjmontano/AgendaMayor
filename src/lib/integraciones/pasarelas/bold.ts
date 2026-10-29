import { createHmac, timingSafeEqual } from "node:crypto";
import { badRequest, internal, serviceUnavailable } from "@/lib/errors";
import type { CrearPagoInput, PagoConsultado, PagoCreado, Pasarela } from "./tipos";

/**
 * Bold — API Link de pagos (checkout alojado en checkout.bold.co).
 * Métodos: tarjeta crédito/débito, PSE, Nequi, Botón Bancolombia.
 * Docs: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
 */
const API = "https://integrations.api.bold.co";

function llaves() {
  return {
    identidad: process.env.BOLD_API_KEY ?? "",
    secreta: process.env.BOLD_SECRET_KEY ?? "",
    /** En pruebas Bold firma los webhooks con una clave vacía. */
    pruebas: (process.env.BOLD_ENTORNO ?? "pruebas") !== "produccion",
  };
}

function cabeceras() {
  return { Authorization: `x-api-key ${llaves().identidad}`, "Content-Type": "application/json" };
}

/**
 * Verifica x-bold-signature: hex(HMAC-SHA256(secreto, base64(cuerpo))).
 * En modo pruebas el secreto es una cadena vacía (documentado por Bold).
 */
export function verificarFirmaBold(cuerpo: string, firma: string | null) {
  if (!firma) throw badRequest("Webhook de Bold sin firma");
  const k = llaves();
  const secreto = k.pruebas ? "" : k.secreta;
  const esperado = createHmac("sha256", secreto).update(Buffer.from(cuerpo).toString("base64")).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(firma.toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw badRequest("Firma de webhook Bold inválida");
}

function mapearEstado(status: string | undefined): PagoConsultado["estado"] {
  switch (status) {
    case "PAID":
      return "APROBADO";
    case "REJECTED":
      return "RECHAZADO";
    case "EXPIRED":
    case "CANCELLED":
      return "EXPIRADO";
    default:
      // ACTIVE (sin pagar o reintentable) y PROCESSING
      return "PENDIENTE";
  }
}

export const bold: Pasarela = {
  id: "BOLD",
  nombre: "Bold",
  metodos: ["Tarjeta crédito/débito", "PSE", "Nequi", "Botón Bancolombia"],

  configurada() {
    return Boolean(llaves().identidad);
  },

  async crearPago({ orden, urlRetorno, minutos }: CrearPagoInput): Promise<PagoCreado> {
    if (!llaves().identidad) throw serviceUnavailable("Bold no está configurado (BOLD_API_KEY)");
    // Bold expresa la expiración en nanosegundos desde la época Unix.
    const expiraNs = BigInt(Date.now() + minutos * 60_000) * BigInt(1_000_000);
    const cuerpo: Record<string, unknown> = {
      amount_type: "CLOSE",
      amount: {
        currency: "COP",
        // Bold trabaja en pesos (sin centavos).
        total_amount: Math.round(orden.total_centavos / 100),
        tip_amount: 0,
      },
      description: `Agenda Mayor · ${orden.evento.titulo}`.slice(0, 100),
      reference: orden.codigo,
      payer_email: orden.correo_comprador,
      expiration_date: Number(expiraNs),
      payment_methods: ["CREDIT_CARD", "PSE", "NEQUI", "BOTON_BANCOLOMBIA"],
    };
    // Bold solo acepta callback_url con https:// (en local se omite).
    if (urlRetorno.startsWith("https://")) cuerpo.callback_url = urlRetorno;

    const r = await fetch(`${API}/online/link/v1`, { method: "POST", headers: cabeceras(), body: JSON.stringify(cuerpo), cache: "no-store" });
    const json = (await r.json().catch(() => null)) as { payload?: { payment_link: string; url: string }; errors?: unknown[] } | null;
    if (!r.ok || !json?.payload?.url) {
      // El detalle de Bold queda en el log del servidor, nunca en la respuesta.
      console.error("[Bold] no creó el link de pago", r.status, JSON.stringify(json?.errors ?? json).slice(0, 500));
      throw internal("No pudimos iniciar el pago con Bold");
    }
    return { url: json.payload.url, referencia: json.payload.payment_link };
  },

  async consultarPago({ pasarela_referencia }): Promise<PagoConsultado> {
    if (!pasarela_referencia) return { estado: "PENDIENTE", transaccionId: null, metodo: null };
    const r = await fetch(`${API}/online/link/v1/${encodeURIComponent(pasarela_referencia)}`, { headers: cabeceras(), cache: "no-store" });
    if (!r.ok) return { estado: "PENDIENTE", transaccionId: null, metodo: null };
    const link = (await r.json()) as { status?: string; transaction_id?: string | null; payment_method?: string | null };
    return { estado: mapearEstado(link.status), transaccionId: link.transaction_id ?? null, metodo: link.payment_method ?? null };
  },
};
