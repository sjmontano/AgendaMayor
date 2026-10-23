"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { BellIcon } from "@/components/icons/bell";
import { CheckCheckIcon } from "@/components/icons/check-check";
import { BtnMayor } from "@/components/ui/botones";
import { Pills } from "@/components/ui/pills";
import { SkeletonLista } from "@/components/ui/skeleton";
import { Vacio } from "@/components/ui/vacio";
import { NotificacionItem } from "@/components/notificaciones/notificacion-item";
import { tipoDe, useNotificaciones, type Notificacion } from "@/components/notificaciones/use-notificaciones";

/**
 * Centro de notificaciones (/notificaciones): todas las notificaciones agrupadas
 * por fecha (Hoy, Ayer, Esta semana, Anteriores), filtros por tipo y marcar todas.
 */
type Filtro = "todas" | "sinLeer" | "publicado" | "rechazado";

function grupo(fecha: string) {
  const d = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return "Esta semana";
  return "Anteriores";
}

const ORDEN = ["Hoy", "Ayer", "Esta semana", "Anteriores"];

export function CentroNotificaciones() {
  const { items, estado, sinLeer, marcar, marcarTodas, recargar } = useNotificaciones();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const filtradas = items.filter((n) => {
    if (filtro === "sinLeer") return !n.leida;
    if (filtro === "publicado") return tipoDe(n) === "publicado";
    if (filtro === "rechazado") return tipoDe(n) === "rechazado";
    return true;
  });

  const grupos = new Map<string, Notificacion[]>();
  for (const n of filtradas) {
    const g = grupo(n.fecha);
    grupos.set(g, [...(grupos.get(g) ?? []), n]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills
          etiqueta="Filtrar notificaciones"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: "todas", etiqueta: "Todas", contador: items.length },
            { valor: "sinLeer", etiqueta: "Sin leer", contador: sinLeer },
            { valor: "publicado", etiqueta: "Publicados" },
            { valor: "rechazado", etiqueta: "Con ajustes" },
          ]}
        />
        <BtnMayor variante="secondary" tamano="sm" icono={CheckCheckIcon} iconoPos="inicio" onClick={marcarTodas} disabled={sinLeer === 0}>
          Marcar todas como leídas
        </BtnMayor>
      </div>

      <div className="mt-6" aria-busy={estado === "cargando"}>
        {estado === "cargando" ? (
          <div className="rounded-tile border border-line bg-white p-5">
            <SkeletonLista filas={5} />
          </div>
        ) : estado === "error" ? (
          <Vacio
            titulo="No pudimos cargar tus notificaciones"
            texto="Revisa tu conexión e inténtalo de nuevo."
            accion={
              <BtnMayor variante="secondary" onClick={() => void recargar()}>
                Reintentar
              </BtnMayor>
            }
          />
        ) : filtradas.length === 0 ? (
          <Vacio
            icono={<BellIcon size={26} />}
            titulo={filtro === "todas" ? "Aún no tienes notificaciones" : "Nada por aquí"}
            texto="Te avisaremos cuando un docente revise tus proyectos."
            accion={
              <BtnMayor href="/proyectos/nuevo" tamano="sm">
                Publicar un proyecto
              </BtnMayor>
            }
          />
        ) : (
          <div className="space-y-6">
            {ORDEN.filter((g) => grupos.has(g)).map((g) => (
              <section key={g} aria-labelledby={`grupo-${g}`}>
                <h2 id={`grupo-${g}`} className="mb-2 px-1 text-xs font-bold tracking-[0.16em] text-muted uppercase">
                  {g}
                </h2>
                <ul className="space-y-1 rounded-tile border border-line bg-white p-2">
                  <AnimatePresence initial={false}>
                    {grupos.get(g)!.map((n, i) => (
                      <NotificacionItem key={n.id_notificacion} n={n} onMarcar={marcar} orden={i} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
