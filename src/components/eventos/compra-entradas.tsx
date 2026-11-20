"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
 *  1. "Comprar entradas" → POST /api/ordenes                (se guarda la orden PENDIENTE)
 *                        → POST /api/ordenes/[codigo]/pago  (Bold entrega el link de pago)
 *  2. "Pagar en Bold"    → abre Bold en otra pestaña y esta pestaña va a /checkout/resultado
 */
export function CompraEntradas({ eventoId, maxPorCompra, tipos }: Props) {
  const router = useRouter();
  // cantidades[idTipo] = cantidad elegida
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [pago, setPago] = useState<{ codigo: string; urlPago: string } | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const totalEntradas = Object.values(cantidades).reduce((suma, c) => suma + c, 0);
  const totalPesos = tipos.reduce((suma, t) => suma + t.precio * (cantidades[t.id_tipo_entrada] ?? 0), 0);

  function cambiarCantidad(idTipo: number, valor: number) {
    setCantidades({ ...cantidades, [idTipo]: Math.max(0, valor) });
  }

  /** Lo que se envía a la API: solo ids y cantidades, nunca precios. */
  function datosCompra() {
    const items = tipos
      .filter((t) => (cantidades[t.id_tipo_entrada] ?? 0) > 0)
      .map((t) => ({ tipoEntradaId: t.id_tipo_entrada, cantidad: cantidades[t.id_tipo_entrada] }));
    return { eventoId, items };
  }

  async function ejecutar(accion: () => Promise<void>) {
    setCargando(true);
    setError("");
    try {
      await accion();
    } catch (e) {
      setError((e as Error).message);
    }
    setCargando(false);
  }

  // Paso 1: se crea la orden y se pide a Bold el link de pago
  const comprar = () =>
    ejecutar(async () => {
      const orden = await llamarApi<{ codigo: string; estado: string }>("/api/ordenes", "POST", datosCompra());
      if (orden.estado === "PAGADA") {
        // Evento gratuito: la orden ya quedó confirmada, no pasa por Bold
        router.push(`/checkout/resultado?orden=${orden.codigo}`);
        return;
      }
      setPago(await llamarApi<{ codigo: string; urlPago: string }>(`/api/ordenes/${orden.codigo}/pago`, "POST"));
    });

  // Paso 2: el pago se hace en otra pestaña; esta pestaña espera el resultado
  if (pago) {
    return (
      <div>
        <p className="alerta alerta--info">
          Orden <strong>{pago.codigo}</strong> creada. Tienes 30 minutos para pagar.
        </p>
        <a
          className="btn btn-dorado btn-bloque"
          href={pago.urlPago}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => router.push(`/checkout/resultado?orden=${pago.codigo}`)}
        >
          Pagar en Bold
        </a>
        <p className="subtitulo" style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>
          Bold se abre en otra pestaña (tarjeta, PSE, Nequi o Bancolombia). Al terminar, vuelve a esta pestaña.
        </p>
      </div>
    );
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
            : "Comprar entradas"}
      </button>
    </div>
  );
}
