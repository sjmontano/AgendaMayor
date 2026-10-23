"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GraduationCapIcon } from "@/components/icons/graduation-cap";
import { StampIcon } from "@/components/icons/stamp";
import { SearchIcon } from "@/components/icons/search";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { useIcono, type IconoAnimado } from "@/components/ui/icono";

/**
 * Accesos por perfil — la `user-card` del portal (caja azul, radio 12px,
 * borde blanco, icono + divisor + texto), mejor ejecutada: entrada escalonada,
 * brillo en borde, icono animado y flecha que avanza al hover.
 */
const ACCESOS: { href: string; titulo: string; texto: string; icono: IconoAnimado }[] = [
  { href: "/proyectos/nuevo", titulo: "Soy estudiante", texto: "Publica tu proyecto", icono: GraduationCapIcon },
  { href: "/panel", titulo: "Soy docente", texto: "Avala los de tu facultad", icono: StampIcon },
  { href: "/proyectos", titulo: "Soy visitante", texto: "Explora la vitrina", icono: SearchIcon },
];

function Acceso({ a, i }: { a: (typeof ACCESOS)[number]; i: number }) {
  const { ref: refIcono, disparadores: dIcono } = useIcono();
  const { ref: refFlecha, disparadores: dFlecha } = useIcono();
  const Icono = a.icono;
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={a.href}
        onMouseEnter={() => {
          dIcono.onMouseEnter();
          dFlecha.onMouseEnter();
        }}
        onMouseLeave={() => {
          dIcono.onMouseLeave();
          dFlecha.onMouseLeave();
        }}
        onFocus={() => {
          dIcono.onFocus();
          dFlecha.onFocus();
        }}
        onBlur={() => {
          dIcono.onBlur();
          dFlecha.onBlur();
        }}
        className="group relative flex items-center gap-3.5 overflow-hidden rounded-box border border-white/80 bg-unimayor-900 px-5 py-4 text-white shadow-lift transition-[transform,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-gold hover:bg-unimayor-800"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine"
        />
        <Icono ref={refIcono} size={26} className="shrink-0 text-gold" aria-hidden="true" />
        <span className="h-8 border-l border-white/60" aria-hidden="true" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-extrabold">{a.titulo}</span>
          <span className="block text-[13px] text-white/80">{a.texto}</span>
        </span>
        <ArrowRightIcon ref={refFlecha} size={18} className="shrink-0 text-white/70 group-hover:text-gold" aria-hidden="true" />
      </Link>
    </motion.li>
  );
}

export function Accesos() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3" aria-label="Accesos por perfil">
      {ACCESOS.map((a, i) => (
        <Acceso key={a.href} a={a} i={i} />
      ))}
    </ul>
  );
}
