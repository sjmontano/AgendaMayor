import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { PerfilCard, type PerfilCardData } from "@/components/perfil/perfil-card";
import { ProyectoCard, type ProyectoCardData } from "@/components/vitrina/proyecto-card";

/**
 * Perfil público /perfil/[username] — Vista (capa de Presentación).
 * Sin sesión. Solo proyectos PUBLICADOS. Nunca expone el correo.
 */
export default async function PerfilPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let perfil: PerfilCardData;
  try {
    perfil = await apiGet<PerfilCardData>(`/api/perfiles/${username}`);
  } catch {
    notFound();
  }

  const { data: proyectos } = await apiGet<{ data: ProyectoCardData[]; total: number }>(
    `/api/proyectos?autor=${username}&limit=24`
  ).catch(() => ({ data: [], total: 0 }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <PerfilCard perfil={perfil} />
      <h2 className="mt-10 text-xl font-bold text-[#333030]">
        Proyectos ({proyectos.length})
      </h2>
      {proyectos.length === 0 ? (
        <p className="mt-4 rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-8 text-center text-sm">
          Aún no has publicado proyectos.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <ProyectoCard key={p.id_proyecto} proyecto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
