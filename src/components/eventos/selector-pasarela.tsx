"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Selector de método de pago. Muestra solo las pasarelas con llaves
 * configuradas en el servidor (GET /api/pagos/metodos) y, en cada una,
 * los métodos que ofrece (tarjeta, PSE, Nequi, Botón Bancolombia…).
 */
export type PasarelaId = "STRIPE" | "WOMPI" | "BOLD";

export interface PasarelaDisponible {
  id: PasarelaId;
  nombre: string;
  metodos: string[];
}

const DESCRIPCION: Record<PasarelaId, string> = {
  WOMPI: "Pagos locales en Colombia con Bancolombia",
  BOLD: "Pagos locales en Colombia",
  STRIPE: "Tarjetas internacionales",
};

/** Orden sugerido: primero las pasarelas colombianas (PSE, Nequi…). */
const PRIORIDAD: PasarelaId[] = ["WOMPI", "BOLD", "STRIPE"];

export function SelectorPasarela({
  valor,
  onCambio,
}: {
  valor: PasarelaId | null;
  onCambio: (p: PasarelaId) => void;
}) {
  const [opciones, setOpciones] = useState<PasarelaDisponible[] | null>(null);

  useEffect(() => {
    let vivo = true;
    apiGet<PasarelaDisponible[]>("/api/pagos/metodos")
      .then((lista) => {
        if (!vivo) return;
        const ordenadas = [...lista].sort((a, b) => PRIORIDAD.indexOf(a.id) - PRIORIDAD.indexOf(b.id));
        setOpciones(ordenadas);
        if (ordenadas[0]) onCambio(ordenadas[0].id);
      })
      .catch(() => vivo && setOpciones([]));
    return () => {
      vivo = false;
    };
    // Solo al montar: la selección inicial es la pasarela prioritaria.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (opciones === null) {
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="skeleton h-16 rounded-box" />
        <div className="skeleton h-16 rounded-box" />
      </div>
    );
  }

  if (opciones.length === 0) {
    return (
      <p role="alert" className="rounded-box bg-warning-soft px-3 py-2 text-sm font-bold text-warning">
        Los pagos en línea no están disponibles en este momento.
      </p>
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-bold text-ink">Método de pago</legend>
      <div role="radiogroup" className="space-y-2">
        {opciones.map((p) => {
          const activo = valor === p.id;
          return (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-box border-2 p-3 transition-[border-color,background-color] duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-unimayor-900",
                activo ? "border-unimayor-900 bg-unimayor-tint" : "border-line bg-white hover:border-unimayor-100"
              )}
            >
              <input
                type="radio"
                name="pasarela"
                value={p.id}
                checked={activo}
                onChange={() => onCambio(p.id)}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  activo ? "border-unimayor-900 bg-unimayor-900" : "border-line"
                )}
                aria-hidden="true"
              >
                {activo && <span className="size-2 rounded-full bg-white" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold text-ink">{p.nombre}</span>
                <span className="block text-xs text-muted">{DESCRIPCION[p.id]}</span>
                <span className="mt-1.5 flex flex-wrap gap-1">
                  {p.metodos.map((m) => (
                    <span key={m} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-unimayor-900 ring-1 ring-unimayor-100">
                      {m}
                    </span>
                  ))}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
