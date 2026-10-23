import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Marco de autenticación: panel de marca (izquierda, ≥ lg) + formulario.
 * El panel comunica para qué sirve la cuenta; en móvil se reduce a una franja.
 */
const BENEFICIOS = [
  { titulo: "Publica en minutos", texto: "Un asistente guiado con vista previa en vivo." },
  { titulo: "Aval de tu facultad", texto: "Un docente revisa y te avisamos del resultado." },
  { titulo: "Tu perfil académico", texto: "Tus proyectos publicados, en una URL para compartir." },
];

export function MarcoAuth({
  eyebrow,
  titulo,
  descripcion,
  children,
}: {
  eyebrow: string;
  titulo: string;
  descripcion: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-0 px-4 py-8 sm:px-6 lg:min-h-[calc(100vh-7.25rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-12">
      <aside className="on-dark relative hidden overflow-hidden rounded-tile bg-unimayor-900 p-10 text-white lg:flex lg:flex-col">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-unimayor-nav/50 blur-[90px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-16 -left-10 size-56 rounded-full bg-unimayor-nav/40 blur-[70px]" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <Image src="/brand/logoPrincipal.jpg" alt="" width={44} height={55} className="h-14 w-auto rounded-md" />
          <div className="leading-tight">
            <p className="text-lg font-extrabold">Agenda Mayor</p>
            <p className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase">UNIMAYOR</p>
          </div>
        </div>

        <div className="relative mt-auto">
          <p className="text-[clamp(1.8rem,2.6vw,2.4rem)] leading-[1.1] font-black tracking-[-0.02em] text-balance">
            Tu trabajo académico merece ser visto.
          </p>
          <ul className="mt-8 space-y-4">
            {BENEFICIOS.map((b, i) => (
              <li key={b.titulo} className={`reveal reveal-${i + 2} flex gap-3`}>
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-unimayor-950" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </span>
                <span>
                  <span className="block font-bold">{b.titulo}</span>
                  <span className="block text-sm text-white/75">{b.texto}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-white/60">Exclusivo para la comunidad con correo @unimayor.edu.co</p>
        </div>
      </aside>

      <div className="flex flex-col justify-center py-4 lg:py-8">
        <div className="mx-auto w-full max-w-md">
          <p className="reveal text-xs font-bold tracking-[0.2em] text-unimayor-700 uppercase">{eyebrow}</p>
          <h1 className="reveal reveal-1 mt-2 text-[clamp(1.9rem,3.2vw,2.5rem)] leading-tight font-black tracking-[-0.02em] text-unimayor-900">
            {titulo}
          </h1>
          <p className="reveal reveal-2 mt-2 text-[15px] text-muted">{descripcion}</p>
          <div className="reveal reveal-3 mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
