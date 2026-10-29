/**
 * Helper de acceso a la API propia — capa de Presentación.
 * Las páginas NUNCA llaman a Supabase ni a modelo/* directo: solo /api/*.
 */

interface Envelope<T> {
  data: T | null;
  error: { message: string; details?: unknown } | null;
}

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

async function baseUrl(): Promise<string> {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch {
    // fuera de request scope (build) — fallback a localhost
  }
  return "http://localhost:3000";
}

/**
 * Mensajes para el usuario según el código HTTP. Nunca se muestra el detalle
 * técnico (stack, "Unexpected token…", nombres de tablas): eso solo va a la
 * consola, para no filtrar información útil a un atacante.
 */
const MENSAJE_POR_ESTADO: Record<number, string> = {
  0: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  400: "Revisa los datos del formulario e inténtalo de nuevo.",
  401: "Tu sesión no es válida. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas. Es posible que ya no esté disponible.",
  409: "No se pudo completar porque los datos cambiaron. Actualiza la página e inténtalo de nuevo.",
  429: "Hiciste demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.",
  503: "El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.",
};

const MENSAJE_GENERICO = "Ocurrió un problema inesperado. Inténtalo de nuevo en unos minutos.";

function mensajePorEstado(status: number) {
  return MENSAJE_POR_ESTADO[status] ?? (status >= 500 ? MENSAJE_GENERICO : MENSAJE_POR_ESTADO[400]);
}

/**
 * El servidor ya responde mensajes curados (ApiError). Solo se reescriben los
 * genéricos: "Datos inválidos" pasa al primer motivo de validación y los 500
 * a un texto amable sin detalles internos.
 */
function mensajeAmigable(error: NonNullable<Envelope<unknown>["error"]>, status: number) {
  if (status >= 500) return mensajePorEstado(status);
  if (error.message === "Datos inválidos" && Array.isArray(error.details)) {
    const primero = (error.details as { message?: unknown }[]).find((d) => typeof d?.message === "string");
    if (primero) return String(primero.message);
  }
  return error.message || mensajePorEstado(status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await baseUrl();
  const url = path.startsWith("/") ? `${base}${path}` : path;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch (e) {
    console.error("[api] fallo de red", url, e);
    throw new ApiHttpError(mensajePorEstado(0), 0);
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch (e) {
    // Respuesta no JSON (página HTML de error, proxy, servidor reiniciándose…)
    console.error("[api] respuesta no JSON", res.status, url, e);
    throw new ApiHttpError(mensajePorEstado(res.ok ? 500 : res.status), res.status);
  }

  if (body?.error) {
    throw new ApiHttpError(mensajeAmigable(body.error, res.status), res.status);
  }
  if (!res.ok) throw new ApiHttpError(mensajePorEstado(res.status), res.status);
  return body?.data as T;
}

/**
 * Texto seguro para mostrar al usuario a partir de cualquier error capturado.
 * Solo los ApiHttpError (ya curados) llegan a la pantalla; cualquier otra
 * excepción se reemplaza por `alternativa`.
 */
export function mensajeDeError(error: unknown, alternativa = MENSAJE_GENERICO): string {
  if (error instanceof ApiHttpError) return error.message;
  console.error(error);
  return alternativa;
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init);
}

/**
 * Headers con las cookies del request actual (solo Server Components).
 * Permite que las páginas autenticadas consuman /api/* con sesión.
 */
export async function headersConSesion(): Promise<HeadersInit> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return { Cookie: jar.toString() };
}

export function apiPost<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function apiPatch<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
