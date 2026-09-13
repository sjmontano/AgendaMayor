"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Campana } from "@/components/notificaciones/campana";

/**
 * Navbar principal — Vista (capa de Presentación).
 * Escudo + secciones + sesión (HU-05: cerrar sesión invalida y redirige a /).
 * Teclado: Tab recorre, Escape cierra el panel móvil.
 */
export function SalirButton() {
  const router = useRouter();
  async function salir() {
    await getSupabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={salir}
      className="text-xs font-bold tracking-widest text-[#DC2626] uppercase underline-offset-4 hover:underline"
    >
      Salir
    </button>
  );
}

export function Navbar({ sesion }: { sesion: { username: string } | null }) {
  const [abierto, setAbierto] = useState(false);

  const enlaces = [
    { href: "/", label: "Inicio" },
    { href: "/proyectos", label: "Proyectos" },
    { href: "/eventos", label: "Eventos" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#E4E4E7] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logoPrincipal.jpg"
            alt="Isologo UNIMAYOR"
            width={40}
            height={50}
            style={{ height: "auto" }}
            priority
          />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-[#333030] transition-colors hover:text-[#004884]">
              Agenda Mayor
            </span>
            <span className="block text-[11px] font-bold tracking-[0.2em] text-[#195a90] uppercase">
              Vitrina UNIMAYOR
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-bold text-[#333030] underline-offset-4 hover:text-[#004884] hover:underline"
            >
              {e.label}
            </Link>
          ))}
          <Link
            href="/proyectos/nuevo"
            className="text-sm font-bold text-[#333030] underline-offset-4 hover:text-[#004884] hover:underline"
          >
            Publicar
          </Link>
          {sesion ? (
            <span className="flex items-center gap-3">
              <Campana />
              <Link
                href={`/perfil/${sesion.username}`}
                className="text-sm font-bold text-[#004884]"
              >
                @{sesion.username}
              </Link>
              <SalirButton />
            </span>
          ) : (
            <Link
              href="/ingresar"
              className="border-2 border-[#004884] px-4 py-2 text-xs font-bold tracking-widest text-[#004884] uppercase transition-all hover:bg-[#004884] hover:text-white"
            >
              Ingresar
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="border-2 border-[#E4E4E7] px-3 py-2 text-sm font-bold md:hidden"
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((v) => !v)}
          onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
        >
          {abierto ? "✕" : "☰"}
        </button>
      </div>

      {abierto && (
        <nav className="border-t-2 border-[#E4E4E7] bg-white px-6 py-4 md:hidden" aria-label="Móvil">
          <ul className="space-y-3">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="block text-sm font-bold text-[#333030]"
                  onClick={() => setAbierto(false)}
                >
                  {e.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/proyectos/nuevo"
                className="block text-sm font-bold text-[#333030]"
                onClick={() => setAbierto(false)}
              >
                Publicar
              </Link>
            </li>
            <li>
              <Link
                href={sesion ? `/perfil/${sesion.username}` : "/ingresar"}
                className="block text-sm font-bold text-[#004884]"
                onClick={() => setAbierto(false)}
              >
                {sesion ? `@${sesion.username}` : "Ingresar"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
