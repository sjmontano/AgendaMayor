"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/icons/x";
import { BtnIcono } from "@/components/ui/botones";
import { useAtraparFoco } from "@/components/ui/foco";

/**
 * Drawer lateral — adaptación de MotionDrawer (docs/design/motion-referencias.md):
 * spring de entrada, arrastre para cerrar (umbral 30%), overlay con blur,
 * role="dialog", foco atrapado, Escape y retorno del foco.
 * Con reduced-motion: solo opacidad, sin arrastre.
 */
export function Drawer({
  abierto,
  onCerrar,
  titulo,
  children,
  lado = "derecha",
  ancho = 340,
  pie,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  lado?: "izquierda" | "derecha";
  ancho?: number;
  pie?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const reducido = useReducedMotion();
  useAtraparFoco(ref, abierto, onCerrar);

  const fuera = lado === "izquierda" ? -ancho : ancho;

  function alSoltar(_: unknown, info: PanInfo) {
    const hacia = lado === "izquierda" ? -info.offset.x : info.offset.x;
    if (hacia > ancho * 0.3 || Math.abs(info.velocity.x) > 600) onCerrar();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-unimayor-950/45 backdrop-blur-[2px]"
            onClick={onCerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            className={`absolute inset-y-0 ${lado === "izquierda" ? "left-0" : "right-0"} flex max-w-[88vw] flex-col bg-white shadow-pop outline-none`}
            style={{ width: ancho }}
            drag={reducido ? false : "x"}
            dragConstraints={lado === "izquierda" ? { left: -ancho, right: 0 } : { left: 0, right: ancho }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={alSoltar}
            initial={reducido ? { opacity: 0 } : { x: fuera }}
            animate={reducido ? { opacity: 1 } : { x: 0 }}
            exit={reducido ? { opacity: 0 } : { x: fuera }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            <header className="flex items-center justify-between border-b border-line-soft px-5 py-3">
              <h2 id={tituloId} className="text-base font-extrabold text-unimayor-900">
                {titulo}
              </h2>
              <BtnIcono icono={XIcon} etiqueta="Cerrar menú" onClick={onCerrar} />
            </header>
            <div className="scroll-fino flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {pie && <footer className="border-t border-line-soft px-5 py-4">{pie}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
