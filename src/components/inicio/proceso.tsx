"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { FileTextIcon } from "@/components/icons/file-text";
import { ClockIcon } from "@/components/icons/clock";
import { RocketIcon } from "@/components/icons/rocket";
import { useIcono, type IconoAnimado } from "@/components/ui/icono";
import { BadgeEstado } from "@/components/ui/badge";

/**
 * "Del aula a la vitrina": los tres pasos son la máquina de estados del
 * proyecto (EN_REVISION → PUBLICADO) contada para personas. La línea que los
 * une se dibuja al entrar en viewport; cada paso muestra el badge real.
 */
const PASOS: { titulo: string; texto: string; estado: string; icono: IconoAnimado }[] = [
  {
    titulo: "Publica tu proyecto",
    texto: "Con tu correo @unimayor.edu.co sube título, descripción, fotos y datos académicos en un asistente guiado.",
    estado: "BORRADOR",
    icono: FileTextIcon,
  },
  {
    titulo: "Recibe el aval docente",
    texto: "Un docente de tu facultad lo revisa. Si necesita ajustes, verás el motivo y podrás reenviarlo.",
    estado: "EN_REVISION",
    icono: ClockIcon,
  },
  {
    titulo: "Brilla en la vitrina",
    texto: "Queda publicado, aparece en tu perfil y puede tener mesa asignada en el EAFI de tu facultad.",
    estado: "PUBLICADO",
    icono: RocketIcon,
  },
];

function Paso({ p, i }: { p: (typeof PASOS)[number]; i: number }) {
  const { ref, disparadores } = useIcono();
  const Icono = p.icono;
  return (
    <motion.li
      {...disparadores}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-tile border border-line bg-white p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="relative z-10 flex size-14 items-center justify-center rounded-box bg-unimayor-900 text-white shadow-soft ring-4 ring-white transition-colors duration-300 group-hover:bg-gold group-hover:text-unimayor-950">
          <Icono ref={ref} size={26} aria-hidden="true" />
        </span>
        <span
          data-n={`0${i + 1}`}
          className="text-5xl font-black text-unimayor-100 tabular-nums before:content-[attr(data-n)]"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-ink">{p.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{p.texto}</p>
      <BadgeEstado estado={p.estado} className="mt-4" />
    </motion.li>
  );
}

export function Proceso() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const reducido = useReducedMotion();

  return (
    <div ref={ref} className="relative">
      {/* Línea que une los pasos (solo escritorio) */}
      <svg className="pointer-events-none absolute top-[52px] left-[8%] hidden h-2 w-[84%] md:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true">
        <line x1="0" y1="1" x2="100" y2="1" strokeWidth="2" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" className="stroke-unimayor-900/20" />
        <motion.line
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="stroke-gold"
          initial={{ pathLength: reducido ? 1 : 0 }}
          animate={{ pathLength: visible ? 1 : reducido ? 1 : 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <ol className="relative grid gap-5 md:grid-cols-3">
        {PASOS.map((p, i) => (
          <Paso key={p.titulo} p={p} i={i} />
        ))}
      </ol>
    </div>
  );
}
