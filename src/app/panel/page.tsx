import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listarMios } from "@/modelo/proyectos/proyecto.service";
import { listarParaPanel } from "@/modelo/eventos/evento.service";
import { listarMisEntradas } from "@/modelo/taquilla/taquilla.service";
import { listarPorEstado } from "@/modelo/proyectos/proyecto.repository";
import { resumenEstudiante, resumenModeracion } from "@/modelo/estadisticas/estadistica.service";
import { usuarioActual } from "@/lib/sesion-vista";
import { Tile } from "@/components/ui/tile";
import { BtnMayor } from "@/components/ui/botones";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { Actividad } from "@/components/graficos/actividad";
import { BarrasFacultad } from "@/components/graficos/barras-facultad";
import { Medidor } from "@/components/graficos/medidor";
import { MisProyectos } from "@/components/panel/mis-proyectos";
import { ColaRevision } from "@/components/panel/cola-revision";
import { GestionPuestos, ImportarRss } from "@/components/panel/herramientas-admin";
import { AccesosEventos } from "@/components/panel/accesos-eventos";
import { PlusIcon } from "@/components/icons/plus";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { etiquetaEstado } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi panel" };
export const dynamic = "force-dynamic";

/**
 * Panel de control /panel — bento por rol (patrón Web3Bento adaptado).
 * ESTUDIANTE: saludo + estado de sus proyectos + notificaciones + mis proyectos.
 * DOCENTE/ADMIN: cola de revisión + tasa de aprobación + actividad + (admin) RSS y puestos.
 * Server Component: lee el Modelo directo; las acciones van por /api/*.
 */
function saludo() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Bogota" }));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

const COLOR_ESTADO: Record<string, string> = {
  EN_REVISION: "bg-warning",
  PUBLICADO: "bg-success",
  RECHAZADO: "bg-error",
  BORRADOR: "bg-muted",
};

