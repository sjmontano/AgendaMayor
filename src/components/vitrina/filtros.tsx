"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons/search";
import { FACULTADES } from "@/lib/facultades";
import { etiquetaTipo } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Filtros de la vitrina (HU-04) — escriben en el query string (URL compartible).
 * Búsqueda con espera de 350ms, chips de facultad, tipo segmentado y
 * chips de filtros activos removibles. Indica "buscando…" mientras navega.
 */
const TIPOS = ["", "COMUNIDAD", "INSTITUCIONAL", "EAFI"];

export function Filtros({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pendiente, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const primera = useRef(true);

  const facultad = params.get("facultad") ?? "";
  const tipo = params.get("tipo") ?? "";

  function navegar(cambios: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    startTransition(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const t = window.setTimeout(() => navegar({ q: q.trim() }), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activos = [
    facultad && { clave: "facultad", etiqueta: facultad },
    tipo && { clave: "tipo", etiqueta: etiquetaTipo[tipo] ?? tipo },
    params.get("q") && { clave: "q", etiqueta: `“${params.get("q")}”` },
  ].filter(Boolean) as { clave: string; etiqueta: string }[];

  return (
    <div className="space-y-4" role="search" aria-label="Filtrar proyectos">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="buscar-vitrina" className="sr-only">
            Buscar proyectos
          </label>
          <SearchIcon size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="buscar-vitrina"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca por título o palabra clave…"
            className="h-13 w-full rounded-tile border-2 border-line bg-white pr-28 pl-12 text-[15px] text-ink shadow-soft outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-unimayor-900 focus:shadow-[0_0_0_4px_rgb(0_72_132/0.12)]"
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-muted" aria-live="polite">
            {pendiente ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 animate-spin rounded-full border-2 border-unimayor-900 border-t-transparent" aria-hidden="true" />
                Buscando
              </span>
            ) : (
              `${total} ${total === 1 ? "resultado" : "resultados"}`
            )}
          </span>
        </div>
        <div role="radiogroup" aria-label="Tipo de proyecto" className="inline-flex shrink-0 rounded-full bg-white p-1 ring-1 ring-line">
          {TIPOS.map((t) => {
            const activo = tipo === t;
            return (
              <button
                key={t || "todos"}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => navegar({ tipo: t })}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors",
                  activo ? "text-white" : "text-muted hover:text-unimayor-900"
                )}
              >
                {activo && (
                  <motion.span
                    layoutId="filtro-tipo"
                    className="absolute inset-0 rounded-full bg-unimayor-900"
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{t ? etiquetaTipo[t] : "Todos"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2" aria-label="Facultad">
          {[{ slug: "todas", nombre: "" }, ...FACULTADES].map((f) => {
            const activo = facultad === f.nombre;
            return (
              <li key={f.slug}>
                <button
                  type="button"
                  aria-pressed={activo}
                  onClick={() => navegar({ facultad: f.nombre })}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-[background-color,color,box-shadow] duration-200",
                    activo
                      ? "bg-unimayor-900 text-white shadow-soft"
                      : "bg-white text-ink ring-1 ring-line hover:bg-unimayor-100 hover:text-unimayor-900 hover:ring-unimayor-100"
                  )}
                >
                  {f.nombre || "Todas las facultades"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence initial={false}>
        {activos.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap items-center gap-2 overflow-hidden"
          >
            <span className="text-xs font-bold text-muted">Filtrando por:</span>
            {activos.map((a) => (
              <button
                key={a.clave}
                type="button"
                onClick={() => {
                  if (a.clave === "q") setQ("");
                  navegar({ [a.clave]: "" });
                }}
                className="flex items-center gap-1.5 rounded-full bg-gold-soft py-1 pr-2 pl-3 text-xs font-bold text-gold-ink ring-1 ring-gold/40 transition-colors hover:bg-gold/30"
                aria-label={`Quitar filtro ${a.etiqueta}`}
              >
                {a.etiqueta}
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setQ("");
                startTransition(() => router.push(pathname, { scroll: false }));
              }}
              className="text-xs font-bold text-unimayor-700 underline-offset-4 hover:underline"
            >
              Limpiar todo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
