"use client";

import { useState } from "react";
import { MapPinIcon } from "@/components/icons/map-pin";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { BadgeTipo, Badge } from "@/components/ui/badge";
import { useIcono } from "@/components/ui/icono";
import { badge } from "@/lib/design-tokens";
import { cn, fechaCorta } from "@/lib/utils";

/**
 * Card de evento — imagen con chip de fecha tipo calendario, tipo, título y lugar.
 * Variante RSS (portal) enlaza al origen en unimayor.edu.co.
 */
export interface EventoCardData {
  id_evento: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  lugar: string;
  es_virtual: boolean;
  facultad: string | null;
  imagen: string | null;
}

export interface EventoRssData {
  id_rss: number;
  titulo: string;
  urlOrigen: string;
  descripcionTexto: string;
  imagen: string | null;
  lugar: string | null;
  publicadoEn: string | null;
}

function ChipFecha({ fecha }: { fecha: string }) {
  const { dia, mes } = fechaCorta(fecha);
  return (
    <div className="absolute top-3 left-3 flex w-14 flex-col overflow-hidden rounded-box bg-white text-center shadow-soft">
      <span className="bg-unimayor-900 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">{mes}</span>
      <span className="py-1 text-xl leading-none font-black text-unimayor-900 tabular-nums">{dia}</span>
    </div>
  );
}

function Portada({ imagen, etiqueta }: { imagen: string | null; etiqueta: string }) {
  // Si la imagen remota falla (enlace roto del portal), se usa el fondo institucional
  const [fallo, setFallo] = useState(false);
  return imagen && !fallo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imagen}
      alt=""
      loading="lazy"
      onError={() => setFallo(true)}
      className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-emphasis)] group-hover:scale-[1.06]"
    />
  ) : (
    <div className="bg-grid-dark flex size-full items-center justify-center bg-gradient-to-br from-unimayor-900 to-unimayor-950" aria-hidden="true">
      <span className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase">{etiqueta}</span>
    </div>
  );
}

const marco =
  "group relative flex h-full flex-col overflow-hidden rounded-tile border border-line bg-white transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-emphasis)] hover:-translate-y-1 hover:border-unimayor-900/25 hover:shadow-lift focus-within:-translate-y-1 focus-within:shadow-lift";

export function EventoCard({ evento }: { evento: EventoCardData }) {
  const { ref, disparadores } = useIcono();
  return (
    <article {...disparadores} className={marco}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Portada imagen={evento.imagen} etiqueta="Evento UNIMAYOR" />
        <ChipFecha fecha={evento.fecha_inicio} />
        <BadgeTipo tipo={evento.tipo} className="absolute top-3 right-3 shadow-soft" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {evento.facultad && (
          <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">{evento.facultad}</p>
        )}
        <h3 className="mt-1 line-clamp-2 text-[17px] leading-snug font-extrabold text-ink group-hover:text-unimayor-900">
          {evento.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{evento.descripcion}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-bold text-unimayor-700">
          <MapPinIcon ref={ref} size={16} aria-hidden="true" />
          {evento.es_virtual ? "Virtual" : evento.lugar}
        </div>
      </div>
    </article>
  );
}

export function EventoRssCard({ evento }: { evento: EventoRssData }) {
  const { ref, disparadores } = useIcono();
  return (
    <article {...disparadores} className={marco}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Portada imagen={evento.imagen} etiqueta="Portal UNIMAYOR" />
        {evento.publicadoEn && <ChipFecha fecha={evento.publicadoEn} />}
        <Badge className={cn(badge.portal, "absolute top-3 right-3 bg-white shadow-soft")}>
          <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
          Portal
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[17px] leading-snug font-extrabold text-ink group-hover:text-unimayor-900">
          <a
            href={evento.urlOrigen}
            target="_blank"
            rel="noopener noreferrer"
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-tile focus-visible:after:outline-3 focus-visible:after:outline-unimayor-900"
          >
            {evento.titulo}
            <span className="sr-only"> (abre unimayor.edu.co en nueva ventana)</span>
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{evento.descripcionTexto}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[13px] font-bold text-unimayor-700">
          <span>{evento.lugar ?? "UNIMAYOR"}</span>
          <ExternalLinkIcon ref={ref} size={16} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
