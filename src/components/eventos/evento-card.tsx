import { badge } from "@/lib/design-tokens";

/**
 * Card de evento — Vista (capa de Presentación).
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

const badgeTipo: Record<string, string> = {
  OFICIAL: badge.tipoOficial,
  EAFI: badge.tipoEafi,
  COMUNIDAD: badge.tipoComunidad,
};

export function EventoCard({ evento }: { evento: EventoCardData }) {
  const fecha = new Date(evento.fecha_inicio).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <article className="group bg-white ring-2 ring-transparent rounded-[10px] border-2 border-[#E4E4E7] overflow-hidden transition-all duration-200 hover:shadow-[4px_4px_0_#004884] hover:ring-[#004884]">
      {evento.imagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={evento.imagen} alt={evento.titulo} loading="lazy" className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-[#004884] text-white" aria-hidden="true">
          <span className="px-4 text-center text-sm font-bold tracking-widest uppercase">Evento UNIMAYOR</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-5">
        <span className={`${badge.base} ${badgeTipo[evento.tipo] ?? badge.tipoComunidad} self-start`}>
          {evento.tipo}
        </span>
        <h3 className="line-clamp-2 text-lg font-bold text-[#333030]">{evento.titulo}</h3>
        <p className="text-sm font-semibold text-[#195a90]">{fecha} · {evento.es_virtual ? "Virtual" : evento.lugar}</p>
      </div>
    </article>
  );
}
