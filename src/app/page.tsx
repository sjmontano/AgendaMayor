import Link from "next/link";
import { listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { listarActivos as listarEventos } from "@/modelo/eventos/evento.repository";
import { aResumenPublico } from "@/modelo/eventos/evento.service";
import { listarActivos as listarAvisos } from "@/modelo/avisos/aviso.repository";
import { resumenPublico } from "@/modelo/estadisticas/estadistica.service";
import { ProyectoCard } from "@/components/vitrina/proyecto-card";
import { EventoCard } from "@/components/eventos/evento-card";
import { PilaDestacados } from "@/components/inicio/pila-destacados";
import { Accesos } from "@/components/inicio/accesos";
import { Proceso } from "@/components/inicio/proceso";
import { Actividad } from "@/components/graficos/actividad";
import { BarrasFacultad } from "@/components/graficos/barras-facultad";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { BtnMayor } from "@/components/ui/botones";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { Tile } from "@/components/ui/tile";
import { Vacio } from "@/components/ui/vacio";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PlusIcon } from "@/components/icons/plus";
import { FACULTADES } from "@/lib/facultades";
import { fechaLarga } from "@/lib/utils";

/**
 * Home — Vista (capa de Presentación).
 * Hero con buscador y pila de destacados → accesos por perfil → cifras (bento)
 * → proceso (máquina de estados) → facultades → destacados → eventos → avisos → CTA.
 * Server Component: lee el Modelo directo (sin self-fetch HTTP, que falla en Vercel).
 */
export const dynamic = "force-dynamic";

const VACIO_RESUMEN = {
  totales: { publicados: 0, eventos: 0, estudiantes: 0, docentes: 0 },
  porFacultad: [] as { etiqueta: string; total: number }[],
  actividad: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { fecha: d.toISOString().slice(0, 10), total: 0 };
  }),
};

