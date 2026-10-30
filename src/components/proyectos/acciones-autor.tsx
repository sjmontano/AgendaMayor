"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";

/** Botones que ve el autor en el detalle de su proyecto. */
export function AccionesAutor({ idProyecto, estado }: { idProyecto: number; estado: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function ejecutar(accion: "reenviar" | "eliminar") {
    if (accion === "eliminar" && !confirm("¿Seguro que quieres eliminar este proyecto?")) return;
    setCargando(true);
    setError("");
    try {
      await llamarApi(`/api/proyectos/${idProyecto}`, "PATCH", { accion });
      router.push(accion === "eliminar" ? "/panel" : `/proyectos/${idProyecto}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {error && <p className="alerta alerta--error">{error}</p>}
      <div className="acciones">
        {estado === "RECHAZADO" && (
          <button className="btn btn-primario" disabled={cargando} onClick={() => ejecutar("reenviar")}>
            Enviar de nuevo a revisión
          </button>
        )}
        {estado !== "PUBLICADO" && (
          <button className="btn btn-peligro" disabled={cargando} onClick={() => ejecutar("eliminar")}>
            Eliminar proyecto
          </button>
        )}
      </div>
    </div>
  );
}
