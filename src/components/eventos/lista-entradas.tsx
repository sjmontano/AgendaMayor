"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { llamarApi } from "@/lib/api";
import { formatearFechaHora } from "@/lib/formato";

/** Respuesta de GET /api/mis-entradas. */
interface Entrada {
  codigo: string;
  estado: string;
  nombre_tipo: string;
  evento: { id_evento: number; titulo: string; fecha_inicio: string; lugar: string };
}

/** Entradas del usuario, pedidas a GET /api/mis-entradas. */
export function ListaEntradas() {
  const [entradas, setEntradas] = useState<Entrada[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    llamarApi<Entrada[]>("/api/mis-entradas")
      .then(setEntradas)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="alerta alerta--error">{error}</p>;
  if (!entradas) return <p className="vacio">Cargando tus entradas…</p>;
  if (entradas.length === 0) {
    return (
      <p className="vacio">
        Todavía no tienes entradas. <Link href="/eventos">Explora la cartelera</Link>.
      </p>
    );
  }

  return (
    <>
      {entradas.map((entrada) => (
        <article key={entrada.codigo} className="ticket">
          <div className="ticket-info">
            <Etiqueta valor={entrada.estado} />
            <h3 style={{ marginTop: "0.5rem" }}>
              <Link href={`/eventos/${entrada.evento.id_evento}`}>{entrada.evento.titulo}</Link>
            </h3>
            <p className="subtitulo">
              {entrada.nombre_tipo} · {formatearFechaHora(entrada.evento.fecha_inicio)} · {entrada.evento.lugar}
            </p>
          </div>
          <div className="ticket-codigo">
            <small>Código</small>
            <code>{entrada.codigo}</code>
          </div>
        </article>
      ))}
    </>
  );
}
