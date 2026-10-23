"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Galería del proyecto: imagen principal + miniaturas; clic abre visor a
 * pantalla completa con flechas del teclado, Escape y contador.
 */
export function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [actual, setActual] = useState(0);
  const [visor, setVisor] = useState(false);

  const mover = useCallback((d: number) => setActual((a) => (a + d + fotos.length) % fotos.length), [fotos.length]);

  useEffect(() => {
    if (!visor) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setVisor(false);
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [visor, mover]);

  if (fotos.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setVisor(true)}
        className="group relative block aspect-[16/9] w-full overflow-hidden rounded-tile bg-line-soft"
        aria-label={`Ampliar imagen ${actual + 1} de ${fotos.length}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={fotos[actual]}
            src={fotos[actual]}
            alt={`${titulo} — imagen ${actual + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </AnimatePresence>
        <span className="absolute right-3 bottom-3 rounded-full bg-unimayor-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {actual + 1} / {fotos.length} · Ampliar
        </span>
      </button>

      {fotos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {fotos.map((f, i) => (
            <li key={f} className="shrink-0">
              <button
                type="button"
                onClick={() => setActual(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === actual}
                className={cn(
                  "block h-16 w-24 overflow-hidden rounded-lg ring-2 transition-[box-shadow,opacity]",
                  i === actual ? "ring-unimayor-900" : "opacity-70 ring-transparent hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visor && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`Imágenes de ${titulo}`}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-unimayor-950/92 p-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && setVisor(false)}
              >
                <motion.img
                  key={fotos[actual]}
                  src={fotos[actual]}
                  alt={`${titulo} — imagen ${actual + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-h-[85vh] max-w-full rounded-box object-contain shadow-pop"
                />
                <button
                  type="button"
                  onClick={() => setVisor(false)}
                  aria-label="Cerrar visor"
                  autoFocus
                  className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                {fotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => mover(-1)}
                      aria-label="Imagen anterior"
                      className="absolute left-3 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(1)}
                      aria-label="Imagen siguiente"
                      className="absolute right-3 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                      ›
                    </button>
                  </>
                )}
                <p className="absolute bottom-4 text-sm font-bold text-white/80" aria-live="polite">
                  {actual + 1} / {fotos.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

/** Copiar enlace al portapapeles (o compartir nativo en móvil). */
export function Compartir({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el usuario canceló */
    }
  }
  return (
    <button
      type="button"
      onClick={compartir}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-box bg-white text-sm font-bold text-unimayor-900 ring-2 ring-unimayor-900/15 ring-inset transition-colors hover:bg-unimayor-tint hover:ring-unimayor-900"
      aria-live="polite"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {copiado ? <path d="m5 12 5 5 9-10" /> : <path d="M15 5h4v4M19 5l-8 8M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />}
      </svg>
      {copiado ? "¡Enlace copiado!" : "Compartir proyecto"}
    </button>
  );
}
