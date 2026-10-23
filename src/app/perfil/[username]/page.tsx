import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerPerfilPublico } from "@/modelo/usuarios/usuario.service";
import { listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { usuarioActual } from "@/lib/sesion-vista";
import { Avatar } from "@/components/ui/avatar";
import { BadgeFacultad } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { Vacio } from "@/components/ui/vacio";
import { ProyectoCard } from "@/components/vitrina/proyecto-card";
import { PlusIcon } from "@/components/icons/plus";

/**
 * Perfil público /perfil/[username] — HU-14. Sin sesión. Solo proyectos
 * PUBLICADOS. Nunca expone el correo.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const p = await obtenerPerfilPublico(username).catch(() => null);
  return { title: p ? `${p.nombre} ${p.apellido} (@${p.username})` : "Perfil" };
}

export default async function PerfilPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const perfil = await obtenerPerfilPublico(username).catch(() => null);
  if (!perfil) notFound();

  const [{ data, total }, yo] = await Promise.all([
    listarPublicados({ autor: username, page: 1, limit: 24 }).catch(() => ({ data: [], total: 0 })),
    usuarioActual(),
  ]);
  const esMio = yo?.username === perfil.username;
  const proyectos = data.map((p) => ({ ...p, autor: p.autor ?? null }));
  const facultades = new Set(proyectos.map((p) => p.facultad)).size;

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-unimayor-900 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-32 -right-20 size-96 rounded-full bg-unimayor-nav/50 blur-[100px]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-12 pb-20 sm:flex-row sm:items-end sm:px-6">
          <div className="reveal">
            <Avatar nombre={perfil.nombre} apellido={perfil.apellido} src={perfil.avatar} tamano="xl" className="ring-4 ring-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="reveal reveal-1 text-sm font-bold text-gold">@{perfil.username}</p>
            <h1 className="reveal reveal-2 text-[clamp(2rem,4vw,3rem)] leading-tight font-black tracking-[-0.02em]">
              {perfil.nombre} {perfil.apellido}
            </h1>
            <p className="reveal reveal-3 mt-1 text-white/80">
              {[perfil.programa, perfil.semestre ? `Semestre ${perfil.semestre}` : null, perfil.semillero ? `Semillero ${perfil.semillero}` : null]
                .filter(Boolean)
                .join(" · ") || "Comunidad UNIMAYOR"}
            </p>
          </div>
          {esMio && (
            <div className="reveal reveal-3">
              <BtnMayor href="/proyectos/nuevo" variante="gold" icono={PlusIcon} iconoPos="inicio">
                Publicar proyecto
              </BtnMayor>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <Reveal className="rounded-tile border border-line bg-white p-5 shadow-soft">
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Sobre mí</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{perfil.bio || "Aún no ha escrito una presentación."}</p>
            {perfil.facultad && <BadgeFacultad facultad={perfil.facultad} className="mt-3" />}
          </Reveal>
          <Reveal orden={1} className="rounded-tile border border-line bg-white p-5 shadow-soft">
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Proyectos publicados</p>
            <p className="mt-1 text-5xl font-black tracking-[-0.03em] text-unimayor-900">
              <CountUp valor={total} />
            </p>
          </Reveal>
          <Reveal orden={2} className="rounded-tile border border-line bg-white p-5 shadow-soft">
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Facultades</p>
            <p className="mt-1 text-5xl font-black tracking-[-0.03em] text-unimayor-900">
              <CountUp valor={facultades} />
            </p>
          </Reveal>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="proyectos-perfil">
        <h2 id="proyectos-perfil" className="text-2xl font-black text-unimayor-900">
          Proyectos
        </h2>
        {proyectos.length === 0 ? (
          <Vacio
            className="mt-6"
            titulo={esMio ? "Aún no tienes proyectos publicados" : "Aún no hay proyectos publicados"}
            texto={esMio ? "Los proyectos aparecen aquí cuando tu facultad los avala." : undefined}
            accion={
              esMio ? (
                <BtnMayor href="/panel" variante="secondary">
                  Ver mi panel
                </BtnMayor>
              ) : undefined
            }
          />
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((p, i) => (
              <Reveal como="li" key={p.id_proyecto} orden={i % 6}>
                <ProyectoCard proyecto={p} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
