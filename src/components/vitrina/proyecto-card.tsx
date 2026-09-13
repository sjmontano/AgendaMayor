import Link from "next/link";
import { badge } from "@/lib/design-tokens";

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
  const foto = proyecto.fotos?.[0];
  return (
    <article
      className={`group flex flex-col border-2 border-[#E4E4E7] bg-white rounded-[10px] overflow-hidden transition-all duration-200 hover:bg-[#f8fbfd] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#004884] ${proyecto.destacado ? "ring-2 ring-[#004884]" : ""}`}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt={proyecto.titulo} loading="lazy" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-[#f8fbfd] text-4xl font-extrabold text-[#004884]/20" aria-hidden="true">
          {proyecto.titulo.charAt(0)}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          <span className={`${badge.base} ${badge.facultad}`}>{proyecto.facultad}</span>
          <span className={`${badge.base} ${badgeTipo[proyecto.tipo] ?? badge.tipoComunidad}`}>
            {proyecto.tipo}
          </span>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold text-[#333030]">
          <Link href={`/proyectos/${proyecto.id_proyecto}`} className="hover:text-[#004884] hover:underline underline-offset-4">
            {proyecto.titulo}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-[#333030]/80">{proyecto.descripcion}</p>
        <p className="mt-auto pt-2 text-xs font-semibold text-[#195a90]">
          {proyecto.autor ? `${proyecto.autor.nombre} ${proyecto.autor.apellido} · @${proyecto.autor.username}` : "Autor UNIMAYOR"} · {proyecto.programa}
        </p>
      </div>
    </article>
  );
}
