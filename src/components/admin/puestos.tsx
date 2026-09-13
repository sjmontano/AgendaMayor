"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

/**
 * Gestión de puestos — Vista (capa de Presentación).
 * Crear, asignar proyecto y liberar (solo ADMIN, HU-11).
 */
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
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [asignar, setAsignar] = useState<Record<number, string>>({});

  async function cargar() {
    try {
      setPuestos(await apiGet<Puesto[]>("/api/puestos"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await apiPost("/api/puestos", {
        codigo: String(fd.get("codigo")),
        edificio: String(fd.get("edificio")),
        piso: Number(fd.get("piso")),
        salon: String(fd.get("salon")),
        ubicacion: String(fd.get("ubicacion")),
        eventoId: Number(fd.get("eventoId")),
      });
      e.currentTarget.reset();
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    }
  }

  async function accion(id: number, payload: Record<string, unknown>) {
    setError(null);
    try {
      await apiPatch(`/api/puestos/${id}`, payload);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  const inputCls =
    "border-2 border-[#E4E4E7] px-3 py-2 text-sm rounded-[10px] outline-none focus:border-[#004884] placeholder:text-zinc-400";

  return (
    <div>
      <form onSubmit={crear} className="flex flex-wrap items-end gap-2">
        <input name="codigo" required placeholder="Código (MESA-04)" className={inputCls} aria-label="Código" />
        <input name="edificio" required placeholder="Edificio" className={inputCls} aria-label="Edificio" />
        <input name="piso" type="number" required min={0} max={10} placeholder="Piso" className={`${inputCls} w-20`} aria-label="Piso" />
        <input name="salon" required placeholder="Salón" className={inputCls} aria-label="Salón" />
        <input name="ubicacion" required placeholder="Ubicación" className={inputCls} aria-label="Ubicación" />
        <input name="eventoId" type="number" required min={1} placeholder="ID evento" className={`${inputCls} w-24`} aria-label="ID del evento" />
        <button type="submit" className="border-2 border-[#004884] bg-[#004884] px-4 py-2 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#004884]">
          Crear
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-[#DC2626]">{error}</p>}
      <ul className="mt-4 space-y-2">
        {puestos.map((p) => (
          <li key={p.id_puesto} className="flex flex-wrap items-center gap-3 rounded-[10px] border-2 border-[#E4E4E7] bg-white p-3 text-sm">
            <strong>{p.codigo}</strong>
            <span>{p.edificio} · piso {p.piso}{p.salon ? ` · ${p.salon}` : ""}</span>
            <span className="font-bold">{p.estado}</span>
            {p.proyecto_id && <span>→ proyecto #{p.proyecto_id}</span>}
            {p.estado !== "OCUPADO" ? (
              <span className="flex items-center gap-2">
                <input
                  value={asignar[p.id_puesto] ?? ""}
                  onChange={(e) => setAsignar((s) => ({ ...s, [p.id_puesto]: e.target.value }))}
                  placeholder="ID proyecto"
                  className={`${inputCls} w-28`}
                  aria-label={`ID de proyecto para ${p.codigo}`}
                />
                <button type="button" onClick={() => accion(p.id_puesto, { accion: "asignar", proyectoId: Number(asignar[p.id_puesto]) })} className="font-bold text-[#004884] underline-offset-4 hover:underline">
                  Asignar
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => accion(p.id_puesto, { accion: "liberar" })} className="font-bold text-[#DC2626] underline-offset-4 hover:underline">
                Liberar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
