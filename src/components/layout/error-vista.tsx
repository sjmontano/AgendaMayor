"use client";

import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { BtnMayor } from "@/components/ui/botones";
import { Vacio } from "@/components/ui/vacio";

/** Estado de error con reintento: nunca pantalla en blanco. */
export function ErrorVista({ titulo, reset }: { titulo: string; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Vacio
        titulo={titulo}
        texto="Puede ser un problema de conexión momentáneo. Inténtalo de nuevo."
        accion={
          <BtnMayor onClick={reset} icono={RefreshCWIcon} iconoPos="inicio">
            Reintentar
          </BtnMayor>
        }
      />
    </div>
  );
}
