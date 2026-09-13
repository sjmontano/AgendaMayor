import Link from "next/link";
import Image from "next/image";
import { apiGet } from "@/lib/api";
import { ProyectoCard, type ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { EventoCard, type EventoCardData } from "@/components/eventos/evento-card";
import { FACULTADES } from "@/lib/facultades";

/**
 * Home — Vista (capa de Presentación).
 * Landing: hero rico + stats + cómo funciona + facultades + destacados + eventos + avisos + CTA.
 * Consume la API propia (/api/*), nunca el Modelo directo.
 */
interface AvisoData {
  id_aviso: number;
  titulo: string;
  texto: string;
  fecha: string;
}

const PASOS = [
  {
    n: "01",
    titulo: "Publica tu proyecto",
    texto: "Con tu correo @unimayor.edu.co sube título, descripción, fotos y datos académicos. Queda en revisión.",
  },
  {
    n: "02",
    titulo: "Recibe el aval docente",
    texto: "Un docente de tu facultad revisa y avala tu trabajo. Te avisamos en la campana con el resultado.",
  },
  {
    n: "03",
    titulo: "Brilla en la vitrina",
    texto: "Tu proyecto se publica, aparece en tu perfil y puede tener mesa asignada en el EAFI de tu facultad.",
  },
];

export default async function Home() {
  const [proyectos, eventos, avisos] = await Promise.all([
    apiGet<{ data: ProyectoCardData[]; total: number }>("/api/proyectos?limit=3").catch(() => ({ data: [], total: 0 })),
    apiGet<{ data: EventoCardData[]; total: number }>("/api/eventos?limit=3").catch(() => ({ data: [], total: 0 })),
    apiGet<AvisoData[]>("/api/avisos").catch(() => []),
  ]);

  const stats = [
    { valor: `${proyectos.total}`, etiqueta: "Proyectos publicados" },
    { valor: `${eventos.total}`, etiqueta: "Eventos activos" },
    { valor: `${FACULTADES.length}`, etiqueta: "Facultades" },
    { valor: "100%", etiqueta: "Informativo y gratuito" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#004884] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.35) 0, transparent 35%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.15) 0, transparent 30%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pt-12 pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:pb-20">
          <div>
            <p className="reveal inline-block rounded-full border border-white/40 px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase">
              Plataforma de divulgación UNIMAYOR
            </p>
            <h1 className="reveal-1 mt-4 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              Los proyectos de la U, en un solo lugar
            </h1>
            <p className="reveal-2 mt-4 max-w-2xl text-lg text-white/85">
              Vitrina permanente de trabajos de aula, semilleros y opciones de grado; cartelera de
              eventos académicos; y perfiles públicos para que te conozcan por lo que haces.
              Sin pagos, sin inscripciones: todo informativo y gratuito.
            </p>
            <div className="reveal-3 mt-8 flex flex-wrap gap-4">
              <Link
                href="/proyectos"
                className="border-2 border-white bg-white px-8 py-4 text-sm font-bold tracking-widest text-[#004884] uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Ver vitrina
              </Link>
              <Link
                href="/proyectos/nuevo"
                className="border-2 border-white/40 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all hover:bg-white hover:text-[#004884]"
              >
                Publicar proyecto
              </Link>
            </div>
          </div>
          <div className="reveal-2 relative hidden lg:block" aria-hidden="true">
            <div className="rounded-[16px] border-2 border-white/30 bg-white/10 p-8 backdrop-blur-sm">
              <Image
                src="/brand/logoPrincipal.jpg"
                alt=""
                width={232}
                height={289}
                className="mx-auto w-40 rounded-[10px]"
              />
              <p className="mt-4 text-center text-sm font-bold tracking-[0.2em] text-white/80 uppercase">
                Sello UNIMAYOR
              </p>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-[10px] border-2 border-[#333030] bg-white px-5 py-3 text-[#333030] shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
              <p className="text-2xl font-extrabold text-[#004884]">{proyectos.total}+</p>
              <p className="text-xs font-bold tracking-widest uppercase">proyectos</p>
            </div>
            <div className="absolute -top-5 -right-3 rounded-[10px] border-2 border-[#333030] bg-white px-5 py-3 text-[#333030] shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
              <p className="text-2xl font-extrabold text-[#004884]">{eventos.total}</p>
              <p className="text-xs font-bold tracking-widest uppercase">eventos</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b-2 border-[#E4E4E7] bg-white" aria-label="Cifras">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.etiqueta} className={`reveal-${i + 1} text-center lg:text-left`}>
              <dt className="order-2 mt-1 block text-xs font-bold tracking-widest text-[#195a90] uppercase">
                {s.etiqueta}
              </dt>
              <dd className="order-1 text-4xl font-extrabold text-[#004884]">{s.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Cómo funciona">
        <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">El proceso</p>
        <h2 className="mt-1 max-w-xl text-3xl font-bold text-[#004884]">
          Del aula a la vitrina en 3 pasos
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li
              key={p.n}
              className={`reveal-${i + 1} rounded-[10px] border-2 border-[#E4E4E7] bg-white p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#004884]`}
            >
              <p className="text-4xl font-extrabold text-[#195a90]">{p.n}</p>
              <h3 className="mt-2 text-lg font-bold">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FACULTADES */}
      <section className="bg-[#f8fbfd]" aria-label="Facultades">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Explora por facultad</p>
          <h2 className="mt-1 text-3xl font-bold text-[#004884]">Cada facultad, su vitrina</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACULTADES.map((f, i) => (
              <Link
                key={f.slug}
                href={`/proyectos?facultad=${encodeURIComponent(f.nombre)}`}
                className={`reveal-${i + 1} group rounded-[10px] border-2 border-[#004884] bg-white p-6 transition-all duration-200 hover:bg-[#004884] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#333030]`}
              >
                <p className="text-lg font-bold text-[#004884] group-hover:text-white">{f.nombre}</p>
                <p className="mt-2 text-sm font-bold text-[#195a90] group-hover:text-white/80">
                  Ver proyectos →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Destacados</p>
            <h2 className="mt-1 text-3xl font-bold text-[#004884]">Proyectos recientes</h2>
          </div>
          <Link href="/proyectos" className="text-sm font-bold text-[#195a90] underline-offset-4 hover:underline">
            Ver todos →
          </Link>
        </div>
        {proyectos.data.length === 0 ? (
          <p className="rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-8 text-center text-sm">
            Aún no hay proyectos publicados. Sé el primero en publicar el tuyo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proyectos.data.map((p) => (
              <ProyectoCard key={p.id_proyecto} proyecto={p} />
            ))}
          </div>
        )}
      </section>

      {/* EVENTOS */}
      <section className="bg-[#f8fbfd]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Cartelera</p>
              <h2 className="mt-1 text-3xl font-bold text-[#004884]">Próximos eventos</h2>
            </div>
            <Link href="/eventos" className="text-sm font-bold text-[#195a90] underline-offset-4 hover:underline">
              Ver todos →
            </Link>
          </div>
          {eventos.data.length === 0 ? (
            <p className="rounded-[10px] border-2 border-[#E4E4E7] bg-white p-8 text-center text-sm">
              No hay eventos activos por ahora.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.data.map((e) => (
                <EventoCard key={e.id_evento} evento={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AVISOS */}
      {avisos.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Avisos">
          <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Convocatorias</p>
          <h2 className="mt-1 text-3xl font-bold text-[#004884]">Avisos</h2>
          <ul className="mt-6 space-y-4">
            {avisos.map((a) => (
              <li key={a.id_aviso} className="rounded-[10px] border-2 border-[#E4E4E7] bg-white p-5">
                <h3 className="font-bold">{a.titulo}</h3>
                <p className="mt-1 text-sm text-zinc-600">{a.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 pb-16" aria-label="Llamado a publicar">
        <div className="rounded-[16px] bg-[#004884] px-8 py-12 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold">
            ¿Tienes un proyecto? Que toda la U lo conozca
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Regístrate con tu correo institucional, publica y consigue el aval de tu facultad.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/registro"
              className="border-2 border-white bg-white px-8 py-4 text-sm font-bold tracking-widest text-[#004884] uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/proyectos/nuevo"
              className="border-2 border-white/40 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all hover:bg-white hover:text-[#004884]"
            >
              Publicar proyecto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
