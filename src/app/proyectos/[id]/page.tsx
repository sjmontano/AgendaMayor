import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerPorId, listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { buscarPorProyecto } from "@/modelo/puestos/puesto.repository";
import { usuarioActual } from "@/lib/sesion-vista";
import { Avatar } from "@/components/ui/avatar";
import { BadgeEstado, BadgeFacultad, BadgeTipo } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { Reveal } from "@/components/ui/reveal";
import { Vacio } from "@/components/ui/vacio";
import { Compartir, Galeria } from "@/components/vitrina/galeria";
import { PortadaProyecto, ProyectoCard } from "@/components/vitrina/proyecto-card";
import { fechaLarga } from "@/lib/utils";

/**
 * Detalle /proyectos/[id] — HU-05. Público solo si está PUBLICADO; el autor y
 * los moderadores pueden ver la vista previa en otros estados (con aviso).
 * Muestra "Dónde verlo" si tiene puesto EAFI asignado y proyectos relacionados.
 */
export const dynamic = "force-dynamic";

async function cargar(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return obtenerPorId(n).catch(() => null);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await cargar(id);
  if (!p || p.estado !== "PUBLICADO") return { title: "Proyecto" };
  return { title: p.titulo, description: p.descripcion.slice(0, 160) };
}

export default async function ProyectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyecto = await cargar(id);
  if (!proyecto || proyecto.estado === "ELIMINADO") notFound();

  const usuario = await usuarioActual();
  const puedeVerPrevia =
    usuario && (usuario.id_usuario === proyecto.autor_id || usuario.nombre_rol === "ADMIN" || usuario.nombre_rol === "DOCENTE");

  if (proyecto.estado !== "PUBLICADO" && !puedeVerPrevia) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Vacio
          titulo="Este proyecto aún no está publicado"
          texto="Será visible aquí cuando un docente de su facultad lo avale. Si eres el autor, inicia sesión para ver su estado."
          accion={
            <BtnMayor href="/proyectos" variante="secondary">
              Volver a la vitrina
            </BtnMayor>
          }
        />
      </div>
    );
  }

  const [puesto, relacionados] = await Promise.all([
    buscarPorProyecto(proyecto.id_proyecto).catch(() => null),
    listarPublicados({ facultad: proyecto.facultad, page: 1, limit: 4 }).catch(() => ({ data: [], total: 0 })),
  ]);
  const otros = relacionados.data.filter((p) => p.id_proyecto !== proyecto.id_proyecto).slice(0, 3);
  const autor = proyecto.autor;

  return (
    <article>
      {proyecto.estado !== "PUBLICADO" && (
        <div className="border-b border-warning/30 bg-warning-soft">
          <p className="mx-auto max-w-6xl px-4 py-3 text-sm text-warning sm:px-6">
            <strong>Vista previa.</strong> Este proyecto está «{proyecto.estado === "EN_REVISION" ? "en revisión" : proyecto.estado.toLowerCase()}» y
            todavía no es visible para el público.
          </p>
        </div>
      )}

      <header className="on-dark relative overflow-hidden bg-unimayor-900 text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <PortadaProyecto proyecto={proyecto} className="!scale-110 blur-2xl" />
        </div>
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6">
          <nav aria-label="Ruta de navegación" className="reveal text-sm">
            <ol className="flex flex-wrap items-center gap-1.5 text-white/75">
              <li>
                <Link href="/proyectos" className="underline-offset-4 hover:text-gold hover:underline">
                  Vitrina
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/proyectos?facultad=${encodeURIComponent(proyecto.facultad)}`} className="underline-offset-4 hover:text-gold hover:underline">
                  {proyecto.facultad}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="reveal reveal-1 mt-6 flex flex-wrap gap-2">
            <BadgeTipo tipo={proyecto.tipo} />
            {proyecto.estado !== "PUBLICADO" && <BadgeEstado estado={proyecto.estado} className="bg-white" />}
            {proyecto.destacado && <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-extrabold text-unimayor-950 uppercase">★ Destacado</span>}
          </div>
          <h1 className="reveal reveal-2 mt-4 max-w-4xl text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] font-black tracking-[-0.03em] text-balance">
            {proyecto.titulo}
          </h1>
          <p className="reveal reveal-3 mt-4 text-white/80">
            {proyecto.programa} · {fechaLarga(proyecto.fecha_registro)}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {proyecto.fotos.length > 0 && (
            <Reveal className="mb-10">
              <Galeria fotos={proyecto.fotos} titulo={proyecto.titulo} />
            </Reveal>
          )}
          <Reveal>
            <h2 className="text-xs font-bold tracking-[0.2em] text-unimayor-700 uppercase">Sobre el proyecto</h2>
            <div className="mt-3 text-[1.0625rem] leading-[1.75] whitespace-pre-line text-ink">{proyecto.descripcion}</div>
          </Reveal>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Reveal orden={1}>
            <div className="rounded-tile border border-line bg-white p-5">
              <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Autor</p>
              {autor ? (
                <Link href={`/perfil/${autor.username}`} className="group mt-3 flex items-center gap-3 rounded-box">
                  <Avatar nombre={autor.nombre} apellido={autor.apellido} src={autor.avatar} tamano="lg" />
                  <span className="min-w-0">
                    <span className="block truncate font-extrabold text-ink group-hover:text-unimayor-900 group-hover:underline group-hover:underline-offset-4">
                      {autor.nombre} {autor.apellido}
                    </span>
                    <span className="block text-sm text-muted">@{autor.username}</span>
                  </span>
                </Link>
              ) : (
                <p className="mt-2 text-sm">Comunidad UNIMAYOR</p>
              )}
              <dl className="mt-5 space-y-3 border-t border-line-soft pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted">Facultad</dt>
                  <dd className="mt-1">
                    <BadgeFacultad facultad={proyecto.facultad} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Programa</dt>
                  <dd className="font-semibold text-ink">{proyecto.programa}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Registrado</dt>
                  <dd className="font-semibold text-ink">{fechaLarga(proyecto.fecha_registro)}</dd>
                </div>
              </dl>
              <div className="mt-5">
                <Compartir titulo={proyecto.titulo} />
              </div>
            </div>
          </Reveal>

          {puesto && (
            <Reveal orden={2}>
              <section className="on-dark rounded-tile bg-unimayor-900 p-5 text-white" aria-label="Dónde verlo">
                <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Dónde verlo · EAFI</p>
                <p className="mt-2 text-3xl font-black">{puesto.codigo}</p>
                <p className="mt-1 text-sm text-white/85">
                  {puesto.edificio}, piso {puesto.piso}
                  {puesto.salon ? ` · ${puesto.salon}` : ""}
                </p>
                <p className="text-sm text-white/70">{puesto.ubicacion}</p>
              </section>
            </Reveal>
          )}
        </aside>
      </div>

      {otros.length > 0 && (
        <section className="bg-unimayor-tint" aria-labelledby="relacionados">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="relacionados" className="text-2xl font-black text-unimayor-900">
              Más de {proyecto.facultad}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((p, i) => (
                <Reveal como="li" key={p.id_proyecto} orden={i}>
                  <ProyectoCard proyecto={{ ...p, autor: p.autor ?? null }} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
