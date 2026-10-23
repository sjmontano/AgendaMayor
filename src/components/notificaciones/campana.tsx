"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { BellIcon } from "@/components/icons/bell";
import { CheckCheckIcon } from "@/components/icons/check-check";
import { useIcono } from "@/components/ui/icono";
import { Pills } from "@/components/ui/pills";
import { SkeletonLista } from "@/components/ui/skeleton";
import { NotificacionItem } from "@/components/notificaciones/notificacion-item";
import { useNotificaciones } from "@/components/notificaciones/use-notificaciones";
import { cn } from "@/lib/utils";

/**
 * Campana de notificaciones (HU-15) — popover con pestañas Todas/Sin leer,
 * marcar todas, enlace a /notificaciones. La campana se agita cuando
 * llega algo nuevo. Escape o clic fuera cierran y devuelven el foco.
 */
export function Campana() {
  const { items, estado, sinLeer, marcar, marcarTodas } = useNotificaciones();
  const [abierta, setAbierta] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "sinLeer">("todas");
  const panelId = useId();
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const { ref: icono, disparadores } = useIcono();
  const previoSinLeer = useRef(sinLeer);

  // Agita la campana cuando aumentan las no leídas
  useEffect(() => {
    if (sinLeer > previoSinLeer.current) icono.current?.startAnimation();
    previoSinLeer.current = sinLeer;
  }, [sinLeer, icono]);

  useEffect(() => {
    if (!abierta) return;
    function fuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierta(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierta(false);
        boton.current?.focus();
      }
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierta]);

  const visibles = filtro === "todas" ? items : items.filter((i) => !i.leida);

  return (
    <div ref={contenedor} className="relative">
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        aria-controls={panelId}
        aria-label={`Notificaciones${sinLeer > 0 ? `, ${sinLeer} sin leer` : ""}`}
        {...disparadores}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-box text-ink transition-colors hover:bg-unimayor-100 hover:text-unimayor-900",
          abierta && "bg-unimayor-100 text-unimayor-900"
        )}
      >
        <BellIcon ref={icono} size={21} aria-hidden="true" />
        <AnimatePresence>
          {sinLeer > 0 && (
            <motion.span
              key="contador"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 400 }}
              className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] animate-pulse-ring items-center justify-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-unimayor-950 tabular-nums"
              aria-hidden="true"
            >
              {sinLeer > 9 ? "9+" : sinLeer}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {abierta && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Notificaciones"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-tile bg-white shadow-pop ring-1 ring-line"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line-soft px-4 pt-4 pb-3">
              <div>
                <p className="text-base font-extrabold text-unimayor-900">Notificaciones</p>
                <p className="text-xs text-muted">
                  {sinLeer > 0 ? `${sinLeer} sin leer` : "Estás al día"}
                </p>
              </div>
              {sinLeer > 0 && (
                <button
                  type="button"
                  onClick={marcarTodas}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-unimayor-700 hover:bg-unimayor-100"
                >
                  <CheckCheckIcon size={16} aria-hidden="true" />
                  Marcar todas
                </button>
              )}
            </header>
            <div className="px-4 pt-3">
              <Pills
                etiqueta="Filtrar notificaciones"
                valor={filtro}
                onCambio={setFiltro}
                opciones={[
                  { valor: "todas", etiqueta: "Todas" },
                  { valor: "sinLeer", etiqueta: "Sin leer", contador: sinLeer },
                ]}
              />
            </div>
            <div className="scroll-fino max-h-[min(60vh,420px)] overflow-y-auto px-2 py-2">
              {estado === "cargando" ? (
                <div className="p-2">
                  <SkeletonLista filas={3} />
                </div>
              ) : estado === "error" ? (
                <p className="p-4 text-sm text-error">No pudimos cargar tus notificaciones.</p>
              ) : visibles.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-unimayor-100 text-unimayor-900" aria-hidden="true">
                    <BellIcon size={22} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink">
                    {filtro === "sinLeer" ? "No tienes pendientes" : "Aún no hay notificaciones"}
                  </p>
                  <p className="mt-1 text-xs text-muted">Aquí verás el resultado de la revisión de tus proyectos.</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>
                    {visibles.slice(0, 8).map((n, i) => (
                      <NotificacionItem key={n.id_notificacion} n={n} onMarcar={marcar} orden={i} compacto />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            <footer className="border-t border-line-soft bg-unimayor-tint px-4 py-2.5 text-center">
              <Link
                href="/notificaciones"
                onClick={() => setAbierta(false)}
                className="text-[13px] font-bold text-unimayor-700 underline-offset-4 hover:underline"
              >
                Ver todas las notificaciones
              </Link>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
