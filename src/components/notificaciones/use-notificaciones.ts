"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

/**
 * Estado compartido de notificaciones (campana y página /notificaciones).
 * Carga al montar, refresca cada 60s y al volver a la pestaña.
 * Marcar leída es optimista: la UI cambia al instante y se revierte si falla.
 */
export interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  proyecto_id: number | null;
}

export type TipoNotificacion = "publicado" | "rechazado" | "revision" | "info";

export function tipoDe(n: Notificacion): TipoNotificacion {
  const m = n.mensaje.toLowerCase();
  if (m.includes("fue publicado")) return "publicado";
  if (m.includes("rechazado")) return "rechazado";
  if (m.includes("revisión") || m.includes("revision")) return "revision";
  return "info";
}

export function useNotificaciones(activo = true) {
  const [items, setItems] = useState<Notificacion[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  const recargar = useCallback(async () => {
    try {
      const datos = await apiGet<Notificacion[]>("/api/notificaciones");
      setItems(datos);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    apiGet<Notificacion[]>("/api/notificaciones")
      .then((d) => {
        if (!vivo) return;
        setItems(d);
        setEstado("listo");
      })
      .catch(() => vivo && setEstado("error"));

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") void recargar();
    }, 60_000);
    const alVolver = () => document.visibilityState === "visible" && void recargar();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vivo = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [activo, recargar]);

  const marcar = useCallback(async (id: number) => {
    setItems((prev) => prev.map((i) => (i.id_notificacion === id ? { ...i, leida: true } : i)));
    try {
      await apiPatch("/api/notificaciones", { id });
    } catch {
      setItems((prev) => prev.map((i) => (i.id_notificacion === id ? { ...i, leida: false } : i)));
    }
  }, []);

  const marcarTodas = useCallback(async () => {
    let previo: Notificacion[] = [];
    setItems((prev) => {
      previo = prev;
      return prev.map((i) => ({ ...i, leida: true }));
    });
    try {
      await apiPatch("/api/notificaciones", { todas: true });
    } catch {
      setItems(previo);
    }
  }, []);

  const sinLeer = items.filter((i) => !i.leida).length;

  return { items, estado, sinLeer, marcar, marcarTodas, recargar };
}
