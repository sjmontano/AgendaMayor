"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { llamarApi } from "@/lib/api";
import { formatearPrecio } from "@/lib/formato";

/** Respuesta de GET /api/ordenes/[codigo]. */
interface Orden {
  codigo: string;
  estado: string;
  total: number;
  evento: { id_evento: number; titulo: string };
  items: { nombre: string; cantidad: number; subtotal: number }[];
  entradas: { codigo: string; nombre_tipo: string }[];
}

const MENSAJES: Record<string, { clase: string; texto: string }> = {
  PAGADA: { clase: "alerta--exito", texto: "¡Pago aprobado! Tus entradas ya están listas." },
  PENDIENTE: { clase: "alerta--info", texto: "Esperando el pago en Bold. Cuando termines, vuelve a esta pestaña." },
  RECHAZADA: { clase: "alerta--error", texto: "El pago fue rechazado. Puedes intentarlo de nuevo." },
  EXPIRADA: { clase: "alerta--error", texto: "El tiempo para pagar terminó. Puedes hacer una nueva compra." },
};

/**
 * Estado de una orden. Consulta GET /api/ordenes/[codigo] (que a su vez pregunta a Bold):
 * al abrir la página, al volver a esta pestaña desde Bold y con el botón "Verificar pago".
 */
export function EstadoOrden({ codigo }: { codigo: string }) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const consultar = useCallback(async () => {
    setCargando(true);
    try {
      setOrden(await llamarApi<Orden>(`/api/ordenes/${codigo}`));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
    setCargando(false);
  }, [codigo]);

  useEffect(() => {
    consultar();
    // Cuando el comprador vuelve de la pestaña de Bold, se revisa el pago otra vez
    window.addEventListener("focus", consultar);
    return () => window.removeEventListener("focus", consultar);
  }, [consultar]);

  if (error) return <p className="alerta alerta--error">{error}</p>;
  if (!orden) return <p className="vacio">Consultando la orden…</p>;

  const mensaje = MENSAJES[orden.estado] ?? MENSAJES.PENDIENTE;

  return (
    <div className="caja">
      <span className="etiqueta-superior">Orden {orden.codigo}</span>
      <h1>{orden.evento.titulo}</h1>
      <p className={`alerta ${mensaje.clase}`}>{mensaje.texto}</p>

      <table>
        <thead>
          <tr>
            <th>Entrada</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orden.items.map((item) => (
            <tr key={item.nombre}>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td>{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <span>Total</span>
        <span>{formatearPrecio(orden.total)}</span>
      </div>
      <p>
        Estado: <Etiqueta valor={orden.estado} />
      </p>

      <div className="acciones">
        {orden.estado === "PAGADA" && (
          <Link href="/mis-entradas" className="btn btn-primario">
            Ver mis entradas
          </Link>
        )}
        {orden.estado === "PENDIENTE" && (
          <button className="btn btn-primario" onClick={consultar} disabled={cargando}>
            {cargando ? "Verificando…" : "Verificar pago"}
          </button>
        )}
        <Link href={`/eventos/${orden.evento.id_evento}`} className="btn btn-borde">
          Volver al evento
        </Link>
      </div>
    </div>
  );
}
