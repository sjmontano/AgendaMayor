import { createHmac } from "crypto";
import { badRequest, internal } from "@/lib/errors";

/**
 * Adapter de la pasarela de pagos Bold (https://developers.bold.co).
 *
 * Es el único archivo que conoce la API de Bold. La taquilla solo llama a
 * crearLinkDePago() y consultarPago(); si mañana se cambia de pasarela,
 * se reemplaza este archivo sin tocar el service.
 *
 * Variables de entorno: BOLD_API_KEY, BOLD_SECRET_KEY y BOLD_ENTORNO
 * ("pruebas" o "produccion").
 */
const API_BOLD = "https://integrations.api.bold.co";

/** Estados de pago que entiende nuestra aplicación. */
export type EstadoPago = "PAGADA" | "RECHAZADA" | "EXPIRADA" | "PENDIENTE";

function cabeceras() {
  return {
    Authorization: `x-api-key ${process.env.BOLD_API_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

export interface DatosLinkDePago {
  referencia: string; // código de nuestra orden
  totalPesos: number;
  descripcion: string;
  correo: string;
  urlRetorno: string; // a dónde vuelve el comprador después de pagar
  minutosVigencia: number;
}

/** Crea un link de pago en Bold y retorna la URL a la que se envía al comprador. */
export async function crearLinkDePago(datos: DatosLinkDePago): Promise<{ url: string; idLink: string }> {
  if (!process.env.BOLD_API_KEY) throw internal("Bold no está configurado (BOLD_API_KEY)");

  // Bold pide la fecha de expiración en nanosegundos
  const expiraEnNanosegundos = (Date.now() + datos.minutosVigencia * 60_000) * 1_000_000;

  const cuerpo: Record<string, unknown> = {
    amount_type: "CLOSE",
    amount: { currency: "COP", total_amount: datos.totalPesos, tip_amount: 0 },
    description: datos.descripcion.slice(0, 100),
    reference: datos.referencia,
    payer_email: datos.correo,
    expiration_date: expiraEnNanosegundos,
  };
  // Bold solo acepta URLs de retorno con https (en local se omite)
  if (datos.urlRetorno.startsWith("https://")) cuerpo.callback_url = datos.urlRetorno;

  const respuesta = await fetch(`${API_BOLD}/online/link/v1`, {
    method: "POST",
    headers: cabeceras(),
    body: JSON.stringify(cuerpo),
    cache: "no-store",
  });
  const json = await respuesta.json().catch(() => null);

  if (!respuesta.ok || !json?.payload?.url) {
    console.error("[Bold] no se pudo crear el link", respuesta.status, json);
    throw internal("No pudimos iniciar el pago con Bold");
  }
  return { url: json.payload.url, idLink: json.payload.payment_link };
}

/** Consulta en Bold el estado de un link de pago. */
export async function consultarPago(idLink: string): Promise<EstadoPago> {
  const respuesta = await fetch(`${API_BOLD}/online/link/v1/${encodeURIComponent(idLink)}`, {
    headers: cabeceras(),
    cache: "no-store",
  });
  if (!respuesta.ok) return "PENDIENTE";

  const link = await respuesta.json();
  switch (link.status) {
    case "PAID":
      return "PAGADA";
    case "REJECTED":
      return "RECHAZADA";
    case "EXPIRED":
    case "CANCELLED":
      return "EXPIRADA";
    default:
      return "PENDIENTE";
  }
}

/**
 * Verifica la firma del webhook (cabecera x-bold-signature):
 * HMAC-SHA256 del cuerpo en base64, firmado con la llave secreta.
 * En el ambiente de pruebas Bold firma con una llave vacía.
 */
export function verificarFirma(cuerpo: string, firma: string | null): void {
  const enPruebas = (process.env.BOLD_ENTORNO ?? "pruebas") !== "produccion";
  const secreto = enPruebas ? "" : (process.env.BOLD_SECRET_KEY ?? "");
  const esperada = createHmac("sha256", secreto)
    .update(Buffer.from(cuerpo).toString("base64"))
    .digest("hex");

  if (!firma || firma.toLowerCase() !== esperada) {
    throw badRequest("Firma del webhook de Bold inválida");
  }
}
