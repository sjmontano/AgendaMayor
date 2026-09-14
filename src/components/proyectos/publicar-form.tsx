"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { FACULTADES, facultadProgramas } from "@/lib/facultades";
import { LoadingButton } from "@/components/ui/skeleton";

/**
 * Formulario publicar proyecto — Vista (capa de Presentación).
 * POST /api/proyectos → el Service lo deja en EN_REVISION (HU-06).
 * Facultad → Programa: el select de programas se actualiza automáticamente
 * al cambiar de facultad (dependencia cliente).
 */
export function PublicarForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState("COMUNIDAD");
  const [facultad, setFacultad] = useState("");
  const [programa, setPrograma] = useState("");

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
        facultad: facultad || String(fd.get("facultad")),
        programa: programa || String(fd.get("programa")),
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
          <select
            name="facultad"
            required
            className={inputCls}
            defaultValue={facultad}
            onChange={(e) => {
              setFacultad(e.target.value);
              // setear programa por defecto de la facultad elegida
              const opciones = facultadProgramas[e.target.value as keyof typeof facultadProgramas];
              if (opciones && opciones.length > 0) {
                setPrograma(opciones[0]);
              } else {
                setPrograma("");
              }
            }}
          >
            <option value="">Seleccionar…</option>
            {FACULTADES.map((f) => (
              <option key={f.slug} value={f.nombre}>{f.nombre}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Programa
          <select
            name="programa"
            required
            className={inputCls}
            defaultValue={programa}
          >
            <option value="">Seleccionar…</option>
            {facultadProgramas[facultad as keyof typeof facultadProgramas]?.map((p) => (
              <option key={p} value={p}>{p}</option>
            )) || []}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          <input
            name="consentimiento"
            type="checkbox"
            className="mt-1 size-4 accent-[#004884]"
          />
          Acepto el tratamiento de mis datos personales (Ley 1581/2012).
        </label>
      </div>
      {error && (
        <p role="alert" className="rounded-[10x] border-2 border-[#DC2626] bg-red-50 p-3 text-sm font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      {cargando ? (
        <LoadingButton label="Publicando proyecto" />
      ) : (
        <button type="submit" className="w-full border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]">
          Publicar proyecto
        </button>
      )}
    </form>
  );
}