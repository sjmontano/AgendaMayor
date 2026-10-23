"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIcono, type IconoAnimado } from "@/components/ui/icono";

type Variante = "primary" | "secondary" | "ghost" | "gold" | "onDark" | "onDarkGhost" | "danger" | "success";
type Tamano = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-box font-bold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-standard)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variantes: Record<Variante, string> = {
  primary:
    "bg-unimayor-900 text-white shadow-soft hover:bg-unimayor-800 hover:shadow-lift hover:-translate-y-0.5",
  secondary:
    "bg-white text-unimayor-900 ring-2 ring-inset ring-unimayor-900/15 hover:ring-unimayor-900 hover:bg-unimayor-tint",
  ghost: "text-unimayor-900 hover:bg-unimayor-100",
  gold: "bg-gold text-unimayor-950 shadow-soft hover:bg-gold-hover hover:shadow-lift hover:-translate-y-0.5",
  onDark: "bg-white text-unimayor-900 shadow-soft hover:bg-gold hover:text-unimayor-950 hover:-translate-y-0.5",
  onDarkGhost: "text-white ring-2 ring-inset ring-white/35 hover:ring-white hover:bg-white/10",
  danger: "bg-error text-white hover:brightness-110 hover:-translate-y-0.5 shadow-soft",
  success: "bg-success text-white hover:brightness-110 hover:-translate-y-0.5 shadow-soft",
};

const tamanos: Record<Tamano, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

const conBrillo: Variante[] = ["primary", "gold", "onDark"];

interface Comunes {
  variante?: Variante;
  tamano?: Tamano;
  icono?: IconoAnimado;
  iconoPos?: "inicio" | "fin";
  cargando?: boolean;
  anchoCompleto?: boolean;
  className?: string;
  children?: ReactNode;
}

type ComoBoton = Comunes & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ComoEnlace = Comunes & { href: string; externo?: boolean; "aria-label"?: string; onClick?: () => void };

/**
 * Botón institucional Agenda Mayor (botón o enlace).
 * Estados: default, hover (eleva + brillo), focus-visible (global), active (press),
 * disabled, loading (spinner + aria-busy). Área táctil ≥ 44px en md/lg.
 * El icono animado se dispara al hover/foco de todo el botón.
 */
export function BtnMayor(props: ComoBoton | ComoEnlace) {
  const {
    variante = "primary",
    tamano = "md",
    icono: Icono,
    iconoPos = "fin",
    cargando = false,
    anchoCompleto = false,
    className,
    children,
  } = props;
  const { ref, disparadores } = useIcono();

  const clases = cn(base, variantes[variante], tamanos[tamano], anchoCompleto && "w-full", className);

  const contenido = (
    <>
      {conBrillo.includes(variante) && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/35 to-transparent group-hover/btn:animate-shine"
        />
      )}
      {cargando && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {!cargando && Icono && iconoPos === "inicio" && <Icono ref={ref} size={18} aria-hidden="true" />}
      <span className="relative">{children}</span>
      {!cargando && Icono && iconoPos === "fin" && <Icono ref={ref} size={18} aria-hidden="true" />}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, externo, onClick } = props;
    return (
      <Link
        href={href}
        className={clases}
        onClick={onClick}
        aria-label={props["aria-label"]}
        {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...disparadores}
      >
        {contenido}
      </Link>
    );
  }

  const {
    variante: _v,
    tamano: _t,
    icono: _i,
    iconoPos: _p,
    cargando: _c,
    anchoCompleto: _a,
    className: _cl,
    children: _ch,
    ...resto
  } = props as ComoBoton;
  void _v; void _t; void _i; void _p; void _c; void _a; void _cl; void _ch;

  return (
    <button
      type="button"
      {...resto}
      disabled={resto.disabled || cargando}
      aria-busy={cargando || undefined}
      className={clases}
      onMouseEnter={(e) => {
        disparadores.onMouseEnter();
        resto.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        disparadores.onMouseLeave();
        resto.onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        disparadores.onFocus();
        resto.onFocus?.(e);
      }}
      onBlur={(e) => {
        disparadores.onBlur();
        resto.onBlur?.(e);
      }}
    >
      {contenido}
    </button>
  );
}

/** Botón de solo icono (cerrar, menú…) con etiqueta accesible obligatoria. */
export function BtnIcono({
  icono: Icono,
  etiqueta,
  className,
  tamano = 20,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icono: IconoAnimado; etiqueta: string; tamano?: number }) {
  const { ref, disparadores } = useIcono();
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      {...props}
      {...disparadores}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-box text-ink transition-colors duration-200 hover:bg-unimayor-100 hover:text-unimayor-900 active:scale-95 disabled:opacity-50",
        className
      )}
    >
      <Icono ref={ref} size={tamano} aria-hidden="true" />
    </button>
  );
}

/** Compatibilidad: botón deshabilitado con spinner. */
export function LoadingButton({ label = "Cargando" }: { label?: string }) {
  return (
    <BtnMayor cargando anchoCompleto>
      {label}
    </BtnMayor>
  );
}
