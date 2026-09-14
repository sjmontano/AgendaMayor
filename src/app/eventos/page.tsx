import Link from "next/link";
import { apiGet } from "@/lib/api";
import { EventoCard, type EventoCardData } from "@/components/eventos/evento-card";
import { EventoRssCard, type EventoRssData } from "@/components/eventos/evento-rss-card";

/**
 * Cartelera /eventos — Vista (capa de Presentación).
 * Muestra eventos de la BD + eventos en vivo del RSS de UNIMAYOR.
 * Si la BD no tiene datos, muestra solo los RSS (funciona sin Supabase).
 */
export const dynamic = "force-dynamic";

async function fetchDbEvents(): Promise<EventoCardData[]> {
  try {
    const { data } = await apiGet<{ data: EventoCardData[]; total: number }>(
      "/api/eventos?limit=24"
    );
    return data ?? [];
  } catch {
    return [];
  }
}

async function fetchRssEvents(): Promise<EventoRssData[]> {
  try {
    const { data } = await apiGet<{ data: EventoRssData[] }>(
      "/api/eventos/rss"
    );
    return (data ?? []).map((e, i) => ({
      ...e,
      id_rss: i,
    }));
  } catch {
    return [];
  }
}

export default async function EventosPage() {
  const [dbResult, rssResult] = await Promise.allSettled([fetchDbEvents(), fetchRssEvents()]);
  const dbEvents = dbResult.status === "fulfilled" ? dbResult.value : [];
  const rssEvents = rssResult.status === "fulfilled" ? rssResult.value : [];

  const oficiales = dbEvents.filter((e) => e.tipo === "OFICIAL");
  const comunidad = dbEvents.filter((e) => e.tipo !== "OFICIAL");

  const hayDatos = dbEvents.length > 0 || rssEvents.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Cartelera</p>
      <h1 className="mt-1 text-4xl font-extrabold text-[#004884]">Eventos</h1>

      {!hayDatos ? (
        <p className="mt-8 rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-8 text-center text-sm">
          No hay eventos activos por ahora.
        </p>
      ) : (
        <>
          {/* ── Eventos de la BD ── */}
          {oficiales.length > 0 && (
            <section className="mt-8" aria-label="Eventos oficiales importados">
              <h2 className="text-xl font-bold text-[#333030]">Oficiales UNIMAYOR</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {oficiales.map((e) => (
                  <EventoCard key={e.id_evento} evento={e} />
                ))}
              </div>
            </section>
          )}

          {comunidad.length > 0 && (
            <section className="mt-10" aria-label="Eventos de comunidad y EAFI">
              <h2 className="text-xl font-bold text-[#333030]">Comunidad y EAFI</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {comunidad.map((e) => (
                  <EventoCard key={e.id_evento} evento={e} />
                ))}
              </div>
            </section>
          )}

          {/* ── Eventos en vivo del portal ── */}
          {rssEvents.length > 0 && (
            <section className="mt-10" aria-label="Publicaciones del portal UNIMAYOR">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#333030]">Desde el portal</h2>
                <span className="rounded-full bg-[#195a90]/10 px-3 py-1 text-xs font-bold text-[#195a90]">
                  EN VIVO
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Publicaciones oficiales de{" "}
                <Link href="https://www.unimayor.edu.co" target="_blank" rel="noopener" className="font-bold text-[#195a90] underline-offset-4 hover:underline">
                  unimayor.edu.co
                </Link>{" "}
                leídas directamente del feed RSS.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rssEvents.map((e) => (
                  <EventoRssCard key={e.id_rss} evento={e} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-8 text-xs text-zinc-500">
        Los eventos oficiales se sincronizan desde el portal institucional.{" "}
        <Link href="https://www.unimayor.edu.co" target="_blank" rel="noopener" className="font-bold text-[#195a90] underline-offset-4 hover:underline">
          unimayor.edu.co
        </Link>
      </p>
    </div>
  );
}
