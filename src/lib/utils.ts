import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Iniciales para avatares sin foto. */
export function iniciales(nombre?: string | null, apellido?: string | null) {
  return `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || "U";
}

const RTF = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });

/** "hace 5 minutos", "ayer"… */
export function tiempoRelativo(fechaIso: string, ahora = Date.now()) {
  const diff = (new Date(fechaIso).getTime() - ahora) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return RTF.format(Math.round(diff), "second");
  if (abs < 3600) return RTF.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diff / 3600), "hour");
  if (abs < 604800) return RTF.format(Math.round(diff / 86400), "day");
  if (abs < 2629800) return RTF.format(Math.round(diff / 604800), "week");
  return RTF.format(Math.round(diff / 2629800), "month");
}

/** Zona horaria institucional. Vercel ejecuta en UTC; sin esto un evento
 * de las 8 p. m. puede mostrarse con el día siguiente. */
export const ZONA_HORARIA = "America/Bogota";

export function fechaLarga(fechaIso: string) {
  return new Date(fechaIso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA_HORARIA,
  });
}

export function fechaHoraLarga(fechaIso: string) {
  return new Date(fechaIso).toLocaleString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA_HORARIA,
  });
}

export function horaCorta(fechaIso: string) {
  return new Date(fechaIso).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA_HORARIA,
  });
}

export function fechaCorta(fechaIso: string) {
  const d = new Date(fechaIso);
  return {
    dia: d.toLocaleDateString("es-CO", { day: "2-digit", timeZone: ZONA_HORARIA }),
    mes: d.toLocaleDateString("es-CO", { month: "short", timeZone: ZONA_HORARIA }).replace(".", ""),
  };
}

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formatea pesos colombianos (valor entero en COP). */
export function formatearCOP(valor: number) {
  return COP.format(Math.round(valor));
}

/** Formatea un monto guardado en centavos de COP. */
export function formatearCentavos(centavos: number) {
  return formatearCOP(centavos / 100);
}

/** Convierte pesos a centavos (Stripe recibe la unidad mínima). */
export function aCentavos(cop: number) {
  return Math.round(cop * 100);
}

/** Slug estable para nombres de archivo o referencias. */
export function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
