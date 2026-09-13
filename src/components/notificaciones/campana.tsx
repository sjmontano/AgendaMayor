"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

/**
 * Campana de notificaciones — Vista (capa de Presentación).
 * Lee GET /api/notificaciones; marcar leída vía PATCH (HU-10).
 */
interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  proyecto_id: number | null;
}

export function Campana() {
  const [items, setItems] = useState<Notificacion[]>([]);
  const [abierta, setAbierta] = useState(false);

  async function cargar() {
    try {
      setItems(await apiGet<Notificacion[]>("/api/notificaciones"));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const sinLeer = items.filter((i) => !i.leida).length;

  async function marcar(id: number) {
    await apiPatch("/api/notificaciones", { id }).catch(() => null);
    setItems((prev) => prev.map((i) => (i.id_notificacion === id ? { ...i, leida: true } : i)));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        aria-label={`Notificaciones${sinLeer > 0 ? `, ${sinLeer} sin leer` : ""}`}
        className="relative border-2 border-[#E4E4E7] px-3 py-2 text-sm font-bold"
      >
        🔔
        {sinLeer > 0 && (
          <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
            {sinLeer}
          </span>
        )}
      </button>
      {abierta && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-[10px] border-2 border-[#E4E4E7] bg-white p-3 shadow-[4px_4px_0_#004884]">
          {items.length === 0 ? (
            <p className="p-2 text-sm text-zinc-500">Sin notificaciones.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((n) => (
                <li
                  key={n.id_notificacion}
                  className={`rounded-[10px] border p-3 text-sm ${n.leida ? "border-[#E4E4E7] bg-white" : "border-[#004884] bg-[#f8fbfd]"}`}
                >
                  <p>{n.mensaje}</p>
                  <div className="mt-1 flex items-center gap-3">
                    {n.proyecto_id && (
                      <Link href={`/proyectos/${n.proyecto_id}`} className="font-bold text-[#195a90] underline-offset-4 hover:underline">
                        Ver proyecto
                      </Link>
                    )}
                    {!n.leida && (
                      <button type="button" onClick={() => marcar(n.id_notificacion)} className="font-bold text-[#004884] underline-offset-4 hover:underline">
                        Marcar leída
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
