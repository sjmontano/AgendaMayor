"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tira de actividad diaria (patrón "PnL strip" de Web3Bento): una barra por día,
 * un solo tono, crece desde la base al entrar en viewport. Al pasar el puntero
 * la línea inferior muestra el día activo. Teclado y lectores de pantalla
 * reciben los mismos datos en la tabla oculta (barras < 24px no son objetivos).
 */
export function Actividad({
  datos,
  etiqueta,
  tono = "claro",
}: {
  datos: { fecha: string; total: number }[];
  etiqueta: string;
  tono?: "claro" | "azul";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "-40px" });
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState<number | null>(null);
  const max = Math.max(1, ...datos.map((d) => d.total));
  const total = datos.reduce((s, d) => s + d.total, 0);

  const formato = (f: string) =>
    new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" });

  const claro = tono === "claro";

  return (
    <div className="flex flex-1 flex-col">
      <div
        ref={ref}
        className="flex flex-1 items-end gap-[3px]"
        style={{ minHeight: 88 }}
        onPointerLeave={() => setActivo(null)}
      >
        {datos.map((d, i) => {
          const alto = d.total === 0 ? 6 : 14 + (d.total / max) * 86;
          const enfocado = activo === i;
          return (
            <div
              key={d.fecha}
              onPointerEnter={() => setActivo(i)}
              aria-hidden="true"
              className="group/barra relative flex h-full flex-1 items-end rounded-[3px]"
            >
              <span
                className={cn(
                  "block w-full rounded-t-[4px] rounded-b-[2px] transition-[height,opacity,background-color] ease-[var(--ease-emphasis)]",
                  claro ? "bg-unimayor-900" : "bg-white",
                  d.total === 0 && (claro ? "bg-unimayor-900/15" : "bg-white/20")
                )}
                style={{
                  height: visible || reducido ? `${alto}%` : "4%",
                  opacity: activo === null ? (d.total === 0 ? 1 : 0.45 + (d.total / max) * 0.55) : enfocado ? 1 : 0.3,
                  transitionDuration: `900ms, 200ms, 200ms`,
                  transitionDelay: reducido ? "0ms" : `${i * 16}ms, 0ms, 0ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={cn("mt-2 flex items-center justify-between text-[11px]", claro ? "text-muted" : "text-white/70")}>
        <span>{formato(datos[0].fecha)}</span>
        <span className={cn("font-bold", claro ? "text-ink" : "text-white")} aria-live="polite">
          {activo !== null
            ? `${formato(datos[activo].fecha)} · ${datos[activo].total} proyecto${datos[activo].total === 1 ? "" : "s"}`
            : `${total} en ${datos.length} días`}
        </span>
        <span>Hoy</span>
      </div>
      <table className="sr-only">
        <caption>{etiqueta}</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Proyectos</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.fecha}>
              <td>{formato(d.fecha)}</td>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
