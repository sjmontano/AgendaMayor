"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Encabezado de sección — evolución de `.um-title__bar` del portal:
 * barra dorada vertical que crece al entrar en viewport + eyebrow + título.
 */
export function EncabezadoSeccion({
  eyebrow,
  titulo,
  descripcion,
  accion,
  oscuro = false,
  como: Titulo = "h2",
  className,
}: {
  eyebrow?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  accion?: ReactNode;
  oscuro?: boolean;
  como?: "h1" | "h2";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "-40px" });
  const reducido = useReducedMotion();

  return (
    <div ref={ref} className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="flex max-w-2xl gap-4">
        <motion.span
          aria-hidden="true"
          className="mt-1 w-1 shrink-0 origin-top rounded-full bg-gold"
          initial={reducido ? false : { scaleY: 0 }}
          animate={visible ? { scaleY: 1 } : undefined}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div>
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-bold tracking-[0.2em] uppercase",
                oscuro ? "text-gold" : "text-unimayor-700"
              )}
            >
              {eyebrow}
            </p>
          )}
          <Titulo
            className={cn(
              "mt-1 font-extrabold tracking-[-0.02em] text-balance",
              Titulo === "h1" ? "text-[clamp(2rem,4vw,3rem)] leading-[1.05]" : "text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.1]",
              oscuro ? "text-white" : "text-unimayor-900"
            )}
          >
            {titulo}
          </Titulo>
          {descripcion && (
            <p className={cn("mt-2 text-[15px] leading-relaxed text-pretty", oscuro ? "text-white/80" : "text-muted")}>
              {descripcion}
            </p>
          )}
        </div>
      </div>
      {accion}
    </div>
  );
}
