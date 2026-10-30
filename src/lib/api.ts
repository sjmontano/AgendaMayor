/**
 * Ayuda para que los componentes del navegador llamen a la API propia (/api/*).
 * Todas las respuestas de la API tienen la forma { data, error }.
 * Si hay error, se lanza con el mensaje que envió el servidor.
 */
export async function llamarApi<T = unknown>(
  url: string,
  metodo: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  datos?: unknown
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: datos ? { "Content-Type": "application/json" } : undefined,
      body: datos ? JSON.stringify(datos) : undefined,
    });
  } catch {
    throw new Error("No pudimos conectar con el servidor. Revisa tu conexión.");
  }

  const json = await respuesta.json().catch(() => null);
  if (!respuesta.ok || json?.error) {
    throw new Error(mensajeDeError(json?.error, respuesta.status));
  }
  return json.data as T;
}

/** Convierte el error de la API en un texto entendible para el usuario. */
function mensajeDeError(error: { message?: string; details?: { message?: string }[] } | undefined, status: number) {
  if (status >= 500) return "Ocurrió un problema en el servidor. Inténtalo de nuevo.";
  // Errores de validación Zod: se muestra el primer motivo
  if (error?.message === "Datos inválidos" && error.details?.[0]?.message) {
    return error.details[0].message;
  }
  return error?.message ?? "No se pudo completar la acción.";
}
