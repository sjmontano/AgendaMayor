"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FACULTADES } from "@/lib/facultades";

/**
 * Filtros de la vitrina — Vista (capa de Presentación).
 * Client Component: escribe los filtros en el query string (URL compartible, HU-07).
 */
export function Filtros({
  inicial,
}: {
  inicial: { facultad?: string; tipo?: string; q?: string };
}) {
  const router = useRouter();
  const [facultad, setFacultad] = useState(inicial.facultad ?? "");
  const [tipo, setTipo] = useState(inicial.tipo ?? "");
  const [q, setQ] = useState(inicial.q ?? "");

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (facultad) params.set("facultad", facultad);
    if (tipo) params.set("tipo", tipo);
    if (q) params.set("q", q);
    router.push(`/proyectos?${params.toString()}`);
  }

  function limpiar() {
    setFacultad("");
    setTipo("");
    setQ("");
    router.push("/proyectos");
  }

  const selectCls =
    "border-2 border-[#E4E4E7] bg-white px-3 py-2.5 text-sm font-medium rounded-[10px] outline-none focus:border-[#004884]";

  return (
    <form onSubmit={aplicar} className="flex flex-wrap items-end gap-3" role="search" aria-label="Filtrar proyectos">
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Facultad
        <select value={facultad} onChange={(e) => setFacultad(e.target.value)} className={selectCls}>
          <option value="">Todas</option>
          {FACULTADES.map((f) => (
            <option key={f.slug} value={f.nombre}>
              {f.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          <option value="INSTITUCIONAL">Institucional</option>
          <option value="EAFI">EAFI</option>
          <option value="COMUNIDAD">Comunidad</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Buscar
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Título o palabra clave"
          className={`${selectCls} min-w-52 placeholder:text-zinc-400`}
        />
      </label>
      <button
        type="submit"
        className="border-2 border-[#004884] bg-[#004884] px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#004884]"
      >
        Filtrar
      </button>
      {(inicial.facultad || inicial.tipo || inicial.q) && (
        <button
          type="button"
          onClick={limpiar}
          className="px-4 py-2.5 text-xs font-bold tracking-widest text-[#195a90] uppercase underline-offset-4 hover:underline"
        >
          Limpiar
        </button>
      )}
    </form>
  );
}
