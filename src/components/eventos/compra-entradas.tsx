"use client";

import { useState } from "react";
import { llamarApi } from "@/lib/api";
import { formatearPrecio } from "@/lib/formato";

interface TipoEntrada {
  id_tipo_entrada: number;
  nombre: string;
  precio: number;
  disponibles: number;
}

interface Props {
  eventoId: number;
  maxPorCompra: number;
  tipos: TipoEntrada[];
}

/**
 * Carrito de entradas: el usuario elige cuántas quiere de cada tipo.
 * Al confirmar, la API crea la orden y devuelve el link de pago de Bold.
 */
export function CompraEntradas({ eventoId, maxPorCompra, tipos }: Props) {
  // cantidades[idTipo] = cantidad elegida
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const totalEntradas = Object.values(cantidades).reduce((suma, c) => suma + c, 0);
  const totalPesos = tipos.reduce((suma, t) => suma + t.precio * (cantidades[t.id_tipo_entrada] ?? 0), 0);

  function cambiarCantidad(idTipo: number, valor: number) {
    setCantidades({ ...cantidades, [idTipo]: Math.max(0, valor) });
  }

  async function comprar() {
    setCargando(true);
    setError("");
    try {
      const items = tipos
        .filter((t) => (cantidades[t.id_tipo_entrada] ?? 0) > 0)
        .map((t) => ({ tipoEntradaId: t.id_tipo_entrada, cantidad: cantidades[t.id_tipo_entrada] }));

      const { urlPago } = await llamarApi<{ urlPago: string }>("/api/checkout", "POST", { eventoId, items });
      window.location.href = urlPago; // vamos a la página de pago de Bold
    } catch (e) {
      setError((e as Error).message);
      setCargando(false);
    }
  }

  return (
    <div>
      {error && <p className="alerta alerta--error">{error}</p>}

      {tipos.map((t) => (
        <div key={t.id_tipo_entrada} className="tipo-entrada">
          <div>
            <strong>{t.nombre}</strong>
            <div className="precio">{formatearPrecio(t.precio)}</div>
            <small className="subtitulo">
              {t.disponibles > 0 ? `${t.disponibles} disponibles` : "Agotado"}
            </small>
          </div>
          <input
            type="number"
            min={0}
            max={Math.min(t.disponibles, maxPorCompra)}
            value={cantidades[t.id_tipo_entrada] ?? 0}
            disabled={t.disponibles === 0}
            onChange={(e) => cambiarCantidad(t.id_tipo_entrada, Number(e.target.value))}
            aria-label={`Cantidad de ${t.nombre}`}
          />
        </div>
      ))}

      <div className="total">
        <span>Total</span>
        <span>{totalEntradas === 0 ? "$ 0" : formatearPrecio(totalPesos)}</span>
      </div>

      {totalEntradas > maxPorCompra && (
        <p className="alerta alerta--info">Máximo {maxPorCompra} entradas por compra.</p>
      )}

      <button
        className="btn btn-dorado btn-bloque"
        onClick={comprar}
        disabled={cargando || totalEntradas === 0 || totalEntradas > maxPorCompra}
      >
        {cargando
          ? "Procesando…"
          : totalEntradas > 0 && totalPesos === 0
            ? "Reservar entradas gratis"
            : "Pagar con Bold"}
      </button>
      <p className="subtitulo" style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>
        El pago se hace en la página segura de Bold (tarjeta, PSE, Nequi o Bancolombia).
      </p>
    </div>
  );
}
