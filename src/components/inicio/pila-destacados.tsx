"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { useIcono } from "@/components/ui/icono";
import { PortadaProyecto } from "@/components/vitrina/proyecto-card";
import { cn } from "@/lib/utils";

/**
 * Pila de proyectos destacados del hero — adaptación de la pila de tarjetas
 * de Web3Bento: abanico con profundidad, clic en una tarjeta la trae al frente,
 * rota sola cada 5s (pausa al pasar el cursor o enfocar; sin rotación con
 * reduced-motion) y un panel esmerilado muestra la del frente.
 */
export interface ItemPila {
  id_proyecto: number;
  titulo: string;
  facultad: string;
  programa: string;
  fotos: string[];
  autor: string;
}

const PEEK = 46;

export function PilaDestacados({ items }: { items: ItemPila[] }) {
  const [orden, setOrden] = useState(() => items.map((i) => i.id_proyecto));
  const [pausa, setPausa] = useState(false);
  const [brillo, setBrillo] = useState(30);
  const reducido = useReducedMotion();
  const { ref, disparadores } = useIcono();

  const profundidad = orden.length - 1;
  const frente = items.find((i) => i.id_proyecto === orden[orden.length - 1]);

  useEffect(() => {
    if (reducido || pausa || orden.length < 2) return;
    const id = window.setInterval(() => {
      setOrden((o) => [o[o.length - 1], ...o.slice(0, -1)]);
    }, 5000);
    return () => window.clearInterval(id);
  }, [reducido, pausa, orden.length]);

  if (!frente) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-[380px]"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocusCapture={() => setPausa(true)}
      onBlurCapture={() => setPausa(false)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setBrillo(((e.clientX - r.left) / r.width) * 100);
      }}
    >
      <div className="relative">
        {orden.map((id, pos) => {
          const item = items.find((i) => i.id_proyecto === id)!;
          const desdeFrente = orden.length - 1 - pos;
          const esFrente = desdeFrente === 0;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => !esFrente && setOrden((o) => [...o.filter((x) => x !== id), id])}
              aria-label={esFrente ? `${item.titulo}, en primer plano` : `Traer al frente: ${item.titulo}`}
              aria-pressed={esFrente}
              tabIndex={esFrente ? -1 : 0}
              className={cn(
                "absolute inset-x-0 top-0 block overflow-hidden rounded-tile text-left ring-1 ring-white/25",
                esFrente ? "cursor-default" : "cursor-pointer"
              )}
              style={{ zIndex: pos + 1, transformOrigin: "top center", boxShadow: "0 -14px 32px -16px rgb(8 46 69 / 0.75)" }}
              initial={reducido ? false : { opacity: 0, y: 40 }}
              animate={{
                opacity: 1,
                y: (profundidad - desdeFrente) * PEEK,
                scale: 1 - desdeFrente * 0.06,
              }}
              transition={{ type: "spring", damping: 22, stiffness: 180, opacity: { delay: pos * 0.09 } }}
            >
              <span className="relative block aspect-[16/10] w-full">
                <PortadaProyecto proyecto={item} className="!scale-100" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 mix-blend-soft-light transition-[background-position] duration-700"
                  style={{
                    backgroundImage:
                      "linear-gradient(115deg, transparent 20%, rgb(255 255 255 / 0.55) 38%, rgb(242 169 0 / 0.45) 50%, transparent 70%)",
                    backgroundSize: "260% 100%",
                    backgroundPosition: `${brillo + desdeFrente * 18}% 0`,
                  }}
                />
                <span className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-unimayor-950/70 to-transparent px-4 pt-3 pb-6">
                  <span className="truncate text-[11px] font-bold tracking-[0.16em] text-gold uppercase">{item.facultad}</span>
                </span>
              </span>
            </motion.button>
          );
        })}
        {/* Espaciador: da a la pila su altura real */}
        <div aria-hidden="true" className="invisible" style={{ paddingTop: profundidad * PEEK }}>
          <div className="aspect-[16/10]" />
        </div>
      </div>

      {/* Panel esmerilado con el proyecto del frente */}
      <div
        className="relative z-20 -mt-16 rounded-tile bg-white/80 p-4 shadow-pop ring-1 ring-white/60 backdrop-blur-xl"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={frente.id_proyecto}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold text-unimayor-900">{frente.titulo}</p>
              <p className="truncate text-xs text-muted">
                {frente.autor} · {frente.programa}
              </p>
            </div>
            <Link
              href={`/proyectos/${frente.id_proyecto}`}
              {...disparadores}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-unimayor-900 text-white transition-colors hover:bg-gold hover:text-unimayor-950"
              aria-label={`Ver proyecto: ${frente.titulo}`}
            >
              <ArrowRightIcon ref={ref} size={18} aria-hidden="true" />
            </Link>
          </motion.div>
        </AnimatePresence>
        {orden.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {items.map((i) => (
              <span
                key={i.id_proyecto}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i.id_proyecto === frente.id_proyecto ? "w-5 bg-gold" : "w-1.5 bg-unimayor-900/20"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
