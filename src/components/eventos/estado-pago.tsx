"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CheckIcon } from "@/components/icons/check";
import { ClockIcon } from "@/components/icons/clock";
import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { XIcon } from "@/components/icons/x";
import { BtnMayor } from "@/components/ui/botones";
import { apiGet } from "@/lib/api";
import type { OrdenCliente } from "@/lib/orden-cliente";
import { formatearCentavos } from "@/lib/utils";

interface Props {
  codigo: string;
  token: string | null;
  estadoInicial: string;
  eventoId: number;
  tituloEvento: string;
  totalCentavos: number;
  correo: string;
}

export function EstadoPago({
  codigo,
  token,
  estadoInicial,
  eventoId,
  tituloEvento,
  totalCentavos,
  correo,
}: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoInicial);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    if (estado !== "PENDIENTE") return;
    let activo = true;
    const consultar = async () => {
      try {
        const orden = await apiGet<OrdenCliente>(
          `/api/ordenes/${encodeURIComponent(codigo)}?token=${encodeURIComponent(token ?? "")}`
        );
        if (!activo) return;
        if (orden.estado !== "PENDIENTE") {
          setEstado(orden.estado);
          if (orden.estado === "PAGADA") router.refresh();
        }
      } catch {
        // Un fallo de red no debe romper la pantalla; se reintenta.
      } finally {
        if (activo) setIntentos((n) => n + 1);
      }
    };

    const id = window.setInterval(consultar, 3000);
    return () => {
      activo = false;
      window.clearInterval(id);
    };
  }, [codigo, token, estado, router]);

  const enlaceEntradas = `/entradas/${codigo}${token ? `?token=${encodeURIComponent(token)}` : ""}`;

  if (estado === "PAGADA") {
    return (
      <section
        role="status"
        className="rounded-tile border border-success/30 bg-white p-6 text-center shadow-soft sm:p-10"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckIcon size={30} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-unimayor-900">¡Pago confirmado!</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Tus entradas para <strong className="text-ink">{tituloEvento}</strong> ya están listas. Presenta el código QR en la puerta.
        </p>
        <div className="mx-auto mt-5 max-w-md rounded-box bg-unimayor-tint p-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted">Orden</span>
            <span className="font-extrabold text-ink">{codigo}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-muted">Total</span>
            <span className="font-extrabold text-ink">{formatearCentavos(totalCentavos)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-muted">Correo</span>
            <span className="max-w-[60%] truncate font-bold text-ink">{correo}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <BtnMayor href={enlaceEntradas} variante="gold" icono={ArrowRightIcon}>
            Ver mis entradas
          </BtnMayor>
          <BtnMayor href={`/eventos/${eventoId}`} variante="ghost">
            Volver al evento
          </BtnMayor>
        </div>
      </section>
    );
  }

  if (estado === "FALLIDA" || estado === "EXPIRADA" || estado === "CANCELADA") {
    return (
      <section
        role="alert"
        className="rounded-tile border border-error/30 bg-white p-6 text-center shadow-soft sm:p-10"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-error-soft text-error">
          <XIcon size={30} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-unimayor-900">El pago no se completó</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          La orden {codigo} quedó <strong className="text-ink">{estado.toLowerCase()}</strong>. No se cobró el valor y el cupo fue liberado.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <BtnMayor href={`/eventos/${eventoId}`} variante="primary" icono={ArrowRightIcon}>
            Intentar de nuevo
          </BtnMayor>
          <BtnMayor href="/eventos" variante="ghost">
            Ver otros eventos
          </BtnMayor>
        </div>
      </section>
    );
  }

  if (estado === "REEMBOLSADA") {
    return (
      <section role="status" className="rounded-tile border border-line bg-white p-6 text-center shadow-soft sm:p-10">
        <h1 className="text-2xl font-extrabold text-unimayor-900">Orden reembolsada</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          El valor de la orden {codigo} fue reembolsado y sus entradas quedaron anuladas.
        </p>
        <BtnMayor href="/eventos" variante="primary" className="mt-6">
          Ver otros eventos
        </BtnMayor>
      </section>
    );
  }

  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-tile border border-warning/30 bg-white p-6 text-center shadow-soft sm:p-10"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <ClockIcon size={30} className="animate-pulse" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-unimayor-900">Estamos confirmando tu pago</h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Stripe está procesando la transacción. Esta página se actualiza sola; no cierres el navegador.
      </p>
      <div className="mx-auto mt-5 max-w-md rounded-box bg-unimayor-tint p-4 text-left text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted">Orden</span>
          <span className="font-extrabold text-ink">{codigo}</span>
        </div>
        <div className="mt-1 flex justify-between gap-3">
          <span className="text-muted">Evento</span>
          <span className="max-w-[60%] truncate font-bold text-ink">{tituloEvento}</span>
        </div>
        <div className="mt-1 flex justify-between gap-3">
          <span className="text-muted">Total</span>
          <span className="font-extrabold text-ink">{formatearCentavos(totalCentavos)}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-muted">
        <RefreshCWIcon size={14} className="animate-spin" aria-hidden="true" />
        Consultando a Stripe…
      </div>
      {intentos >= 40 && (
        <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-muted">
          Si el pago se completó y esta pantalla no cambia, guarda este enlace y consúltalo más tarde. La orden no se perderá.
        </p>
      )}
    </section>
  );
}
