"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Toasts: confirmaciones y errores breves sin bloquear (aria-live).
 * Uso: const toast = useToast(); toast.exito("Proyecto enviado").
 */
type Tipo = "exito" | "error" | "info";
interface Aviso {
  id: number;
  tipo: Tipo;
  titulo: string;
  texto?: string;
}

interface Api {
  exito: (titulo: string, texto?: string) => void;
  error: (titulo: string, texto?: string) => void;
  info: (titulo: string, texto?: string) => void;
}

const Ctx = createContext<Api | null>(null);

export function useToast() {
  const api = useContext(Ctx);
  if (!api) throw new Error("useToast requiere <ProveedorToast>");
  return api;
}

const estilos: Record<Tipo, { barra: string; icono: ReactNode }> = {
  exito: {
    barra: "bg-success",
    icono: <path d="m5 12 5 5 9-10" />,
  },
  error: {
    barra: "bg-error",
    icono: <path d="M12 8v5m0 3.5v.01M4.5 19h15L12 5z" />,
  },
  info: {
    barra: "bg-unimayor-900",
    icono: <path d="M12 11v6m0-9.5v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />,
  },
};

export function ProveedorToast({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const quitar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const agregar = useCallback(
    (tipo: Tipo, titulo: string, texto?: string) => {
      const id = Date.now() + Math.random();
      setAvisos((a) => [...a.slice(-2), { id, tipo, titulo, texto }]);
      window.setTimeout(() => quitar(id), tipo === "error" ? 7000 : 4500);
    },
    [quitar]
  );

  const api = useMemo<Api>(
    () => ({
      exito: (t, x) => agregar("exito", t, x),
      error: (t, x) => agregar("error", t, x),
      info: (t, x) => agregar("info", t, x),
    }),
    [agregar]
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        <AnimatePresence initial={false}>
          {avisos.map((a) => (
            <motion.div
              key={a.id}
              layout
              role={a.tipo === "error" ? "alert" : "status"}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-box bg-white py-3.5 pr-10 pl-4 shadow-pop ring-1 ring-line"
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", estilos[a.tipo].barra)} aria-hidden="true" />
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  a.tipo === "exito" ? "text-success" : a.tipo === "error" ? "text-error" : "text-unimayor-900"
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {estilos[a.tipo].icono}
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{a.titulo}</p>
                {a.texto && <p className="mt-0.5 text-[13px] text-muted">{a.texto}</p>}
              </div>
              <button
                type="button"
                onClick={() => quitar(a.id)}
                aria-label="Cerrar aviso"
                className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-md text-muted hover:bg-line-soft hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
