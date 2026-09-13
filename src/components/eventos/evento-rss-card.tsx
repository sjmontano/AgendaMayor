import { badge } from "@/lib/design-tokens";

/**
 * Card de evento RSS — Vista (capa de Presentación).
 * Muestra eventos leídos directamente del feed de UNIMAYOR (sin DB).
 */
export interface EventoRssData {
  id_rss: number;
  titulo: string;
  urlOrigen: string;
  descripcionTexto: string;
  imagen: string | null;
  lugar: string | null;
  publicadoEn: string | null;
}

export function EventoRssCard({ evento }: { evento: EventoRssData }) {
  const fecha = evento.publicadoEn
    ? new Date(evento.publicadoEn).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="group bg-white ring-2 ring-transparent rounded-[10px] border-2 border-[#E4E4E7] overflow-hidden transition-all duration-200 hover:shadow-[4px_4px_0_#004884] hover:ring-[#004884]">
      {evento.imagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={evento.imagen}
          alt={evento.titulo}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-[#004884] text-white" aria-hidden="true">
          <span className="px-4 text-center text-sm font-bold tracking-widest uppercase">Portal UNIMAYOR</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-5">
        <span className={`${badge.base} bg-[#195a90]/10 text-[#195a90] self-start`}>
          Portal
        </span>
        <h3 className="line-clamp-2 text-lg font-bold text-[#333030]">{evento.titulo}</h3>
        {fecha && (
          <p className="text-sm font-semibold text-[#195a90]">{fecha}{evento.lugar ? ` · ${evento.lugar}` : ""}</p>
        )}
        <p className="line-clamp-2 text-sm text-zinc-500">{evento.descripcionTexto}</p>
        <a
          href={evento.urlOrigen}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-bold text-[#195a90] underline-offset-4 hover:underline"
        >
          Ver en unimayor.edu.co →
        </a>
      </div>
    </article>
  );
}
