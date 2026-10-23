"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion as tokens } from "@/lib/design-tokens";

/**
 * Reveal — adaptación de TimelineAnimation (docs/design/motion-referencias.md).
 * Fade + subida + blur ligero (≤ 6px) al entrar en viewport.
 * `orden` escalona en pasos de 80ms. Con reduced-motion el contenido
 * aparece directamente, sin desplazamiento.
 */
const variantes: Variants = {
  oculto: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: (orden: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: Math.min(orden * tokens.stagger, 0.48), duration: 0.55, ease: tokens.easeEmphasis },
  }),
};

type Etiqueta = "div" | "section" | "li" | "article" | "header" | "p" | "span" | "h2";

export function Reveal({
  children,
  orden = 0,
  className,
  como = "div",
  margen = "-60px",
}: {
  children: ReactNode;
  orden?: number;
  className?: string;
  como?: Etiqueta;
  margen?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, margin: margen as `${number}px` });
  const reducido = useReducedMotion();
  const Componente = motion[como] as typeof motion.div;

  if (reducido) {
    const Plano = como;
    return <Plano className={className}>{children}</Plano>;
  }

  return (
    <Componente
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(className)}
      variants={variantes}
      initial="oculto"
      animate={visible ? "visible" : "oculto"}
      custom={orden}
    >
      {children}
    </Componente>
  );
}
