import { apiGet } from "@/lib/api";
import { ProyectoCard, type ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { Filtros } from "@/components/vitrina/filtros";

/**
 * Vitrina /proyectos — Vista (capa de Presentación).
 * Filtros vía query string (URL compartible, HU-07). Consume /api/*.
 */
export const dynamic = "force-dynamic";

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ facultad?: string; tipo?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = new URLSearchParams();
  if (sp.facultad) query.set("facultad", sp.facultad);
  if (sp.tipo) query.set("tipo", sp.tipo);
  if (sp.q) query.set("q", sp.q);
  query.set("page", sp.page ?? "1");

  const { data, total } = await apiGet<{ data: ProyectoCardData[]; total: number }>(
    `/api/proyectos?${query.toString()}`
  ).catch(() => ({ data: [], total: 0 }));

  const page = Number(sp.page ?? "1");
  const hayMas = total > page * 12;
  const pagQuery = (p: number) => {
    const q = new URLSearchParams(query.toString());
    q.set("page", String(p));
    return `/proyectos?${q.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Vitrina</p>
      <h1 className="mt-1 text-4xl font-extrabold text-[#004884]">
        Proyectos ({total})
      </h1>

      <div className="mt-6">
        <Filtros inicial={{ facultad: sp.facultad, tipo: sp.tipo, q: sp.q }} />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-8 text-center text-sm">
          No se encontraron proyectos con estos filtros.
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProyectoCard key={p.id_proyecto} proyecto={p} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            {page > 1 && (
              <a href={pagQuery(page - 1)} className="border-2 border-[#004884] px-4 py-2 text-xs font-bold tracking-widest text-[#004884] uppercase hover:bg-[#004884] hover:text-white">
                ← Anterior
              </a>
            )}
            <span className="text-sm font-semibold">Página {page}</span>
            {hayMas && (
              <a href={pagQuery(page + 1)} className="border-2 border-[#004884] px-4 py-2 text-xs font-bold tracking-widest text-[#004884] uppercase hover:bg-[#004884] hover:text-white">
                Siguiente →
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
