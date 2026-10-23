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

export function fechaLarga(fechaIso: string) {
  return new Date(fechaIso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fechaCorta(fechaIso: string) {
  const d = new Date(fechaIso);
  return {
    dia: d.toLocaleDateString("es-CO", { day: "2-digit" }),
    mes: d.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
  };
}
