"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";

interface Proyecto {
  id_proyecto: number;
  titulo: string;
  programa: string;
  autor?: { nombre: string; apellido: string } | null;
}

/** Cola de revisión: el docente publica o rechaza (con motivo) cada proyecto (HU-12, HU-13). */
export function Moderacion({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function decidir(id: number, accion: "publicar" | "rechazar") {
    let motivoRechazo: string | undefined;
    if (accion === "rechazar") {
      motivoRechazo = prompt("¿Por qué se rechaza? El estudiante verá este motivo.") ?? undefined;
      if (!motivoRechazo) return;
    }
    setError("");
    try {
      await llamarApi(`/api/proyectos/${id}`, "PATCH", { accion, motivoRechazo });
      setMensaje(accion === "publicar" ? "Proyecto publicado." : "Proyecto rechazado.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (proyectos.length === 0) {
    return <p className="vacio">No hay proyectos pendientes de revisión.</p>;
  }

  return (
    <div className="caja">
      {mensaje && <p className="alerta alerta--exito">{mensaje}</p>}
      {error && <p className="alerta alerta--error">{error}</p>}
      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Autor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => (
              <tr key={p.id_proyecto}>
                <td>
                  <Link href={`/proyectos/${p.id_proyecto}`}>{p.titulo}</Link>
                  <br />
                  <small className="subtitulo">{p.programa}</small>
                </td>
                <td>{p.autor ? `${p.autor.nombre} ${p.autor.apellido}` : "—"}</td>
                <td>
                  <div className="acciones">
                    <button className="btn btn-primario btn-pequeno" onClick={() => decidir(p.id_proyecto, "publicar")}>
                      Publicar
                    </button>
                    <button className="btn btn-peligro btn-pequeno" onClick={() => decidir(p.id_proyecto, "rechazar")}>
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
