import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Estado vacío útil: ilustración mínima + mensaje + acción. Nunca pantalla en blanco. */
export function Vacio({
  titulo,
  texto,
  accion,
  icono,
  className,
}: {
  titulo: string;
  texto?: ReactNode;
  accion?: ReactNode;
  icono?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-grid-light flex flex-col items-center rounded-tile border border-dashed border-unimayor-900/20 bg-unimayor-tint px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-box bg-white text-unimayor-900 shadow-soft" aria-hidden="true">
        {icono ?? (
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h10M4 17h7" />
          </svg>
        )}
      </div>
      <p className="mt-4 text-lg font-extrabold text-unimayor-900">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-pretty text-muted">{texto}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
