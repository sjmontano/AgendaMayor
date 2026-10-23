"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Número que sube al entrar en viewport (patrón Web3Bento `useCountUp`).
 * Lectores de pantalla reciben el valor final (aria-label), no la animación.
 */
export function CountUp({
  valor,
  duracion = 1300,
  sufijo = "",
  className,
}: {
  valor: number;
  duracion?: number;
  sufijo?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reducido = useReducedMotion();
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!visible || reducido) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / duracion);
      setActual(valor * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reducido, valor, duracion]);

  const mostrado = reducido ? valor : actual;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{`${valor.toLocaleString("es-CO")}${sufijo}`}</span>
      <span aria-hidden="true" className="tabular-nums">
        {Math.round(mostrado).toLocaleString("es-CO")}
        {sufijo}
      </span>
    </span>
  );
}
