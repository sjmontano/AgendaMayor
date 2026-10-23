"use client";

import { motion } from "motion/react";
import { useId, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Selector segmentado (radiogroup) con indicador que se desliza (layoutId).
 * Teclado: flechas izquierda/derecha cambian la opción, como un radiogroup nativo.
 */
export function Pills<T extends string>({
  valor,
  opciones,
  onCambio,
  etiqueta,
  className,
  tono = "claro",
}: {
  valor: T;
  opciones: { valor: T; etiqueta: string; contador?: number }[];
  onCambio: (v: T) => void;
  etiqueta: string;
  className?: string;
  tono?: "claro" | "azul";
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const siguiente = (i + (e.key === "ArrowRight" ? 1 : -1) + opciones.length) % opciones.length;
    onCambio(opciones[siguiente].valor);
    refs.current[siguiente]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      className={cn(
        "inline-flex rounded-full p-1",
        tono === "claro" ? "bg-line-soft" : "bg-white/10",
        className
      )}
    >
      {opciones.map((o, i) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activo}
            tabIndex={activo ? 0 : -1}
            onClick={() => onCambio(o.valor)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors duration-200",
              activo
                ? tono === "claro"
                  ? "text-white"
                  : "text-unimayor-950"
                : tono === "claro"
                  ? "text-muted hover:text-unimayor-900"
                  : "text-white/75 hover:text-white"
            )}
          >
            {activo && (
              <motion.span
                layoutId={`pill-${id}`}
                className={cn("absolute inset-0 rounded-full", tono === "claro" ? "bg-unimayor-900" : "bg-gold")}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                aria-hidden="true"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.etiqueta}
              {o.contador !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    activo ? "bg-white/20" : "bg-white text-unimayor-900"
                  )}
                >
                  {o.contador}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
