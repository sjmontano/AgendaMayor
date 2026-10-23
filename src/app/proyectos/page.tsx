import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { ProyectoQuerySchema } from "@/modelo/proyectos/proyecto.dto";
import { ProyectoCard } from "@/components/vitrina/proyecto-card";
import { Filtros } from "@/components/vitrina/filtros";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { Reveal } from "@/components/ui/reveal";
import { Vacio } from "@/components/ui/vacio";
import { BtnMayor } from "@/components/ui/botones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Vitrina de proyectos" };
export const dynamic = "force-dynamic";

const POR_PAGINA = 12;

/**
 * Vitrina /proyectos — HU-04. Filtros en el query string (URL compartible).
 * Server Component: lee el Modelo directo (sin self-fetch HTTP, que falla en Vercel).
 */
export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ facultad?: string; tipo?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const tipoValido = ["INSTITUCIONAL", "EAFI", "COMUNIDAD"].includes(sp.tipo ?? "") ? sp.tipo : undefined;
  const filtros = ProyectoQuerySchema.parse({
    facultad: sp.facultad || undefined,
    tipo: tipoValido,
    q: sp.q || undefined,
    page: sp.page ?? "1",
    limit: String(POR_PAGINA),
  });

  const resultado = await listarPublicados(filtros).catch(() => ({ data: [], total: 0 }));
  const data = resultado.data.map((p) => ({ ...p, autor: p.autor ?? null }));
  const total = resultado.total;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const page = Math.min(filtros.page, paginas);

  const enlacePagina = (p: number) => {
    const q = new URLSearchParams();
    if (sp.facultad) q.set("facultad", sp.facultad);
    if (tipoValido) q.set("tipo", tipoValido);
    if (sp.q) q.set("q", sp.q);
    q.set("page", String(p));
    return `/proyectos?${q.toString()}`;
  };
  const hayFiltros = Boolean(sp.facultad || tipoValido || sp.q);

  return (
    <>
      <section className="border-b border-line bg-unimayor-tint">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
          <EncabezadoSeccion
            como="h1"
            eyebrow="Vitrina"
            titulo={sp.facultad ? `Proyectos de ${sp.facultad}` : "Proyectos de la comunidad"}
            descripcion="Trabajos de aula, semilleros y opciones de grado con aval docente."
          />
          <div className="mt-8">
            <Suspense>
              <Filtros total={total} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-label="Resultados" aria-live="polite">
        {data.length === 0 ? (
          <Vacio
            titulo={hayFiltros ? "No encontramos proyectos con estos filtros" : "Aún no hay proyectos publicados"}
            texto={hayFiltros ? "Prueba con otra palabra o quita algún filtro." : "Publica el primero y aparecerá aquí cuando tu facultad lo avale."}
            accion={
              hayFiltros ? (
                <BtnMayor href="/proyectos" variante="secondary">
                  Limpiar filtros
                </BtnMayor>
              ) : (
                <BtnMayor href="/proyectos/nuevo">Publicar proyecto</BtnMayor>
              )
            }
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p, i) => (
                <Reveal como="li" key={p.id_proyecto} orden={i % 6}>
                  <ProyectoCard proyecto={p} />
                </Reveal>
              ))}
            </ul>

            {paginas > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Paginación">
                {page > 1 && (
                  <Link href={enlacePagina(page - 1)} className="flex h-10 items-center rounded-box px-3 text-sm font-bold text-unimayor-900 hover:bg-unimayor-100" aria-label="Página anterior">
                    ← Anterior
                  </Link>
                )}
                {Array.from({ length: paginas }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === paginas || Math.abs(n - page) <= 1)
                  .map((n, i, arr) => (
                    <span key={n} className="flex items-center gap-1.5">
                      {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
                      <Link
                        href={enlacePagina(n)}
                        aria-current={n === page ? "page" : undefined}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-box text-sm font-bold tabular-nums transition-colors",
                          n === page ? "bg-unimayor-900 text-white shadow-soft" : "text-ink hover:bg-unimayor-100"
                        )}
                      >
                        {n}
                      </Link>
                    </span>
                  ))}
                {page < paginas && (
                  <Link href={enlacePagina(page + 1)} className="flex h-10 items-center rounded-box px-3 text-sm font-bold text-unimayor-900 hover:bg-unimayor-100" aria-label="Página siguiente">
                    Siguiente →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
