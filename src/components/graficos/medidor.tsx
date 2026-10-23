"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * Medidor semicircular (patrón "Gas" de Web3Bento) para un porcentaje único:
 * arco que se llena y aguja que gira. El número es el dato; el arco es apoyo.
 */
export function Medidor({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true });
  const reducido = useReducedMotion();
  const t = Math.max(0, Math.min(1, valor / 100));
  const lleno = visible || reducido ? t : 0;
  const R = 62;
  const largo = Math.PI * R;

  return (
    <div ref={ref} className="flex flex-col items-center" role="img" aria-label={`${etiqueta}: ${valor}%`}>
      <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden="true">
        <path d="M 13 78 A 62 62 0 0 1 137 78" fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-line-soft" />
        <path
          d="M 13 78 A 62 62 0 0 1 137 78"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={largo}
          className="stroke-unimayor-900"
          style={{ strokeDashoffset: largo * (1 - lleno), transition: "stroke-dashoffset 1100ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        <g
          style={{
            transform: `rotate(${-90 + lleno * 180}deg)`,
            transformOrigin: "75px 78px",
            transition: "transform 1100ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <line x1="75" y1="78" x2="75" y2="32" strokeWidth="2.5" strokeLinecap="round" className="stroke-ink" />
        </g>
        <circle cx="75" cy="78" r="5" className="fill-ink" />
      </svg>
      <p className="mt-1 text-[28px] leading-none font-black text-ink tabular-nums">{valor}%</p>
      <p className="mt-1 text-xs text-muted">{etiqueta}</p>
    </div>
  );
}
