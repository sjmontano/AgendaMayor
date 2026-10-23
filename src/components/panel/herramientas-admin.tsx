"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { PlusIcon } from "@/components/icons/plus";
import { MapPinIcon } from "@/components/icons/map-pin";
import { BtnMayor } from "@/components/ui/botones";
import { Campo } from "@/components/ui/campo";
import { SkeletonLista } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Herramientas de administración: importación del RSS de UNIMAYOR (HU-13)
 * y gestión de puestos EAFI (crear, asignar proyecto, liberar).
 */
export function ImportarRss() {
  const router = useRouter();
  const toast = useToast();
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ total: number; creados: number; omitidos: number } | null>(null);

  async function importar() {
    setCargando(true);
    try {
      const r = await apiPost<{ total: number; creados: number; omitidos: number }>("/api/admin/importar-eventos", {});
      setResultado(r);
      toast.exito("Importación completa", `${r.creados} eventos nuevos desde el portal.`);
      router.refresh();
    } catch (e) {
      toast.error("No se pudo importar", e instanceof Error ? e.message : undefined);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-sm text-white/80">
        Trae los eventos publicados en unimayor.edu.co a la cartelera. Es idempotente: no duplica títulos.
      </p>
      <AnimatePresence>
        {resultado && (
          <motion.dl
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-3 gap-2 text-center"
          >
            {[
              ["Leídos", resultado.total],
              ["Nuevos", resultado.creados],
              ["Omitidos", resultado.omitidos],
            ].map(([k, v]) => (
              <div key={k} className="rounded-box bg-white/10 py-2">
                <dt className="text-[11px] text-white/70">{k}</dt>
                <dd className="text-xl font-black tabular-nums">{v}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </AnimatePresence>
      <div className="mt-auto pt-5">
        <BtnMayor variante="onDark" icono={RefreshCWIcon} iconoPos="inicio" cargando={cargando} onClick={importar} anchoCompleto>
          {cargando ? "Importando…" : "Importar eventos del portal"}
        </BtnMayor>
      </div>
    </div>
  );
}

interface Puesto {
  id_puesto: number;
  codigo: string;
  edificio: string;
  piso: number;
  salon: string;
  ubicacion: string;
  estado: string;
  evento_id: number;
  proyecto_id: number | null;
}

export function GestionPuestos() {
  const toast = useToast();
  const [puestos, setPuestos] = useState<Puesto[] | null>(null);
  const [asignar, setAsignar] = useState<Record<number, string>>({});
  const [creando, setCreando] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);

  async function recargar() {
    try {
      setPuestos(await apiGet<Puesto[]>("/api/puestos"));
    } catch {
      setPuestos([]);
    }
  }

  useEffect(() => {
    let vivo = true;
    apiGet<Puesto[]>("/api/puestos")
      .then((d) => vivo && setPuestos(d))
      .catch(() => vivo && setPuestos([]));
    return () => {
      vivo = false;
    };
  }, []);

  async function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setCreando(true);
    try {
      await apiPost("/api/puestos", {
        codigo: String(fd.get("codigo")),
        edificio: String(fd.get("edificio")),
        piso: Number(fd.get("piso")),
        salon: String(fd.get("salon")),
        ubicacion: String(fd.get("ubicacion")),
        eventoId: Number(fd.get("eventoId")),
      });
      form.reset();
      toast.exito("Puesto creado");
      setFormAbierto(false);
      void recargar();
    } catch (err) {
      toast.error("No se pudo crear el puesto", err instanceof Error ? err.message : undefined);
    } finally {
      setCreando(false);
    }
  }

  async function accion(id: number, payload: Record<string, unknown>, ok: string) {
    try {
      await apiPatch(`/api/puestos/${id}`, payload);
      toast.exito(ok);
      void recargar();
    } catch (err) {
      toast.error("No se pudo completar", err instanceof Error ? err.message : undefined);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{puestos ? `${puestos.length} puestos registrados` : "Cargando puestos…"}</p>
        <BtnMayor tamano="sm" variante={formAbierto ? "ghost" : "primary"} icono={PlusIcon} iconoPos="inicio" onClick={() => setFormAbierto((v) => !v)} aria-expanded={formAbierto}>
          {formAbierto ? "Cerrar" : "Nuevo puesto"}
        </BtnMayor>
      </div>

      <AnimatePresence initial={false}>
        {formAbierto && (
          <motion.form
            onSubmit={crear}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 rounded-box bg-unimayor-tint p-4 sm:grid-cols-3">
              <Campo etiqueta="Código" name="codigo" required placeholder="MESA-04" />
              <Campo etiqueta="Edificio" name="edificio" required placeholder="Claustro Encarnación" />
              <Campo etiqueta="Piso" name="piso" type="number" required min={0} max={10} />
              <Campo etiqueta="Salón" name="salon" required />
              <Campo etiqueta="Ubicación" name="ubicacion" required placeholder="Junto a la escalera" />
              <Campo etiqueta="ID del evento" name="eventoId" type="number" required min={1} />
              <div className="sm:col-span-3">
                <BtnMayor type="submit" cargando={creando}>
                  Crear puesto
                </BtnMayor>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-4">
        {puestos === null ? (
          <SkeletonLista filas={3} />
        ) : puestos.length === 0 ? (
          <p className="rounded-box bg-unimayor-tint p-5 text-center text-sm text-muted">Aún no hay puestos para ferias EAFI.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {puestos.map((p) => (
              <li key={p.id_puesto} className="rounded-box border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-ink">{p.codigo}</p>
                    <div className="flex items-center gap-1 text-[13px] text-muted">
                      <MapPinIcon size={14} aria-hidden="true" />
                      {p.edificio} · piso {p.piso}
                      {p.salon ? ` · ${p.salon}` : ""}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase",
                      p.estado === "OCUPADO" ? "bg-warning-soft text-warning" : "bg-success-soft text-success"
                    )}
                  >
                    {p.estado === "OCUPADO" ? "Ocupado" : "Disponible"}
                  </span>
                </div>
                {p.estado === "OCUPADO" ? (
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <span className="text-muted">Proyecto #{p.proyecto_id}</span>
                    <button
                      type="button"
                      onClick={() => accion(p.id_puesto, { accion: "liberar" }, "Puesto liberado")}
                      className="font-bold text-error underline-offset-4 hover:underline"
                    >
                      Liberar
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <label className="sr-only" htmlFor={`asignar-${p.id_puesto}`}>
                      ID de proyecto para {p.codigo}
                    </label>
                    <input
                      id={`asignar-${p.id_puesto}`}
                      inputMode="numeric"
                      value={asignar[p.id_puesto] ?? ""}
                      onChange={(e) => setAsignar((s) => ({ ...s, [p.id_puesto]: e.target.value.replace(/\D/g, "") }))}
                      placeholder="ID de proyecto"
                      className={cn(input.base, "h-9 py-1.5")}
                    />
                    <BtnMayor
                      tamano="sm"
                      variante="secondary"
                      disabled={!asignar[p.id_puesto]}
                      onClick={() =>
                        accion(p.id_puesto, { accion: "asignar", proyectoId: Number(asignar[p.id_puesto]) }, "Proyecto asignado")
                      }
                    >
                      Asignar
                    </BtnMayor>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
