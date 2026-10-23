import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tile del bento (patrón Web3Bento adaptado a la caja UNIMAYOR):
 * superficie blanca, borde fino, radio 20px, encabezado opcional con acción.
 */
export function Tile({
  titulo,
  accion,
  className,
  style,
  children,
  como: Etiqueta = "section",
  tono = "claro",
  "aria-label": ariaLabel,
}: {
  titulo?: ReactNode;
  accion?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  como?: "section" | "div" | "article";
  tono?: "claro" | "azul" | "oro";
  "aria-label"?: string;
}) {
  const tonos = {
    claro: "border border-line bg-white text-ink",
    azul: "on-dark bg-unimayor-900 text-white",
    oro: "bg-gold text-unimayor-950",
  };
  return (
    <Etiqueta
      aria-label={ariaLabel}
      className={cn("relative flex min-w-0 flex-col overflow-hidden rounded-tile p-5 sm:p-6", tonos[tono], className)}
      style={style}
    >
      {(titulo || accion) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {titulo && (
            <h3
              className={cn(
                "text-[13px] font-bold",
                tono === "claro" ? "text-muted" : tono === "azul" ? "text-white/75" : "text-unimayor-950/75"
              )}
            >
              {titulo}
            </h3>
          )}
          {accion}
        </header>
      )}
      {children}
    </Etiqueta>
  );
}
