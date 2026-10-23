"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HomeIcon } from "@/components/icons/home";
import { LayersIcon } from "@/components/icons/layers";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { LayoutGridIcon } from "@/components/icons/layout-grid";
import { PlusIcon } from "@/components/icons/plus";
import { UserIcon } from "@/components/icons/user";
import { BellIcon } from "@/components/icons/bell";
import { LogoutIcon } from "@/components/icons/logout";
import { MenuIcon } from "@/components/icons/menu";
import { BtnIcono, BtnMayor } from "@/components/ui/botones";
import { Drawer } from "@/components/ui/drawer";
import { Avatar } from "@/components/ui/avatar";
import { useIcono, type IconoAnimado } from "@/components/ui/icono";
import { Campana } from "@/components/notificaciones/campana";
import { apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Navbar principal — extensión del portal UNIMAYOR, no copia.
 * Sticky con compactación al hacer scroll, indicador activo que se desliza,
 * campana, menú de usuario y drawer móvil (< 1024px) con arrastre para cerrar.
 */
export interface SesionNav {
  username: string;
  nombre: string;
  apellido: string;
  nombre_rol: string;
}

interface Enlace {
  href: string;
  label: string;
  icono: IconoAnimado;
}

function activo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ sesion }: { sesion: SesionNav | null }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setCompacto(y > 24));

  const enlaces: Enlace[] = [
    { href: "/", label: "Inicio", icono: HomeIcon },
    { href: "/proyectos", label: "Proyectos", icono: LayersIcon },
    { href: "/eventos", label: "Eventos", icono: CalendarDaysIcon },
    ...(sesion ? [{ href: "/panel", label: "Mi panel", icono: LayoutGridIcon }] : []),
  ];

  // Cierra el drawer al navegar
  const rutaPrevia = useRef(pathname);
  useEffect(() => {
    if (rutaPrevia.current !== pathname) {
      rutaPrevia.current = pathname;
      setAbierto(false);
    }
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300",
        compacto ? "border-line bg-white/85 shadow-soft backdrop-blur-xl" : "border-transparent bg-white"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6",
          compacto ? "h-16" : "h-20"
        )}
      >
        <Link href="/" className="group flex items-center gap-3 rounded-lg" aria-label="Agenda Mayor, ir al inicio">
          <span className="relative">
            <Image
              src="/brand/logoPrincipal.jpg"
              alt=""
              width={40}
              height={50}
              className={cn("w-auto transition-[height] duration-300", compacto ? "h-10" : "h-12")}
              priority
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-[-0.01em] text-unimayor-900">Agenda Mayor</span>
            <span className="block text-[10px] font-bold tracking-[0.22em] text-muted uppercase">
              UNIMAYOR · Vitrina
            </span>
          </span>
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Principal">
          <ul className="flex items-center gap-1 rounded-full bg-line-soft/70 p-1">
            {enlaces.map((e) => (
              <ItemNav key={e.href} enlace={e} activo={activo(pathname, e.href)} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {sesion ? (
            <>
              <BtnMayor href="/proyectos/nuevo" variante="gold" tamano="sm" icono={PlusIcon} iconoPos="inicio" className="hidden sm:inline-flex">
                Publicar
              </BtnMayor>
              <Campana />
              <MenuUsuario sesion={sesion} />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <BtnMayor href="/ingresar" variante="ghost" tamano="sm">
                Ingresar
              </BtnMayor>
              <BtnMayor href="/registro" tamano="sm">
                Crear cuenta
              </BtnMayor>
            </div>
          )}
          <BtnIcono
            icono={MenuIcon}
            etiqueta="Abrir menú"
            onClick={() => setAbierto(true)}
            aria-expanded={abierto}
            className="lg:hidden"
          />
        </div>
      </div>

      <Drawer
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Menú"
        pie={
          sesion ? (
            <BotonSalir anchoCompleto />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <BtnMayor href="/ingresar" variante="secondary" tamano="sm">
                Ingresar
              </BtnMayor>
              <BtnMayor href="/registro" tamano="sm">
                Crear cuenta
              </BtnMayor>
            </div>
          )
        }
      >
        {sesion && (
          <div className="mb-4 flex items-center gap-3 rounded-box bg-unimayor-tint p-3">
            <Avatar nombre={sesion.nombre} apellido={sesion.apellido} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">
                {sesion.nombre} {sesion.apellido}
              </p>
              <p className="truncate text-xs text-muted">@{sesion.username}</p>
            </div>
          </div>
        )}
        <ul className="space-y-1">
          {enlaces.map((e, i) => (
            <motion.li
              key={e.href}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
            >
              <ItemDrawer enlace={e} activo={activo(pathname, e.href)} />
            </motion.li>
          ))}
          {sesion && (
            <>
              <li>
                <ItemDrawer enlace={{ href: "/notificaciones", label: "Notificaciones", icono: BellIcon }} activo={activo(pathname, "/notificaciones")} />
              </li>
              <li>
                <ItemDrawer enlace={{ href: `/perfil/${sesion.username}`, label: "Mi perfil público", icono: UserIcon }} activo={activo(pathname, "/perfil")} />
              </li>
            </>
          )}
        </ul>
        {sesion && (
          <BtnMayor href="/proyectos/nuevo" variante="gold" icono={PlusIcon} iconoPos="inicio" anchoCompleto className="mt-5">
            Publicar proyecto
          </BtnMayor>
        )}
      </Drawer>
    </header>
  );
}

function ItemNav({ enlace, activo }: { enlace: Enlace; activo: boolean }) {
  const { ref, disparadores } = useIcono();
  const Icono = enlace.icono;
  return (
    <li>
      <Link
        href={enlace.href}
        aria-current={activo ? "page" : undefined}
        {...disparadores}
        className={cn(
          "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200",
          activo ? "text-white" : "text-ink hover:text-unimayor-900"
        )}
      >
        {activo && (
          <motion.span
            layoutId="nav-activo"
            className="absolute inset-0 rounded-full bg-unimayor-900 shadow-soft"
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            aria-hidden="true"
          />
        )}
        <Icono ref={ref} size={17} className="relative" aria-hidden="true" />
        <span className="relative">{enlace.label}</span>
      </Link>
    </li>
  );
}

function ItemDrawer({ enlace, activo }: { enlace: Enlace; activo: boolean }) {
  const { ref, disparadores } = useIcono();
  const Icono = enlace.icono;
  return (
    <Link
      href={enlace.href}
      aria-current={activo ? "page" : undefined}
      {...disparadores}
      className={cn(
        "flex items-center gap-3 rounded-box px-3 py-3 text-[15px] font-bold transition-colors",
        activo ? "bg-unimayor-900 text-white" : "text-ink hover:bg-unimayor-100 hover:text-unimayor-900"
      )}
    >
      <Icono ref={ref} size={20} aria-hidden="true" />
      {enlace.label}
      {activo && <span className="ml-auto h-5 w-1 rounded-full bg-gold" aria-hidden="true" />}
    </Link>
  );
}

function MenuUsuario({ sesion }: { sesion: SesionNav }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  const rol = { ESTUDIANTE: "Estudiante", DOCENTE: "Docente", ADMIN: "Administración" }[sesion.nombre_rol] ?? sesion.nombre_rol;

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label={`Cuenta de ${sesion.nombre} ${sesion.apellido}`}
        className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-unimayor-100"
      >
        <Avatar nombre={sesion.nombre} apellido={sesion.apellido} />
        <span className="text-left leading-tight">
          <span className="block max-w-28 truncate text-[13px] font-bold text-ink">{sesion.nombre}</span>
          <span className="block text-[11px] text-muted">{rol}</span>
        </span>
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-tile bg-white p-2 shadow-pop ring-1 ring-line"
          >
            <div className="flex items-center gap-3 rounded-box bg-unimayor-tint p-3">
              <Avatar nombre={sesion.nombre} apellido={sesion.apellido} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {sesion.nombre} {sesion.apellido}
                </p>
                <p className="truncate text-xs text-muted">@{sesion.username}</p>
              </div>
            </div>
            <ul className="mt-1 py-1">
              <ItemMenu href="/panel" icono={LayoutGridIcon} onClick={() => setAbierto(false)}>
                Mi panel
              </ItemMenu>
              <ItemMenu href={`/perfil/${sesion.username}`} icono={UserIcon} onClick={() => setAbierto(false)}>
                Mi perfil público
              </ItemMenu>
              <ItemMenu href="/notificaciones" icono={BellIcon} onClick={() => setAbierto(false)}>
                Notificaciones
              </ItemMenu>
            </ul>
            <div className="border-t border-line-soft pt-2">
              <BotonSalir />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemMenu({
  href,
  icono: Icono,
  children,
  onClick,
}: {
  href: string;
  icono: IconoAnimado;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { ref, disparadores } = useIcono();
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        {...disparadores}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-unimayor-100 hover:text-unimayor-900"
      >
        <Icono ref={ref} size={18} aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}

export function BotonSalir({ anchoCompleto = false }: { anchoCompleto?: boolean }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  async function salir() {
    setSaliendo(true);
    try {
      await apiPost("/api/auth/logout", {});
    } finally {
      router.push("/");
      router.refresh();
    }
  }
  return (
    <BtnMayor
      variante="ghost"
      tamano="sm"
      icono={LogoutIcon}
      iconoPos="inicio"
      cargando={saliendo}
      onClick={salir}
      anchoCompleto={anchoCompleto}
      className="w-full justify-start text-error hover:bg-error-soft"
    >
      Cerrar sesión
    </BtnMayor>
  );
}

