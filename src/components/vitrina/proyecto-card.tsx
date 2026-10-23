"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Avatar } from "@/components/ui/avatar";
import { BadgeEstado, BadgeTipo } from "@/components/ui/badge";
import { useIcono } from "@/components/ui/icono";
import { cn } from "@/lib/utils";

/**
 * Card de proyecto — evolución de `um3-card` del portal: media + etiqueta + título.
 * Toda la card es un enlace (stretched link) al detalle. Hover: eleva,
 * zoom lento de la imagen, flecha que avanza. La Vista declara su tipo:
 * nunca importa el Modelo (@/modelo).
 */
export interface ProyectoCardData {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  fotos: string[];
  facultad: string;
  programa: string;
  tipo: string;
  estado: string;
  destacado: boolean;
  motivo_rechazo?: string | null;
  fecha_registro?: string;
  autor: {
    username: string;
    nombre: string;
    apellido: string;
    avatar: string | null;
  } | null;
}

export function PortadaProyecto({
  proyecto,
  className,
}: {
  proyecto: Pick<ProyectoCardData, "titulo" | "fotos" | "facultad">;
  className?: string;
}) {
  const foto = proyecto.fotos?.[0];
  const [fallo, setFallo] = useState(false);
  if (foto && !fallo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt=""
        loading="lazy"
        onError={() => setFallo(true)}
        className={cn("size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-emphasis)] group-hover:scale-[1.06]", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "bg-grid-dark relative flex size-full items-end overflow-hidden bg-gradient-to-br from-unimayor-900 via-unimayor-800 to-unimayor-950 p-5 transition-transform duration-[900ms] ease-[var(--ease-emphasis)] group-hover:scale-[1.04]",
        className
      )}
      aria-hidden="true"
    >
      <span className="absolute -top-6 -right-2 text-[9rem] leading-none font-black text-white/[0.07] select-none">
        {proyecto.titulo.charAt(0).toUpperCase()}
      </span>
      <span className="relative text-[11px] font-bold tracking-[0.18em] text-gold uppercase">{proyecto.facultad}</span>
    </div>
  );
}

export function ProyectoCard({
  proyecto,
  mostrarEstado = false,
  className,
}: {
  proyecto: ProyectoCardData;
  mostrarEstado?: boolean;
  className?: string;
}) {
  const { ref, disparadores } = useIcono();
  const autor = proyecto.autor;

  return (
    <article
      {...disparadores}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-tile border border-line bg-white transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-emphasis)] focus-within:-translate-y-1 focus-within:shadow-lift hover:-translate-y-1 hover:border-unimayor-900/25 hover:shadow-lift",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-unimayor-100">
        <PortadaProyecto proyecto={proyecto} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-unimayor-950/45 to-transparent" aria-hidden="true" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <BadgeTipo tipo={proyecto.tipo} className="shadow-soft" />
          {mostrarEstado && <BadgeEstado estado={proyecto.estado} className="bg-white shadow-soft" />}
        </div>
        {proyecto.destacado && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-extrabold text-unimayor-950 shadow-soft">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
              <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
            </svg>
            Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">{proyecto.programa}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[17px] leading-snug font-extrabold text-ink transition-colors group-hover:text-unimayor-900">
          <Link
            href={`/proyectos/${proyecto.id_proyecto}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-tile focus-visible:after:outline-3 focus-visible:after:outline-unimayor-900"
          >
            {proyecto.titulo}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{proyecto.descripcion}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar nombre={autor?.nombre} apellido={autor?.apellido} src={autor?.avatar} tamano="sm" />
            <span className="truncate text-[13px] font-semibold text-ink">
              {autor ? `${autor.nombre} ${autor.apellido}` : "Comunidad UNIMAYOR"}
            </span>
          </div>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-unimayor-100 text-unimayor-900 transition-colors duration-300 group-hover:bg-unimayor-900 group-hover:text-white"
            aria-hidden="true"
          >
            <ArrowRightIcon ref={ref} size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
