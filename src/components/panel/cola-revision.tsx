"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CheckIcon } from "@/components/icons/check";
import { XIcon } from "@/components/icons/x";
import { ClipboardCheckIcon } from "@/components/icons/clipboard-check";
import { Avatar } from "@/components/ui/avatar";
import { BadgeTipo } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { CampoArea } from "@/components/ui/campo";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Vacio } from "@/components/ui/vacio";
import { PortadaProyecto, type ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { apiPatch, mensajeDeError } from "@/lib/api";
import { cn, tiempoRelativo } from "@/lib/utils";

/**
 * Cola de revisión (HU-12): el docente avala o pide ajustes.
 * Aprobar es directo (con toast); rechazar abre un diálogo con motivo
 * obligatorio y sugerencias rápidas. El ítem sale de la cola con animación.
 */
const MOTIVOS = [
  "Falta describir la metodología o los resultados.",
  "Las imágenes no corresponden al proyecto o no cargan.",
  "Revisa ortografía y redacción antes de publicar.",
  "El programa o la facultad no coinciden con el proyecto.",
];

export function ColaRevision({ pendientes: iniciales }: { pendientes: ProyectoCardData[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pendientes, setPendientes] = useState(iniciales);
  const [abierto, setAbierto] = useState<number | null>(iniciales[0]?.id_proyecto ?? null);
  const [rechazando, setRechazando] = useState<ProyectoCardData | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function aprobar(p: ProyectoCardData) {
    setProcesando(p.id_proyecto);
    try {
      await apiPatch(`/api/proyectos/${p.id_proyecto}`, { accion: "publicar" });
      setPendientes((ps) => ps.filter((x) => x.id_proyecto !== p.id_proyecto));
      toast.exito("Proyecto publicado", `“${p.titulo}” ya está en la vitrina.`);
      router.refresh();
    } catch (e) {
      toast.error("No se pudo aprobar", mensajeDeError(e));
    } finally {
      setProcesando(null);
    }
  }

  async function confirmarRechazo() {
    if (!rechazando) return;
    if (motivo.trim().length < 10) {
      setErrorMotivo("Explica el motivo (mínimo 10 caracteres) para que el estudiante pueda corregir.");
      return;
    }
    setProcesando(rechazando.id_proyecto);
    try {
      await apiPatch(`/api/proyectos/${rechazando.id_proyecto}`, { accion: "rechazar", motivoRechazo: motivo.trim() });
      setPendientes((ps) => ps.filter((x) => x.id_proyecto !== rechazando.id_proyecto));
      toast.info("Se pidieron ajustes", "El estudiante recibirá el motivo en sus notificaciones.");
      setRechazando(null);
      setMotivo("");
      router.refresh();
    } catch (e) {
      toast.error("No se pudo rechazar", mensajeDeError(e));
    } finally {
      setProcesando(null);
    }
  }

  if (pendientes.length === 0) {
    return (
      <Vacio
        icono={<ClipboardCheckIcon size={26} />}
        titulo="¡Cola al día!"
        texto="No hay proyectos esperando tu aval. Te avisaremos cuando llegue uno nuevo."
      />
    );
  }

  return (
    <>
      <ul className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {pendientes.map((p) => {
            const expandido = abierto === p.id_proyecto;
            return (
              <motion.li
                key={p.id_proyecto}
                layout
                exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                className={cn(
                  "overflow-hidden rounded-tile border bg-white transition-[border-color,box-shadow]",
                  expandido ? "border-unimayor-900/30 shadow-soft" : "border-line"
                )}
              >
                <button
                  type="button"
                  onClick={() => setAbierto(expandido ? null : p.id_proyecto)}
                  aria-expanded={expandido}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-unimayor-tint"
                >
                  <div className="relative hidden aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                    <PortadaProyecto proyecto={p} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgeTipo tipo={p.tipo} />
                      {p.fecha_registro && <span className="text-xs text-muted">{tiempoRelativo(p.fecha_registro)}</span>}
                    </div>
                    <p className="mt-1 truncate font-extrabold text-ink">{p.titulo}</p>
                    <p className="flex items-center gap-1.5 truncate text-[13px] text-muted">
                      <Avatar nombre={p.autor?.nombre} apellido={p.autor?.apellido} tamano="sm" className="size-5 text-[9px]" />
                      {p.autor ? `${p.autor.nombre} ${p.autor.apellido}` : "—"} · {p.programa}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className={cn("size-5 shrink-0 text-muted transition-transform duration-300", expandido && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <AnimatePresence initial={false}>
                  {expandido && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line-soft px-4 pt-4 pb-5">
                        <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{p.descripcion}</p>
                        {p.fotos.length > 0 && (
                          <ul className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Imágenes del proyecto">
                            {p.fotos.map((f) => (
                              <li key={f} className="shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={f} alt="" loading="lazy" className="h-24 w-36 rounded-lg object-cover ring-1 ring-line" />
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <BtnMayor
                            variante="success"
                            tamano="sm"
                            icono={CheckIcon}
                            iconoPos="inicio"
                            cargando={procesando === p.id_proyecto}
                            onClick={() => aprobar(p)}
                          >
                            Aprobar y publicar
                          </BtnMayor>
                          <BtnMayor
                            variante="secondary"
                            tamano="sm"
                            icono={XIcon}
                            iconoPos="inicio"
                            disabled={procesando === p.id_proyecto}
                            onClick={() => {
                              setRechazando(p);
                              setMotivo("");
                              setErrorMotivo(null);
                            }}
                            className="text-error ring-error/25 hover:bg-error-soft hover:ring-error"
                          >
                            Pedir ajustes
                          </BtnMayor>
                          <Link
                            href={`/proyectos/${p.id_proyecto}`}
                            className="ml-auto text-[13px] font-bold text-unimayor-700 underline-offset-4 hover:underline"
                          >
                            Abrir detalle
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Modal
        abierto={rechazando !== null}
        onCerrar={() => procesando === null && setRechazando(null)}
        titulo="Pedir ajustes"
        descripcion={rechazando ? `“${rechazando.titulo}” volverá al estudiante con tu comentario.` : undefined}
        ancho="max-w-lg"
      >
        <p className="text-[13px] font-bold text-ink">Sugerencias rápidas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOTIVOS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMotivo((v) => (v ? `${v} ${m}` : m));
                setErrorMotivo(null);
              }}
              className="rounded-full bg-unimayor-tint px-3 py-1.5 text-left text-xs font-semibold text-unimayor-900 ring-1 ring-unimayor-100 transition-colors hover:bg-unimayor-100"
            >
              + {m}
            </button>
          ))}
        </div>
        <CampoArea
          className="mt-4"
          etiqueta="Motivo para el estudiante"
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setErrorMotivo(null);
          }}
          maxLength={500}
          contador={{ actual: motivo.length, max: 500 }}
          error={errorMotivo}
          rows={4}
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-3">
          <BtnMayor variante="ghost" onClick={() => setRechazando(null)} disabled={procesando !== null}>
            Cancelar
          </BtnMayor>
          <BtnMayor variante="danger" onClick={confirmarRechazo} cargando={procesando !== null}>
            Enviar ajustes
          </BtnMayor>
        </div>
      </Modal>
    </>
  );
}
