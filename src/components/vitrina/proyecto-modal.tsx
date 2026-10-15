"use client";

import Link from "next/link";
import { badge } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/modal";
import type { ProyectoCardData } from "@/components/vitrina/proyecto-card";

/**
 * Modal con toda la información del proyecto — Vista (capa de Presentación).
 * Reutiliza los datos de la card (sin fetch adicional) + enlace al detalle.
 */
const badgeTipo: Record<string, string> = {
  OFICIAL: badge.tipoOficial,
  EAFI: badge.tipoEafi,
  COMUNIDAD: badge.tipoComunidad,
};

const badgeEstado: Record<string, string> = {
  PUBLICADO: badge.estadoPublicado,
  EN_REVISION: badge.estadoRevision,
  RECHAZADO: badge.estadoRechazado,
};

export function ProyectoModal({
  proyecto,
  abierto,
  onCerrar,
}: {
  proyecto: ProyectoCardData;
  abierto: boolean;
  onCerrar: () => void;
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={proyecto.titulo}>
      <div className="flex flex-wrap gap-2">
        <span className={`${badge.base} ${badge.facultad}`}>{proyecto.facultad}</span>
        <span className={`${badge.base} ${badgeTipo[proyecto.tipo] ?? badge.tipoComunidad}`}>
          {proyecto.tipo}
        </span>
        <span className={`${badge.base} ${badgeEstado[proyecto.estado] ?? badge.tipoComunidad}`}>
          {proyecto.estado}
        </span>
        {proyecto.destacado && (
          <span className={`${badge.base} ${badge.tipoOficial}`}>Destacado</span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-[#195a90]">
        {proyecto.autor
          ? `${proyecto.autor.nombre} ${proyecto.autor.apellido} · @${proyecto.autor.username}`
          : "Autor UNIMAYOR"}{" "}
        · {proyecto.programa}
      </p>

      {proyecto.fotos?.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {proyecto.fotos.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f}
              src={f}
              alt={proyecto.titulo}
              loading="lazy"
              className="w-full rounded-[10px] border-2 border-[#E4E4E7] object-cover"
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-[1.0625rem] leading-[1.7] whitespace-pre-line">
        {proyecto.descripcion}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/proyectos/${proyecto.id_proyecto}`}
          className="border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]"
        >
          Abrir página →
        </Link>
        <button
          type="button"
          onClick={onCerrar}
          className="border-2 border-[#004884] bg-white px-6 py-3 text-xs font-bold tracking-widest text-[#004884] uppercase hover:bg-[#f8fbfd]"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
