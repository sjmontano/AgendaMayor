"use client";

import { useMemo, useRef } from "react";
import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from "react";

/**
 * Iconos animados (lucide-animated, en components/icons/).
 * Cada icono expone start/stopAnimation por ref; con este hook la animación
 * se dispara desde el contenedor (botón, enlace, card) y no solo al pasar
 * el cursor sobre el SVG. El foco no dispara la animación: el foco programático
 * (al abrir diálogos) la interrumpe y dejaría el icono invisible; el anillo de
 * focus-visible ya da la señal de teclado.
 */
export interface IconoHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export type IconoAnimado = ForwardRefExoticComponent<
  HTMLAttributes<HTMLSpanElement> & { size?: number } & RefAttributes<IconoHandle>
>;

export function useIcono() {
  const ref = useRef<IconoHandle>(null);
  const disparadores = useMemo(
    () => ({
      onMouseEnter: () => ref.current?.startAnimation(),
      onMouseLeave: () => ref.current?.stopAnimation(),
      onFocus: () => undefined,
      onBlur: () => undefined,
    }),
    []
  );
  return { ref, disparadores };
}