function BarraEstados({ porEstado }: { porEstado: Record<string, number> }) {
  const estados = ["PUBLICADO", "EN_REVISION", "RECHAZADO"];
  const total = estados.reduce((s, e) => s + (porEstado[e] ?? 0), 0);
  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
        {total > 0 &&
          estados.map((e) =>
            porEstado[e] ? (
              <span key={e} className={cn("h-full first:rounded-l-full last:rounded-r-full", COLOR_ESTADO[e])} style={{ flexBasis: `${(porEstado[e] / total) * 100}%` }} />
            ) : null
          )}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {estados.map((e) => (
          <div key={e}>
            <dt className="flex items-center gap-1.5 text-[11px] text-white/75">
              <span className={cn("size-2 rounded-full", COLOR_ESTADO[e])} aria-hidden="true" />
              {etiquetaEstado[e]}
            </dt>
            <dd className="text-xl font-black tabular-nums">{porEstado[e] ?? 0}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function PanelPage({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/panel");
  const { bienvenida } = await searchParams;
  const esModerador = usuario.nombre_rol === "DOCENTE" || usuario.nombre_rol === "ADMIN";

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        {bienvenida && (
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-tile bg-gold-soft px-5 py-4 ring-1 ring-gold/40">
              <p className="text-sm text-gold-ink">
                <strong>¡Cuenta creada!</strong> Ya puedes publicar tu primer proyecto en la vitrina.
              </p>
              <BtnMayor href="/proyectos/nuevo" variante="gold" tamano="sm" icono={PlusIcon} iconoPos="inicio">
                Publicar ahora
              </BtnMayor>
            </div>
          </Reveal>
        )}
        {esModerador ? <PanelModeracion usuario={usuario} /> : <PanelEstudiante usuario={usuario} />}
      </div>
    </div>
  );
}

type Usuario = NonNullable<Awaited<ReturnType<typeof usuarioActual>>>;

async function PanelEstudiante({ usuario }: { usuario: Usuario }) {
  const [proyectos, resumen, eventos, ordenes] = await Promise.all([
    listarMios(usuario.id_usuario).catch(() => []),
    resumenEstudiante(usuario.id_usuario).catch(() => ({ porEstado: {} as Record<string, number>, sinLeer: 0 })),
    listarParaPanel(usuario).catch(() => []),
    listarMisEntradas(usuario).catch(() => []),
  ]);
  const datos = proyectos.map((p) => ({ ...p, autor: p.autor ?? null }));
  const total = proyectos.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2">
          <Tile tono="azul" className="h-full">
            <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <p className="text-sm text-white/75">{saludo()},</p>
              <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-black tracking-[-0.02em]">
                <span className="text-gold">{usuario.nombre}</span> {usuario.apellido}
              </h1>
              <p className="mt-1 text-sm text-white/75">
                {usuario.facultad ?? "Comunidad UNIMAYOR"} · @{usuario.username}
              </p>
              <div className="mt-6">
                <BarraEstados porEstado={resumen.porEstado} />
              </div>
            </div>
          </Tile>
        </Reveal>

        <Reveal orden={1}>
          <Tile titulo="Proyectos" className="h-full">
            <p className="text-[52px] leading-none font-black tracking-[-0.04em] text-unimayor-900">
              <CountUp valor={total} />
            </p>
            <p className="mt-1 text-sm text-muted">{total === 1 ? "proyecto creado" : "proyectos creados"}</p>
            <div className="mt-auto pt-5">
              <BtnMayor href={`/perfil/${usuario.username}`} variante="secondary" tamano="sm" icono={ArrowRightIcon} anchoCompleto>
                Ver mi perfil público
              </BtnMayor>
            </div>
          </Tile>
        </Reveal>

        <Reveal orden={2}>
          <Tile tono="oro" className="h-full">
            <p className="text-[13px] font-bold text-unimayor-950/75">Nuevo proyecto</p>
            <p className="mt-2 text-xl leading-snug font-black">¿Algo nuevo que mostrar?</p>
            <p className="mt-1 text-sm text-unimayor-950/80">Asistente en 4 pasos con vista previa.</p>
            <div className="mt-auto pt-5">
              <BtnMayor href="/proyectos/nuevo" icono={PlusIcon} iconoPos="inicio" anchoCompleto>
                Publicar proyecto
              </BtnMayor>
            </div>
          </Tile>
        </Reveal>
      </div>

      <AccesosEventos eventos={eventos} ordenes={ordenes} />

      {resumen.sinLeer > 0 && (
        <Reveal orden={3}>
          <Link
            href="/notificaciones"
            className="mt-4 flex items-center justify-between gap-4 rounded-tile border border-line bg-white px-5 py-4 transition-shadow hover:shadow-soft"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex size-3 rounded-full bg-gold" />
              </span>
              Tienes <strong>{resumen.sinLeer}</strong> {resumen.sinLeer === 1 ? "notificación sin leer" : "notificaciones sin leer"}
            </span>
            <span className="text-sm font-bold text-unimayor-700">Revisar →</span>
          </Link>
        </Reveal>
      )}

      <section className="mt-10" aria-labelledby="mis-proyectos">
        <div id="mis-proyectos">
          <EncabezadoSeccion eyebrow="Seguimiento" titulo="Mis proyectos" />
        </div>
        <div className="mt-6">
          <MisProyectos proyectos={datos} />
        </div>
      </section>
    </>
  );
}

async function PanelModeracion({ usuario }: { usuario: Usuario }) {
  const facultad = usuario.nombre_rol === "DOCENTE" ? usuario.facultad : null;
  const esAdmin = usuario.nombre_rol === "ADMIN";
  const [pendientes, resumen, eventos, ordenes] = await Promise.all([
    listarPorEstado("EN_REVISION", facultad).catch(() => []),
    resumenModeracion(facultad).catch(() => null),
    listarParaPanel(usuario).catch(() => []),
    listarMisEntradas(usuario).catch(() => []),
  ]);
  const datos = pendientes.map((p) => ({ ...p, autor: p.autor ?? null }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2">
          <Tile tono="azul" className="h-full">
            <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative flex h-full flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm text-white/75">{saludo()},</p>
                <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-black tracking-[-0.02em]">
                  {esAdmin ? "Administración" : <span className="text-gold">Prof. {usuario.nombre}</span>}
                </h1>
                <p className="mt-1 text-sm text-white/75">{facultad ? `Facultad de ${facultad}` : "Todas las facultades"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/75">Por revisar</p>
                <p className="text-[56px] leading-none font-black tracking-[-0.04em] text-gold">
                  <CountUp valor={pendientes.length} />
                </p>
              </div>
              {resumen && (
                <div className="w-full">
                  <BarraEstados porEstado={resumen.porEstado} />
                </div>
              )}
            </div>
          </Tile>
        </Reveal>
        <Reveal orden={1}>
          <Tile titulo="Tasa de aprobación" className="h-full items-center justify-center">
            <Medidor valor={resumen?.tasaAprobacion ?? 0} etiqueta="publicados sobre decididos" />
          </Tile>
        </Reveal>
        <Reveal orden={2}>
          <Tile titulo="Publicados" className="h-full">
            <p className="text-[52px] leading-none font-black tracking-[-0.04em] text-unimayor-900">
              <CountUp valor={resumen?.porEstado.PUBLICADO ?? 0} />
            </p>
            <p className="mt-1 text-sm text-muted">{facultad ? "en tu facultad" : "en la institución"}</p>
            <div className="mt-auto pt-5">
              <BtnMayor href={facultad ? `/proyectos?facultad=${encodeURIComponent(facultad)}` : "/proyectos"} variante="secondary" tamano="sm" icono={ArrowRightIcon} anchoCompleto>
                Ver en la vitrina
              </BtnMayor>
            </div>
          </Tile>
        </Reveal>
      </div>

      <AccesosEventos eventos={eventos} ordenes={ordenes} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="cola" className="min-w-0">
          <div className="rounded-tile border border-line bg-white p-5 sm:p-6">
            <div id="cola" className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-unimayor-900">Cola de revisión</h2>
              <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-bold text-warning tabular-nums">
                {pendientes.length} pendientes
              </span>
            </div>
            <ColaRevision pendientes={datos} />
          </div>
        </section>
        <div className="flex flex-col gap-4">
          {resumen && (
            <Tile titulo="Registros · últimos 30 días">
              <Actividad datos={resumen.actividad} etiqueta="Proyectos registrados por día" />
            </Tile>
          )}
          {esAdmin && resumen && (
            <Tile titulo="Publicados por facultad">
              <BarrasFacultad datos={resumen.porFacultad} />
            </Tile>
          )}
          {esAdmin && (
            <Tile tono="azul" titulo="Integración UNIMAYOR">
              <ImportarRss />
            </Tile>
          )}
        </div>
      </div>

      {esAdmin && (
        <section className="mt-10" aria-labelledby="puestos">
          <div id="puestos">
            <EncabezadoSeccion eyebrow="Ferias EAFI" titulo="Puestos y mesas" />
          </div>
          <div className="mt-6 rounded-tile border border-line bg-white p-5 sm:p-6">
            <GestionPuestos />
          </div>
        </section>
      )}
    </>
  );
}
