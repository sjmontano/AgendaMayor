"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";

/** Botón del administrador para traer los eventos del portal UNIMAYOR (RSS). */
export function ImportarEventos() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);

  async function importar() {
    setCargando(true);
    try {
      const r = await llamarApi<{ creados: number; omitidos: number }>("/api/admin/importar-eventos", "POST");
      setTexto(`${r.creados} importados, ${r.omitidos} ya existían`);
      router.refresh();
    } catch (e) {
      setTexto((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="acciones">
      {texto && <small className="subtitulo">{texto}</small>}
      <button className="btn btn-borde btn-pequeno" onClick={importar} disabled={cargando}>
        {cargando ? "Importando…" : "Importar eventos del portal"}
      </button>
    </div>
  );
}