export default async function Home() {
  const [proyectosRaw, eventos, avisos, resumen] = await Promise.all([
    listarPublicados({ page: 1, limit: 6 }).catch(() => ({ data: [], total: 0 })),
    listarEventos({ page: 1, limit: 3 })
      .then((r) => ({ ...r, data: r.data.map(aResumenPublico) }))
      .catch(() => ({ data: [], total: 0 })),
    listarAvisos().catch(() => []),
    resumenPublico().catch(() => VACIO_RESUMEN),
  ]);

  const proyectos = proyectosRaw.data.map((p) => ({ ...p, autor: p.autor ?? null }));
  const pila = [...proyectos]
    .sort((a, b) => Number(b.destacado) - Number(a.destacado))
    .slice(0, 4)
    .reverse()
    .map((p) => ({
      id_proyecto: p.id_proyecto,
      titulo: p.titulo,
      facultad: p.facultad,
      programa: p.programa,
      fotos: p.fotos,
      autor: p.autor ? `${p.autor.nombre} ${p.autor.apellido}` : "Comunidad UNIMAYOR",
    }));

  const conteoFacultad = new Map(resumen.porFacultad.map((f) => [f.etiqueta, f.total]));
  const barras = FACULTADES.map((f) => ({ etiqueta: f.nombre, total: conteoFacultad.get(f.nombre) ?? 0 })).sort(
    (a, b) => b.total - a.total
  );
  const proximo = eventos.data[0];

  const cifras = [
    { valor: resumen.totales.publicados, etiqueta: "Proyectos publicados" },
    { valor: resumen.totales.eventos, etiqueta: "Eventos activos" },
    { valor: FACULTADES.length, etiqueta: "Facultades" },
    { valor: resumen.totales.estudiantes, etiqueta: "Estudiantes" },
  ];

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="on-dark relative overflow-hidden bg-unimayor-900 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] size-[640px] rounded-full bg-unimayor-nav/45 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-30%] left-[-10%] size-[520px] rounded-full bg-unimayor-950/70 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-28 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20 lg:pb-36">
          <div>
            <p className="reveal inline-flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-4 pl-2 text-xs font-bold tracking-[0.14em] uppercase ring-1 ring-white/20 backdrop-blur">
              <span className="flex size-5 items-center justify-center rounded-full bg-gold/20">
                <span className="size-2 animate-pulse rounded-full bg-gold" />
              </span>
              Vitrina académica UNIMAYOR
            </p>
            <h1 className="reveal-1 reveal mt-6 text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[1.02] font-black tracking-[-0.035em] text-balance">
              Lo que se crea en la U,{" "}
              <span className="relative inline-block text-gold">
                a la vista
                <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9C50 3 150 3 198 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>{" "}
              de todos.
            </h1>
            <p className="reveal-2 reveal mt-6 max-w-xl text-lg leading-relaxed text-pretty text-white/85">
              Trabajos de aula, semilleros y opciones de grado de las cuatro facultades, con aval docente. Más la
              cartelera de eventos académicos. Gratis e informativo.
            </p>

            <form action="/proyectos" role="search" className="reveal-3 reveal mt-8 flex max-w-xl items-center gap-2 rounded-tile bg-white p-2 shadow-pop">
              <label htmlFor="buscar-hero" className="sr-only">
                Buscar proyectos
              </label>
              <svg viewBox="0 0 24 24" className="ml-2 size-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="buscar-hero"
                name="q"
                type="search"
                placeholder="Busca por tema, programa o palabra clave…"
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
              />
              <BtnMayor type="submit" tamano="md" className="shrink-0">
                Buscar
              </BtnMayor>
            </form>

            <div className="reveal-4 reveal mt-6 flex flex-wrap items-center gap-3">
              <BtnMayor href="/proyectos" variante="gold" icono={ArrowRightIcon}>
                Explorar la vitrina
              </BtnMayor>
              <BtnMayor href="/proyectos/nuevo" variante="onDarkGhost" icono={PlusIcon} iconoPos="inicio">
                Publicar mi proyecto
              </BtnMayor>
            </div>
          </div>

          <div className="reveal-2 reveal">
            {pila.length > 0 ? (
              <PilaDestacados items={pila} />
            ) : (
              <div className="mx-auto max-w-sm rounded-tile bg-white/8 p-8 text-center ring-1 ring-white/20 backdrop-blur">
                <p className="text-sm font-bold tracking-[0.18em] text-gold uppercase">Pronto aquí</p>
                <p className="mt-2 text-xl font-extrabold">Los primeros proyectos destacados</p>
                <p className="mt-2 text-sm text-white/75">Publica el tuyo y sé de los primeros en la vitrina.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── ACCESOS (user-cards del portal) ───────────── */}
      <section aria-label="Accesos rápidos" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-6 lg:-mt-20">
        <Accesos />
      </section>

      {/* ───────────── CIFRAS (bento) ───────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 lg:pt-24" aria-labelledby="cifras-titulo">
        <h2 id="cifras-titulo" className="sr-only">
          La U en cifras
        </h2>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cifras.map((c, i) => (
            <Reveal key={c.etiqueta} orden={i} className="rounded-tile border border-line bg-white p-5">
              <dt className="text-[13px] font-bold text-muted">{c.etiqueta}</dt>
              <dd className="mt-1 text-[clamp(2rem,4vw,2.75rem)] leading-none font-black tracking-[-0.03em] text-unimayor-900">
                <CountUp valor={c.valor} />
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Reveal orden={1}>
            <Tile titulo="Proyectos registrados · últimos 30 días" className="h-full">
              <Actividad datos={resumen.actividad} etiqueta="Proyectos registrados por día en los últimos 30 días" />
            </Tile>
          </Reveal>
          <Reveal orden={2}>
            <Tile
              titulo="Publicados por facultad"
              className="h-full"
              accion={
                <Link href="/proyectos" className="text-xs font-bold text-unimayor-700 underline-offset-4 hover:underline">
                  Ver vitrina
                </Link>
              }
            >
              <BarrasFacultad datos={barras} />
            </Tile>
          </Reveal>
        </div>
      </section>

      {/* ───────────── PROCESO ───────────── */}
      <section className="bg-unimayor-tint" aria-labelledby="proceso-titulo">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div id="proceso-titulo">
            <EncabezadoSeccion
              eyebrow="El proceso"
              titulo="Del aula a la vitrina en tres pasos"
              descripcion="Cada proyecto pasa por el aval de un docente de su facultad antes de publicarse. Así la vitrina muestra trabajo revisado."
            />
          </div>
          <div className="mt-12">
            <Proceso />
          </div>
        </div>
      </section>

      {/* ───────────── FACULTADES ───────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24" aria-labelledby="facultades-titulo">
        <div id="facultades-titulo">
          <EncabezadoSeccion eyebrow="Explora por facultad" titulo="Cada facultad, su vitrina" />
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACULTADES.map((f, i) => (
            <Reveal como="li" key={f.slug} orden={i}>
              <Link
                href={`/proyectos?facultad=${encodeURIComponent(f.nombre)}`}
                className="group relative flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-box border-2 border-unimayor-900 bg-white p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  className="absolute inset-0 origin-bottom scale-y-0 bg-unimayor-900 transition-transform duration-500 ease-[var(--ease-emphasis)] group-hover:scale-y-100"
                  aria-hidden="true"
                />
                <span className="relative">
                  <span className="block text-xs font-bold tracking-[0.18em] text-unimayor-700 uppercase transition-colors group-hover:text-gold">
                    Facultad
                  </span>
                  <span className="mt-1 block text-lg leading-snug font-extrabold text-unimayor-900 transition-colors group-hover:text-white">
                    {f.nombre}
                  </span>
                </span>
                <span className="relative mt-6 flex items-end justify-between">
                  <span className="text-sm font-bold text-muted transition-colors group-hover:text-white/80">
                    <span className="text-2xl font-black text-ink tabular-nums transition-colors group-hover:text-white">
                      {conteoFacultad.get(f.nombre) ?? 0}
                    </span>{" "}
                    proyectos
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-unimayor-100 text-unimayor-900 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-unimayor-950" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ───────────── DESTACADOS ───────────── */}
      <section className="bg-unimayor-tint" aria-labelledby="recientes-titulo">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div id="recientes-titulo">
            <EncabezadoSeccion
              eyebrow="Recién publicados"
              titulo="Proyectos de la comunidad"
              accion={
                <BtnMayor href="/proyectos" variante="secondary" tamano="sm" icono={ArrowRightIcon}>
                  Ver todos
                </BtnMayor>
              }
            />
          </div>
          {proyectos.length === 0 ? (
            <Vacio
              className="mt-10"
              titulo="Aún no hay proyectos publicados"
              texto="Sé el primero: publica tu proyecto y, con el aval de tu facultad, aparecerá aquí."
              accion={
                <BtnMayor href="/proyectos/nuevo" icono={PlusIcon} iconoPos="inicio">
                  Publicar proyecto
                </BtnMayor>
              }
            />
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proyectos.map((p, i) => (
                <Reveal como="li" key={p.id_proyecto} orden={i}>
                  <ProyectoCard proyecto={p} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ───────────── EVENTOS ───────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24" aria-labelledby="eventos-titulo">
        <div id="eventos-titulo">
          <EncabezadoSeccion
            eyebrow="Cartelera"
            titulo="Próximos eventos"
            descripcion="Eventos oficiales, ferias EAFI y actividades de la comunidad."
            accion={
              <BtnMayor href="/eventos" variante="secondary" tamano="sm" icono={ArrowRightIcon}>
                Ver cartelera
              </BtnMayor>
            }
          />
        </div>
        {eventos.data.length === 0 ? (
          <Vacio className="mt-10" titulo="No hay eventos activos por ahora" texto="Vuelve pronto o revisa la cartelera del portal institucional." />
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {proximo && (
              <Reveal className="lg:col-span-1">
                <Tile tono="azul" className="h-full justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Próximo evento</p>
                    <p className="mt-3 text-2xl leading-tight font-extrabold">{proximo.titulo}</p>
                    <p className="mt-3 text-sm text-white/80">{fechaLarga(proximo.fecha_inicio)}</p>
                    <p className="text-sm text-white/80">{proximo.es_virtual ? "Virtual" : proximo.lugar}</p>
                  </div>
                  <div className="mt-8">
                    <BtnMayor href={`/eventos/${proximo.id_evento}`} variante="onDark" tamano="sm" icono={ArrowRightIcon}>
                      Ver detalles
                    </BtnMayor>
                  </div>
                </Tile>
              </Reveal>
            )}
            <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
              {eventos.data.slice(proximo ? 1 : 0, 3).map((e, i) => (
                <Reveal como="li" key={e.id_evento} orden={i + 1}>
                  <EventoCard evento={e} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ───────────── AVISOS ───────────── */}
      {avisos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="avisos-titulo">
          <div id="avisos-titulo">
            <EncabezadoSeccion eyebrow="Convocatorias" titulo="Avisos" />
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {avisos.map((a, i) => (
              <Reveal como="li" key={a.id_aviso} orden={i}>
                <article className="h-full rounded-tile border border-line border-l-4 border-l-gold bg-white p-5">
                  <time dateTime={a.fecha} className="text-xs font-bold text-muted">
                    {fechaLarga(a.fecha)}
                  </time>
                  <h3 className="mt-1 font-extrabold text-ink">{a.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.texto}</p>
                </article>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* ───────────── CTA FINAL ───────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="cta-titulo">
        <Reveal>
          <div className="on-dark relative overflow-hidden rounded-tile bg-unimayor-900 px-6 py-14 text-center text-white sm:px-12">
            <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-unimayor-nav/60 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <h2 id="cta-titulo" className="mx-auto max-w-2xl text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight font-black tracking-[-0.02em] text-balance">
                ¿Tienes un proyecto? Que toda la U lo conozca.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/85">
                Regístrate con tu correo institucional, publica en minutos y consigue el aval de tu facultad.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <BtnMayor href="/registro" variante="gold" tamano="lg" icono={ArrowRightIcon}>
                  Crear cuenta gratis
                </BtnMayor>
                <BtnMayor href="/proyectos/nuevo" variante="onDarkGhost" tamano="lg">
                  Publicar proyecto
                </BtnMayor>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
