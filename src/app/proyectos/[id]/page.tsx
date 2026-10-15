import { notFound } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { badge } from "@/lib/design-tokens";

/**
 * Detalle /proyectos/[id] — Vista (capa de Presentación).
 * 404 si no existe o no está PUBLICADO. Muestra puesto ("Dónde verlo") si tiene.
 */
interface PuestoData {
  codigo: string;
  edificio: string;
  piso: number;
  salon: string;
  ubicacion: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const p = await apiGet<ProyectoCardData>(`/api/proyectos/${id}`);
    return { title: `${p.titulo} — Agenda Mayor`, description: p.descripcion.slice(0, 160) };
  } catch {
    return { title: "Proyecto no encontrado — Agenda Mayor" };
  }
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let proyecto: ProyectoCardData;
  try {
    proyecto = await apiGet<ProyectoCardData>(`/api/proyectos/${id}`);
  } catch {
    notFound();
  }

  if (proyecto.estado !== "PUBLICADO") {
    // El proyecto existe pero aún no es público (EN_REVISION / RECHAZADO).
    // Mostrar aviso útil en vez de un 404 críptico, sin exponer el contenido
    // sin moderar.
    return (
      <article className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/proyectos" className="text-sm font-bold text-[#195a90] underline-offset-4 hover:underline">
          ← Volver a la vitrina
        </Link>
        <div className="mt-4 rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-8 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">
            Proyecto #{proyecto.id_proyecto} · {proyecto.estado}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#004884]">
            Este proyecto aún no está publicado
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            Quedó en revisión al publicarse y será visible aquí cuando un
            docente de su facultad lo avale. Si eres el autor, verás el
            resultado en la campana de notificaciones.
          </p>
        </div>
      </article>
    );
  }

  const puesto = await apiGet<PuestoData | null>(
    `/api/puestos?proyectoId=${proyecto.id_proyecto}`
  ).catch(() => null);

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/proyectos" className="text-sm font-bold text-[#195a90] underline-offset-4 hover:underline">
        ← Volver a la vitrina
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`${badge.base} ${badge.facultad}`}>{proyecto.facultad}</span>
        <span className={`${badge.base} ${badge.tipoComunidad}`}>{proyecto.tipo}</span>
        {proyecto.destacado && (
          <span className={`${badge.base} ${badge.tipoOficial}`}>Destacado</span>
        )}
      </div>

      <h1 className="mt-3 text-4xl font-extrabold text-[#004884]">{proyecto.titulo}</h1>
      <p className="mt-2 text-sm font-semibold text-[#195a90]">
        {proyecto.autor ? `${proyecto.autor.nombre} ${proyecto.autor.apellido} · @${proyecto.autor.username}` : "Autor UNIMAYOR"} · {proyecto.programa}
      </p>

      {proyecto.fotos?.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {proyecto.fotos.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={f} alt={proyecto.titulo} loading="lazy" className="w-full rounded-[10px] border-2 border-[#E4E4E7] object-cover" />
          ))}
        </div>
      )}

      <p className="mt-6 text-[1.0625rem] leading-[1.7] whitespace-pre-line">{proyecto.descripcion}</p>

      {puesto && (
        <section className="mt-8 rounded-[10px] border-2 border-[#004884] bg-[#f8fbfd] p-6" aria-label="Dónde verlo">
          <h2 className="text-lg font-bold text-[#004884]">Dónde verlo</h2>
          <p className="mt-2 text-sm">
            <strong>{puesto.codigo}</strong> · Edificio {puesto.edificio}, piso {puesto.piso}
            {puesto.salon ? `, ${puesto.salon}` : ""} — {puesto.ubicacion}
          </p>
        </section>
      )}
    </article>
  );
}
