"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/icons/x";
import { BtnIcono } from "@/components/ui/botones";
import { useAtraparFoco } from "@/components/ui/foco";
import { cn } from "@/lib/utils";

/**
 * Modal accesible con presencia animada.
 * Backdrop y Escape cierran, foco atrapado y devuelto al cerrar,
 * scroll del fondo bloqueado. Portal al body para escapar de transforms.
 */
export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  ancho = "max-w-2xl",
  pie,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: ReactNode;
  descripcion?: ReactNode;
  children: ReactNode;
  ancho?: string;
  pie?: ReactNode;
}) {
  const tituloId = useId();
  const descId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useAtraparFoco(ref, abierto, onCerrar);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-unimayor-950/55 backdrop-blur-[3px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onCerrar();
          }}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            aria-describedby={descripcion ? descId : undefined}
            tabIndex={-1}
            className={cn(
              "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-tile bg-white shadow-pop outline-none sm:rounded-tile",
              ancho
            )}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line-soft px-6 pt-5 pb-4">
              <div className="min-w-0">
                <h2 id={tituloId} className="text-xl font-extrabold text-unimayor-900">
                  {titulo}
                </h2>
                {descripcion && (
                  <p id={descId} className="mt-1 text-sm text-muted">
                    {descripcion}
                  </p>
                )}
              </div>
              <BtnIcono icono={XIcon} etiqueta="Cerrar" onClick={onCerrar} className="-mt-1 -mr-2 shrink-0" />
            </header>
            <div className="scroll-fino flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {pie && <footer className="border-t border-line-soft bg-unimayor-tint px-6 py-4">{pie}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
