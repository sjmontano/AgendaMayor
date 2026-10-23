"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn, tiempoRelativo } from "@/lib/utils";
import { tipoDe, type Notificacion } from "@/components/notificaciones/use-notificaciones";

const estilo = {
  publicado: { fondo: "bg-success-soft text-success", d: "m5 12 5 5 9-10" },
  rechazado: { fondo: "bg-error-soft text-error", d: "M6 6l12 12M18 6 6 18" },
  revision: { fondo: "bg-warning-soft text-warning", d: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" },
  info: { fondo: "bg-unimayor-100 text-unimayor-900", d: "M12 11v6m0-9.5v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" },
};

/**
 * Ítem de notificación: icono por tipo, mensaje, tiempo relativo, punto de no leída.
 * Al abrir el proyecto o pulsar "Marcar leída" se marca (optimista).
 */
export function NotificacionItem({
  n,
  onMarcar,
  orden = 0,
  compacto = false,
}: {
  n: Notificacion;
  onMarcar: (id: number) => void;
  orden?: number;
  compacto?: boolean;
}) {
  const tipo = tipoDe(n);
  const e = estilo[tipo];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ delay: Math.min(orden * 0.04, 0.3), duration: 0.3 }}
      className={cn(
        "group relative flex gap-3 rounded-box p-3 transition-colors",
        n.leida ? "hover:bg-line-soft/70" : "bg-unimayor-tint hover:bg-unimayor-100"
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", e.fondo)} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={e.d} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] leading-snug text-ink", !n.leida && "font-bold", compacto && "line-clamp-2")}>
          {n.mensaje}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <time dateTime={n.fecha} className="text-muted">
            {tiempoRelativo(n.fecha)}
          </time>
          {n.proyecto_id && (
            <Link
              href={`/proyectos/${n.proyecto_id}`}
              onClick={() => !n.leida && onMarcar(n.id_notificacion)}
              className="font-bold text-unimayor-700 underline-offset-4 hover:underline"
            >
              Ver proyecto
            </Link>
          )}
          {!n.leida && (
            <button
              type="button"
              onClick={() => onMarcar(n.id_notificacion)}
              className="font-bold text-muted underline-offset-4 hover:text-unimayor-900 hover:underline"
            >
              Marcar leída
            </button>
          )}
        </div>
      </div>
      {!n.leida && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-label="Sin leer" />
      )}
    </motion.li>
  );
}
