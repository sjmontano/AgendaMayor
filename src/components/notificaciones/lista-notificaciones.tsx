"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";
import { formatearFechaHora } from "@/lib/formato";

interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  proyecto_id: number | null;
}

export function ListaNotificaciones({ notificaciones }: { notificaciones: Notificacion[] }) {
  const router = useRouter();
  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  async function marcar(datos: { id: number } | { todas: true }) {
    await llamarApi("/api/notificaciones", "PATCH", datos);
    router.refresh(); // vuelve a leer la página (y el contador del menú)
  }

  if (notificaciones.length === 0) {
    return <p className="vacio">No tienes notificaciones.</p>;
  }

  return (
    <>
      {hayNoLeidas && (
        <div className="acciones" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-borde btn-pequeno" onClick={() => marcar({ todas: true })}>
            Marcar todas como leídas
          </button>
        </div>
      )}
      <ul className="lista">
        {notificaciones.map((n) => (
          <li key={n.id_notificacion} className={n.leida ? "" : "no-leida"}>
            <div style={{ flex: 1 }}>
              {n.proyecto_id ? <Link href={`/proyectos/${n.proyecto_id}`}>{n.mensaje}</Link> : n.mensaje}
              <span className="fecha">{formatearFechaHora(n.fecha)}</span>
            </div>
            {!n.leida && (
              <button className="btn btn-borde btn-pequeno" onClick={() => marcar({ id: n.id_notificacion })}>
                Leída
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
