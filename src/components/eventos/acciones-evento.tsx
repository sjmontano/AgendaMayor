"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BtnMayor } from "@/components/ui/botones";
import { useToast } from "@/components/ui/toast";
import { ApiHttpError, apiPatch, apiPost } from "@/lib/api";
import { formatearCentavos } from "@/lib/utils";

export function BotonCancelarEvento({ eventoId, estado }: { eventoId: number; estado: string }) {
  const router = useRouter();
  const toast = useToast();
  const [cargando, setCargando] = useState(false);

  if (estado !== "PUBLICADO") return null;

  async function cancelar() {
    const motivo = window.prompt(
      "Motivo de la cancelación (opcional). Los compradores verán este mensaje."
    );
    if (motivo === null) return;
    if (
      !window.confirm(
        "¿Cancelar el evento? Las entradas dejarán de ser válidas. Si hay órdenes pagadas, deberás reembolsarlas desde este panel."
      )
    ) {
      return;
    }

    setCargando(true);
    try {
      await apiPatch(`/api/eventos/${eventoId}`, {
        estado: "CANCELADO",
        motivoCancelacion: motivo.trim() || "Evento cancelado por el organizador",
      });
      toast.exito("Evento cancelado", "Las entradas ya no son válidas para el acceso.");
      router.refresh();
    } catch (err) {
      toast.error(
        "No pudimos cancelar el evento",
        err instanceof ApiHttpError ? err.message : "Inténtalo de nuevo."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <BtnMayor variante="danger" tamano="sm" cargando={cargando} onClick={cancelar}>
      Cancelar evento
    </BtnMayor>
  );
}

export function BotonReembolso({ codigo, totalCentavos }: { codigo: string; totalCentavos: number }) {
  const router = useRouter();
  const toast = useToast();
  const [cargando, setCargando] = useState(false);

  async function reembolsar() {
    if (
      !window.confirm(
        `¿Reembolsar ${formatearCentavos(totalCentavos)} de la orden ${codigo}? Las entradas quedarán anuladas.`
      )
    ) {
      return;
    }
    setCargando(true);
    try {
      await apiPost(`/api/ordenes/${codigo}/reembolso`, {});
      toast.exito("Reembolso procesado", `La orden ${codigo} quedó reembolsada.`);
      router.refresh();
    } catch (err) {
      toast.error(
        "No pudimos reembolsar",
        err instanceof ApiHttpError ? err.message : "Revisa la conexión e inténtalo de nuevo."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <BtnMayor variante="danger" tamano="sm" cargando={cargando} onClick={reembolsar}>
      Reembolsar
    </BtnMayor>
  );
}
