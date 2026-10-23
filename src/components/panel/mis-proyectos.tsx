"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PlusIcon } from "@/components/icons/plus";
import { SendIcon } from "@/components/icons/send";
import { BtnMayor } from "@/components/ui/botones";
import { BadgeEstado, BadgeTipo } from "@/components/ui/badge";
import { Campo, CampoArea } from "@/components/ui/campo";
import { Modal } from "@/components/ui/modal";
import { Pills } from "@/components/ui/pills";
import { useToast } from "@/components/ui/toast";
import { Vacio } from "@/components/ui/vacio";
import { PortadaProyecto, type ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { apiPatch } from "@/lib/api";
import { cn, fechaLarga } from "@/lib/utils";

/**
 * Mis proyectos (panel del estudiante): filtros por estado, seguimiento visual
 * de la máquina de estados por proyecto, editar y reenviar los rechazados,
 * eliminar borradores/rechazados con confirmación.
 */
type Filtro = "TODOS" | "EN_REVISION" | "PUBLICADO" | "RECHAZADO";

const PASOS = ["Enviado", "En revisión", "Resultado"];

function pasoActual(estado: string) {
  if (estado === "BORRADOR") return 0;
  if (estado === "EN_REVISION") return 1;
  return 2;
}

function Seguimiento({ estado }: { estado: string }) {
  const actual = pasoActual(estado);
  const rechazado = estado === "RECHAZADO";
  return (
    <ol className="flex items-center gap-2" aria-label="Seguimiento del proyecto">
      {PASOS.map((p, i) => {
        const hecho = i < actual || (i === actual && estado === "PUBLICADO");
        const enCurso = i === actual && !hecho;
        const etiqueta = i === 2 ? (estado === "PUBLICADO" ? "Publicado" : rechazado ? "Con ajustes" : p) : p;
        return (
          <li key={p} className="flex flex-1 items-center gap-2" aria-current={enCurso ? "step" : undefined}>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                hecho && "bg-success text-white",
                enCurso && !rechazado && "bg-warning-soft text-warning ring-2 ring-warning/40",
                enCurso && rechazado && "bg-error-soft text-error ring-2 ring-error/40",
                !hecho && !enCurso && "bg-line-soft text-muted"
              )}
              aria-hidden="true"
            >
              {hecho ? "✓" : rechazado && i === 2 ? "!" : i + 1}
            </span>
            <span className={cn("text-xs font-bold", hecho || enCurso ? "text-ink" : "text-muted")}>{etiqueta}</span>
            {i < PASOS.length - 1 && (
              <span className={cn("h-0.5 flex-1 rounded-full", i < actual ? "bg-success" : "bg-line")} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function MisProyectos({ proyectos: iniciales }: { proyectos: ProyectoCardData[] }) {
  const router = useRouter();
  const toast = useToast();
  const [proyectos, setProyectos] = useState(iniciales);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [editando, setEditando] = useState<ProyectoCardData | null>(null);
  const [eliminando, setEliminando] = useState<ProyectoCardData | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cuenta = (e: string) => proyectos.filter((p) => p.estado === e).length;
  const visibles = filtro === "TODOS" ? proyectos : proyectos.filter((p) => p.estado === filtro);

  async function guardarYReenviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!editando) return;
    const fd = new FormData(ev.currentTarget);
    const fotos = String(fd.get("fotos") ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setOcupado(true);
    try {
      await apiPatch(`/api/proyectos/${editando.id_proyecto}`, {
        titulo: String(fd.get("titulo")),
        descripcion: String(fd.get("descripcion")),
        fotos,
      });
      await apiPatch(`/api/proyectos/${editando.id_proyecto}`, { accion: "reenviar" });
      setProyectos((ps) =>
        ps.map((p) =>
          p.id_proyecto === editando.id_proyecto
            ? { ...p, titulo: String(fd.get("titulo")), descripcion: String(fd.get("descripcion")), fotos, estado: "EN_REVISION", motivo_rechazo: null }
            : p
        )
      );
      toast.exito("Proyecto reenviado a revisión", "Te avisaremos cuando tu facultad lo revise.");
      setEditando(null);
      router.refresh();
    } catch (e) {
      toast.error("No pudimos reenviar el proyecto", e instanceof Error ? e.message : undefined);
    } finally {
      setOcupado(false);
    }
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    setOcupado(true);
    try {
      await apiPatch(`/api/proyectos/${eliminando.id_proyecto}`, { accion: "eliminar" });
      setProyectos((ps) => ps.filter((p) => p.id_proyecto !== eliminando.id_proyecto));
      toast.info("Proyecto eliminado");
      setEliminando(null);
      router.refresh();
    } catch (e) {
      toast.error("No pudimos eliminarlo", e instanceof Error ? e.message : undefined);
    } finally {
      setOcupado(false);
    }
  }

  if (proyectos.length === 0) {
    return (
      <Vacio
        titulo="Todavía no has publicado proyectos"
        texto="Tu primer proyecto está a un par de minutos. El asistente te guía paso a paso."
        accion={
          <BtnMayor href="/proyectos/nuevo" variante="gold" icono={PlusIcon} iconoPos="inicio">
            Publicar mi primer proyecto
          </BtnMayor>
        }
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <Pills
          etiqueta="Filtrar mis proyectos por estado"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: "TODOS", etiqueta: "Todos", contador: proyectos.length },
            { valor: "EN_REVISION", etiqueta: "En revisión", contador: cuenta("EN_REVISION") },
            { valor: "PUBLICADO", etiqueta: "Publicados", contador: cuenta("PUBLICADO") },
            { valor: "RECHAZADO", etiqueta: "Con ajustes", contador: cuenta("RECHAZADO") },
          ]}
        />
      </div>

      <ul className="mt-5 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visibles.map((p, i) => (
            <motion.li
              key={p.id_proyecto}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="overflow-hidden rounded-tile border border-line bg-white transition-shadow hover:shadow-soft"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-box sm:w-36">
                  <PortadaProyecto proyecto={p} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BadgeEstado estado={p.estado} />
                    <BadgeTipo tipo={p.tipo} />
                    {p.fecha_registro && <span className="text-xs text-muted">{fechaLarga(p.fecha_registro)}</span>}
                  </div>
                  <h3 className="mt-2 truncate text-base font-extrabold text-ink">{p.titulo}</h3>
                  <p className="truncate text-[13px] text-muted">
                    {p.programa} · {p.facultad}
                  </p>
                  <div className="mt-3 max-w-md">
                    <Seguimiento estado={p.estado} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                  {p.estado === "PUBLICADO" && (
                    <BtnMayor href={`/proyectos/${p.id_proyecto}`} variante="secondary" tamano="sm">
                      Ver publicado
                    </BtnMayor>
                  )}
                  {p.estado === "RECHAZADO" && (
                    <BtnMayor tamano="sm" icono={SendIcon} onClick={() => setEditando(p)}>
                      Ajustar y reenviar
                    </BtnMayor>
                  )}
                  {(p.estado === "RECHAZADO" || p.estado === "BORRADOR") && (
                    <BtnMayor variante="ghost" tamano="sm" className="text-error hover:bg-error-soft" onClick={() => setEliminando(p)}>
                      Eliminar
                    </BtnMayor>
                  )}
                  {p.estado === "EN_REVISION" && (
                    <span className="rounded-box bg-warning-soft px-3 py-2 text-center text-xs font-bold text-warning">
                      Esperando aval
                    </span>
                  )}
                </div>
              </div>
              {p.estado === "RECHAZADO" && p.motivo_rechazo && (
                <div className="border-t border-error/15 bg-error-soft/60 px-4 py-3 text-sm">
                  <span className="font-bold text-error">Motivo del docente: </span>
                  <span className="text-ink">{p.motivo_rechazo}</span>
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {visibles.length === 0 && (
        <p className="mt-6 rounded-tile bg-unimayor-tint p-6 text-center text-sm text-muted">No hay proyectos en este estado.</p>
      )}

      <Modal
        abierto={editando !== null}
        onCerrar={() => !ocupado && setEditando(null)}
        titulo="Ajustar y reenviar"
        descripcion="Corrige lo que pidió el docente y vuelve a enviarlo a revisión."
      >
        {editando && (
          <form onSubmit={guardarYReenviar} className="space-y-5">
            {editando.motivo_rechazo && (
              <p className="rounded-box bg-error-soft px-4 py-3 text-sm">
                <span className="font-bold text-error">Motivo: </span>
                {editando.motivo_rechazo}
              </p>
            )}
            <Campo etiqueta="Título" name="titulo" defaultValue={editando.titulo} required maxLength={100} />
            <CampoArea etiqueta="Descripción" name="descripcion" defaultValue={editando.descripcion} required maxLength={5000} rows={7} />
            <CampoArea
              etiqueta="Imágenes (una URL por línea)"
              name="fotos"
              opcional
              defaultValue={editando.fotos.join("\n")}
              rows={3}
              ayuda="Hasta 10 imágenes."
            />
            <div className="flex justify-end gap-3">
              <BtnMayor variante="ghost" onClick={() => setEditando(null)} disabled={ocupado}>
                Cancelar
              </BtnMayor>
              <BtnMayor type="submit" icono={SendIcon} cargando={ocupado}>
                Guardar y reenviar
              </BtnMayor>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        abierto={eliminando !== null}
        onCerrar={() => !ocupado && setEliminando(null)}
        titulo="¿Eliminar este proyecto?"
        descripcion="Esta acción no se puede deshacer."
        ancho="max-w-md"
      >
        <p className="text-sm text-ink">
          Vas a eliminar <strong>{eliminando?.titulo}</strong>.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <BtnMayor variante="ghost" onClick={() => setEliminando(null)} disabled={ocupado}>
            Cancelar
          </BtnMayor>
          <BtnMayor variante="danger" onClick={confirmarEliminar} cargando={ocupado}>
            Sí, eliminar
          </BtnMayor>
        </div>
      </Modal>

      <p className="mt-6 text-center text-xs text-muted">
        ¿Dudas sobre el aval? Revisa{" "}
        <Link href="/notificaciones" className="font-bold text-unimayor-700 underline-offset-4 hover:underline">
          tus notificaciones
        </Link>
        .
      </p>
    </div>
  );
}
