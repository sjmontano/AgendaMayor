"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Pills } from "@/components/ui/pills";
import { Vacio } from "@/components/ui/vacio";
import { EventoCard, EventoRssCard, type EventoCardData, type EventoRssData } from "@/components/eventos/evento-card";

/**
 * Cartelera con pestañas por tipo: eventos de la BD (OFICIAL / EAFI / COMUNIDAD)
 * y publicaciones en vivo del portal UNIMAYOR (RSS).
 */
type Pestana = "TODOS" | "OFICIAL" | "EAFI" | "COMUNIDAD" | "PORTAL";

export function Cartelera({ eventos, portal }: { eventos: EventoCardData[]; portal: EventoRssData[] }) {
  const [pestana, setPestana] = useState<Pestana>("TODOS");
  const cuenta = (t: string) => eventos.filter((e) => e.tipo === t).length;

  const deBd = pestana === "TODOS" ? eventos : pestana === "PORTAL" ? [] : eventos.filter((e) => e.tipo === pestana);
  const delPortal = pestana === "TODOS" || pestana === "PORTAL" ? portal : [];
  const vacio = deBd.length === 0 && delPortal.length === 0;

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <Pills
          etiqueta="Filtrar eventos"
          valor={pestana}
          onCambio={setPestana}
          opciones={[
            { valor: "TODOS", etiqueta: "Todos", contador: eventos.length + portal.length },
            { valor: "OFICIAL", etiqueta: "Oficiales", contador: cuenta("OFICIAL") },
            { valor: "EAFI", etiqueta: "EAFI", contador: cuenta("EAFI") },
            { valor: "COMUNIDAD", etiqueta: "Comunidad", contador: cuenta("COMUNIDAD") },
            { valor: "PORTAL", etiqueta: "Desde el portal", contador: portal.length },
          ]}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pestana}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-8 space-y-12"
        >
          {vacio && (
            <Vacio titulo="No hay eventos en esta categoría" texto="Prueba con otra pestaña o vuelve pronto." />
          )}
          {deBd.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {deBd.map((e, i) => (
                <motion.li
                  key={e.id_evento}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.4) }}
                >
                  <EventoCard evento={e} />
                </motion.li>
              ))}
            </ul>
          )}
          {delPortal.length > 0 && (
            <section aria-labelledby="desde-portal">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <h2 id="desde-portal" className="text-xl font-extrabold text-ink">
                  Desde el portal UNIMAYOR
                </h2>
                <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
                  En vivo
                </span>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {delPortal.map((e, i) => (
                  <motion.li
                    key={e.id_rss}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.06, 0.4) }}
                  >
                    <EventoRssCard evento={e} />
                  </motion.li>
                ))}
              </ul>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
