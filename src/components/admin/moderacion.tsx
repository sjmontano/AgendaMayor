"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPatch, apiPost } from "@/lib/api";
import { LoadingButton } from "@/components/ui/skeleton";

/**
 * Acciones de moderación — Vista (capa de Presentación).
 * Ejecuta transiciones del State vía PATCH /api/proyectos/[id].
 */
export function AccionesModeracion({ id }: { id: number }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar(payload: Record<string, unknown>) {
    setError(null);
    setCargando(true);
    try {
      await apiPatch(`/api/proyectos/${id}`, payload);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={cargando}
          onClick={() => ejecutar({ accion: "publicar" })}
          className="border-2 border-[#16A34A] bg-[#16A34A] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#16A34A] disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={cargando}
          onClick={() => {
            if (!motivo.trim()) {
              setError("Indica el motivo de rechazo");
              return;
            }
            ejecutar({ accion: "rechazar", motivoRechazo: motivo });
          }}
          className="border-2 border-[#DC2626] bg-[#DC2626] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#DC2626] disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
      <input
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo de rechazo (obligatorio para rechazar)"
        maxLength={500}
        className="w-full border-2 border-[#E4E4E7] px-3 py-2 text-sm rounded-[10px] outline-none focus:border-[#004884] placeholder:text-zinc-400"
        aria-label="Motivo de rechazo"
      />
      {error && <p role="alert" className="text-sm font-semibold text-[#DC2626]">{error}</p>}
      {cargando && <LoadingButton label="Procesando" />}
    </div>
  );
}

/**
 * Botón importar eventos del portal — Vista.
 */
export function BotonImportar() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  async function importar() {
    setCargando(true);
    setResultado(null);
    try {
      const r = await apiPost<{ total: number; creados: number; omitidos: number }>(
        "/api/admin/importar-eventos",
        {}
      );
      setResultado(`RSS: ${r.total} leídos · ${r.creados} creados · ${r.omitidos} omitidos`);
      router.refresh();
    } catch (e) {
      setResultado(e instanceof Error ? e.message : "Error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={cargando}
        onClick={importar}
        className="border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884] disabled:opacity-50"
      >
        {cargando ? "Importando…" : "Importar eventos UNIMAYOR"}
      </button>
      {resultado && <p className="mt-2 text-sm font-semibold">{resultado}</p>}
    </div>
  );
}
