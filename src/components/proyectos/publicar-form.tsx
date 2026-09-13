"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { FACULTADES } from "@/lib/facultades";
import { LoadingButton } from "@/components/ui/skeleton";

/**
 * Formulario publicar proyecto — Vista (capa de Presentación).
 * POST /api/proyectos → el Service lo deja en EN_REVISION (HU-06).
 */
export function PublicarForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState("COMUNIDAD");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const fd = new FormData(e.currentTarget);
      const fotos = String(fd.get("fotos") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: Record<string, unknown> = {
        titulo: String(fd.get("titulo")),
        descripcion: String(fd.get("descripcion")),
        facultad: String(fd.get("facultad")),
        programa: String(fd.get("programa")),
        tipo,
        fotos,
      };
      if (tipo === "EAFI") {
        const origen = Number(fd.get("eventoOrigenId"));
        if (!origen) throw new Error("Los proyectos EAFI exigen evento origen");
        payload.eventoOrigenId = origen;
      }
      const r = await apiPost<{ id_proyecto: number }>("/api/proyectos", payload);
      router.push(`/proyectos/${r.id_proyecto}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setCargando(false);
    }
  }

  const inputCls =
    "w-full border-2 border-[#E4E4E7] bg-white px-4 py-3 text-sm rounded-[10px] outline-none focus:border-[#004884] focus:shadow-[3px_3px_0_#004884] placeholder:text-zinc-400";
  const labelCls = "flex flex-col gap-1 text-xs font-bold tracking-widest uppercase";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className={labelCls}>
        Título (máx 100)
        <input name="titulo" required maxLength={100} className={inputCls} />
      </label>
      <label className={labelCls}>
        Descripción
        <textarea name="descripcion" required rows={5} maxLength={5000} className={inputCls} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Facultad
          <select name="facultad" required className={inputCls} defaultValue="">
            <option value="">Seleccionar…</option>
            {FACULTADES.map((f) => (
              <option key={f.slug} value={f.nombre}>{f.nombre}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Programa <input name="programa" required maxLength={100} className={inputCls} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
            <option value="COMUNIDAD">Comunidad</option>
            <option value="EAFI">EAFI</option>
            <option value="INSTITUCIONAL">Institucional</option>
          </select>
        </label>
        {tipo === "EAFI" && (
          <label className={labelCls}>
            ID evento origen
            <input name="eventoOrigenId" type="number" min={1} required className={inputCls} />
          </label>
        )}
      </div>
      <label className={labelCls}>
        Fotos (URLs separadas por coma, máx 10)
        <input name="fotos" placeholder="https://…" className={inputCls} />
      </label>
      {error && (
        <p role="alert" className="rounded-[10px] border-2 border-[#DC2626] bg-red-50 p-3 text-sm font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      {cargando ? (
        <LoadingButton label="Publicando" />
      ) : (
        <button type="submit" className="w-full border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]">
          Enviar a revisión
        </button>
      )}
    </form>
  );
}
