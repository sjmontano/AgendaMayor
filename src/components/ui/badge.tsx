import type { ReactNode } from "react";
import { badge, badgeEstado, badgeTipo, etiquetaEstado, etiquetaTipo } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn(badge.base, className)}>{children}</span>;
}

/** Cara visible de proyecto.state.ts: color + punto + texto (no solo color). */
export function BadgeEstado({ estado, className }: { estado: string; className?: string }) {
  return (
    <span className={cn(badge.base, badgeEstado[estado] ?? badge.estadoBorrador, className)}>
      <span
        className={cn("size-1.5 rounded-full bg-current", estado === "EN_REVISION" && "animate-pulse")}
        aria-hidden="true"
      />
      {etiquetaEstado[estado] ?? estado}
    </span>
  );
}

export function BadgeTipo({ tipo, className }: { tipo: string; className?: string }) {
  return (
    <span
      className={cn(badge.base, badgeTipo[tipo] ?? badge.tipoComunidad, className)}
      title={tipo === "EAFI" ? "Encuentro Académico de Facultad" : undefined}
    >
      {etiquetaTipo[tipo] ?? tipo}
    </span>
  );
}

export function BadgeFacultad({ facultad, className }: { facultad: string; className?: string }) {
  return <span className={cn(badge.base, badge.facultad, "normal-case tracking-normal", className)}>{facultad}</span>;
}
