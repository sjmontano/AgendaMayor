"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Modal genérico accesible — Vista (capa de Presentación).
 * Backdrop cierra, Escape cierra, bloquea scroll del fondo,
 * mueve el foco al diálogo al abrir y lo devuelve al cerrar.
 */
export function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  const tituloId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const previoFoco = useRef<Element | null>(null);

  useEffect(() => {
    if (!abierto) return;
    previoFoco.current = document.activeElement;
    dialogoRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
      if (previoFoco.current instanceof HTMLElement) previoFoco.current.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto || typeof document === "undefined") return null;

  // Portal al body: evita que ancestros con transform/overflow (como la card)
  // atrapen al fixed dentro de ellos y el modal salga "dentro de la card".
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[10px] border-2 border-[#004884] bg-white p-6 shadow-[6px_6px_0_#004884] outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={tituloId} className="text-2xl font-extrabold text-[#004884]">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="shrink-0 border-2 border-[#E4E4E7] px-3 py-2 text-sm font-bold text-[#333030] hover:border-[#004884] hover:text-[#004884]"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
