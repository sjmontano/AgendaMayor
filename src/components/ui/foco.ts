"use client";

import { useEffect, useRef, type RefObject } from "react";

const ENFOCABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Atrapa el foco dentro de un diálogo/drawer mientras está activo:
 * Tab/Shift+Tab ciclan, Escape cierra, el scroll del fondo se bloquea
 * y al cerrar el foco vuelve al elemento que abrió.
 */
export function useAtraparFoco(ref: RefObject<HTMLElement | null>, activo: boolean, onEscape: () => void) {
  // El callback vive en una ref: un onEscape inline no debe reiniciar el efecto en cada render
  const escape = useRef(onEscape);
  useEffect(() => {
    escape.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!activo) return;
    const previo = document.activeElement as HTMLElement | null;
    const nodo = ref.current;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const primero = nodo?.querySelector<HTMLElement>(ENFOCABLES);
    (primero ?? nodo)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        escape.current();
        return;
      }
      if (e.key !== "Tab" || !nodo) return;
      const items = Array.from(nodo.querySelectorAll<HTMLElement>(ENFOCABLES)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const inicio = items[0];
      const fin = items[items.length - 1];
      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        inicio.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previo?.focus?.();
    };
  }, [activo, ref]);
}
