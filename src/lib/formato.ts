/** Funciones para mostrar fechas y precios en formato colombiano. */

export function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

export function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

export function diaYMes(iso: string) {
  const fecha = new Date(iso);
  return {
    dia: fecha.toLocaleDateString("es-CO", { day: "numeric", timeZone: "America/Bogota" }),
    mes: fecha.toLocaleDateString("es-CO", { month: "short", timeZone: "America/Bogota" }).replace(".", ""),
  };
}

export function formatearPrecio(pesos: number) {
  if (pesos === 0) return "Gratis";
  return pesos.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

/** Iniciales para el avatar cuando el usuario no tiene foto. */
export function iniciales(nombre: string, apellido = "") {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}
