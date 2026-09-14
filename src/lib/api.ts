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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await baseUrl();
  const url = path.startsWith("/") ? `${base}${path}` : path;
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = (await res.json()) as Envelope<T>;
  if (body.error) {
    throw new ApiHttpError(body.error.message, res.status);
  }
  return body.data as T;
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
