"use client";

import { useState } from "react";
import Link from "next/link";
import { badge } from "@/lib/design-tokens";
import { ProyectoModal } from "@/components/vitrina/proyecto-modal";

/**
 * Card de proyecto — Vista (capa de Presentación).
 * Datos con forma de ProyectoRow pero declarados aquí:
 * la Vista nunca importa el Modelo (@/modelo).
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
  autor: {
    username: string;
    nombre: string;
    apellido: string;
    avatar: string | null;
  } | null;
}

const badgeTipo: Record<string, string> = {
  OFICIAL: badge.tipoOficial,
  EAFI: badge.tipoEafi,
  COMUNIDAD: badge.tipoComunidad,
};

export function ProyectoCard({ proyecto }: { proyecto: ProyectoCardData }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const foto = proyecto.fotos?.[0];
  const abrir = () => setModalAbierto(true);
  const cerrar = () => setModalAbierto(false);

  return (
    <article
      className={`group flex flex-col border-2 border-[#E4E4E7] bg-white rounded-[10px] overflow-hidden transition-all duration-200 hover:bg-[#f8fbfd] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#004884] ${proyecto.destacado ? "ring-2 ring-[#004884]" : ""}`}
    >
      <button
        type="button"
        onClick={abrir}
        aria-label={`Ver detalles de ${proyecto.titulo}`}
        className="block w-full cursor-pointer p-0 text-left"
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt={proyecto.titulo} loading="lazy" className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-[#f8fbfd] text-4xl font-extrabold text-[#004884]/20" aria-hidden="true">
            {proyecto.titulo.charAt(0)}
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          <span className={`${badge.base} ${badge.facultad}`}>{proyecto.facultad}</span>
          <span className={`${badge.base} ${badgeTipo[proyecto.tipo] ?? badge.tipoComunidad}`}>
            {proyecto.tipo}
          </span>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold text-[#333030]">
          <button
            type="button"
            onClick={abrir}
            className="text-left hover:text-[#004884] hover:underline underline-offset-4"
          >
            {proyecto.titulo}
          </button>
        </h3>
        <p className="line-clamp-2 text-sm text-[#333030]/80">{proyecto.descripcion}</p>
        <p className="mt-auto pt-2 text-xs font-semibold text-[#195a90]">
          {proyecto.autor ? `${proyecto.autor.nombre} ${proyecto.autor.apellido} · @${proyecto.autor.username}` : "Autor UNIMAYOR"} · {proyecto.programa}
        </p>
        <div className="pt-1">
          <Link
            href={`/proyectos/${proyecto.id_proyecto}`}
            className="text-xs font-bold tracking-widest text-[#195a90] uppercase underline-offset-4 hover:underline"
          >
            Ver proyecto →
          </Link>
        </div>
      </div>
      <ProyectoModal proyecto={proyecto} abierto={modalAbierto} onCerrar={cerrar} />
    </article>
  );
}
