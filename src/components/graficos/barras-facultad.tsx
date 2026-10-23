"use client";

import Link from "next/link";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * Proyectos por facultad — barras horizontales de un solo tono con etiqueta
 * directa (comparación de magnitud; no requiere paleta categórica).
 * Cada fila enlaza a la vitrina filtrada.
 */
export function BarrasFacultad({
  datos,
}: {
  datos: { etiqueta: string; total: number }[];
}) {
  const ref = useRef<HTMLUListElement>(null);
  const visible = useInView(ref, { once: true, margin: "-40px" });
  const reducido = useReducedMotion();
  const max = Math.max(1, ...datos.map((d) => d.total));

  return (
    <ul ref={ref} className="space-y-3.5">
      {datos.map((d, i) => (
        <li key={d.etiqueta}>
          <Link
            href={`/proyectos?facultad=${encodeURIComponent(d.etiqueta)}`}
            className="group block rounded-lg"
            aria-label={`${d.etiqueta}: ${d.total} proyectos publicados. Ver en la vitrina`}
          >
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate font-semibold text-ink group-hover:text-unimayor-900 group-hover:underline group-hover:underline-offset-4">
                {d.etiqueta}
              </span>
              <span className="font-extrabold text-ink tabular-nums">{d.total}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line-soft">
              <div
                className="h-full rounded-full bg-unimayor-900 transition-[width] duration-1000 ease-[var(--ease-emphasis)] group-hover:bg-unimayor-nav"
                style={{
                  width: visible || reducido ? `${Math.max(2, (d.total / max) * 100)}%` : "0%",
                  transitionDelay: reducido ? "0ms" : `${200 + i * 80}ms`,
                }}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
