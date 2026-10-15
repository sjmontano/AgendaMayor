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
  const [exitoId, setExitoId] = useState<number | null>(null);

  const programasDisponibles =
    FACULTADES.find((f) => f.nombre === facultad)?.slug != null
      ? facultadProgramas[FACULTADES.find((f) => f.nombre === facultad)!.slug]
      : [];

  function onFacultadChange(valor: string) {
    setFacultad(valor);
    // Al cambiar de facultad se limpia el programa para forzar elección explícita
    setPrograma("");
  }

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
      if (fotos.length > 10) throw new Error("Máximo 10 imágenes");
      for (const f of fotos) {
        try {
          new URL(f);
        } catch {
          throw new Error(`URL de imagen no válida: ${f}`);
        }
      }
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
      // El proyecto queda en EN_REVISION: no redirigir al detalle
      // (solo muestra PUBLICADO y daría 404). Mostrar confirmación.
      setExitoId(r.id_proyecto);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setCargando(false);
    }
  }

  const inputCls =
    "w-full border-2 border-[#E4E4E7] bg-white px-4 py-3 text-sm rounded-[10px] outline-none focus:border-[#004884] focus:shadow-[3px_3px_0_#004884] placeholder:text-zinc-400";
  const labelCls = "flex flex-col gap-1 text-xs font-bold tracking-widest uppercase";

  if (exitoId !== null) {
    return (
      <div
        role="status"
        className="rounded-[10px] border-2 border-[#16a34a] bg-green-50 p-6 text-center"
      >
        <p className="text-lg font-extrabold text-[#004884]">
          ¡Proyecto enviado a revisión!
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Tu proyecto #{exitoId} quedó en revisión hasta que un docente de tu
          facultad lo avale. Te avisaremos en la campana con el resultado.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/proyectos")}
            className="border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]"
          >
            Volver a la vitrina
          </button>
          <button
            type="button"
            onClick={() => {
              setExitoId(null);
              setFacultad("");
              setPrograma("");
              setTipo("COMUNIDAD");
            }}
            className="border-2 border-[#004884] bg-white px-6 py-3 text-xs font-bold tracking-widest text-[#004884] uppercase hover:bg-[#f8fbfd]"
          >
            Publicar otro
          </button>
        </div>
      </div>
    );
  }

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
      <label className={labelCls}>
        Imágenes (URLs, opcional)
        <input
          name="fotos"
          type="text"
          inputMode="url"
          placeholder="https://ejemplo.com/foto.jpg, https://…"
          className={inputCls}
          aria-describedby="fotos-ayuda"
        />
      </label>
      <p id="fotos-ayuda" className="text-xs text-zinc-500">
        Hasta 10 direcciones de imagen separadas por comas. Se muestran en el detalle del proyecto.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Facultad
          <select
            name="facultad"
            required
            className={inputCls}
            value={facultad}
            onChange={(e) => onFacultadChange(e.target.value)}
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
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
            disabled={programasDisponibles.length === 0}
          >
            <option value="">
              {facultad ? "Seleccionar…" : "Primero elige una facultad…"}
            </option>
            {programasDisponibles.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
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