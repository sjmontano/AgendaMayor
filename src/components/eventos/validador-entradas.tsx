"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons/check";
import { StampIcon } from "@/components/icons/stamp";
import { XIcon } from "@/components/icons/x";
import { BtnMayor } from "@/components/ui/botones";
import { Campo } from "@/components/ui/campo";
import { ApiHttpError, apiPost } from "@/lib/api";
import { fechaHoraLarga } from "@/lib/utils";

interface EntradaValidada {
  codigo: string;
  nombre_asistente: string;
  estado: string;
  usada_en: string | null;
  evento: {
    titulo: string;
    fecha_inicio: string;
    lugar: string;
    es_virtual: boolean;
  };
}

interface Resultado {
  ok: boolean;
  motivo?: string;
  entrada: EntradaValidada | null;
}

export function ValidadorEntradas({ deshabilitado = false }: { deshabilitado?: boolean }) {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function validar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);
    const limpio = codigo.trim().toUpperCase();
    if (limpio.length < 4) {
      setError("Escribe o escanea el código de la entrada.");
      return;
    }
    setCargando(true);
    try {
      const r = await apiPost<Resultado>("/api/entradas/validar", { codigo: limpio });
      setResultado(r);
      if (r.ok) setCodigo("");
    } catch (err) {
      setError(err instanceof ApiHttpError ? err.message : "No pudimos validar la entrada. Revisa la conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <form onSubmit={validar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Campo
          etiqueta="Código de la entrada"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="AME-XXXXXXXXXXXX"
          ayuda="Escanea el QR o escribe el código que aparece debajo."
          error={error}
          autoComplete="off"
          autoFocus
          disabled={deshabilitado}
          className="flex-1"
        />
        <BtnMayor
          type="submit"
          variante="primary"
          icono={StampIcon}
          cargando={cargando}
          disabled={deshabilitado}
          className="shrink-0"
        >
          Validar entrada
        </BtnMayor>
      </form>

      {deshabilitado && (
        <p className="mt-3 rounded-box bg-warning-soft px-3 py-2 text-xs font-bold text-warning">
          El evento está cancelado; no se pueden validar entradas.
        </p>
      )}

      {resultado && (
        <div
          role="status"
          aria-live="polite"
          className={
            resultado.ok
              ? "mt-4 rounded-tile border border-success/30 bg-success-soft p-4 text-success"
              : "mt-4 rounded-tile border border-error/30 bg-error-soft p-4 text-error"
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={
                resultado.ok
                  ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-white"
                  : "flex size-10 shrink-0 items-center justify-center rounded-full bg-error text-white"
              }
            >
              {resultado.ok ? <CheckIcon size={22} aria-hidden="true" /> : <XIcon size={22} aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold">
                {resultado.ok ? "Entrada válida: puede entrar" : resultado.motivo ?? "Entrada no válida"}
              </p>
              {resultado.entrada && (
                <>
                  <p className="mt-1 text-sm font-bold">{resultado.entrada.nombre_asistente}</p>
                  <p className="text-xs opacity-90">
                    {resultado.entrada.evento.titulo} · {fechaHoraLarga(resultado.entrada.evento.fecha_inicio)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-bold opacity-80">{resultado.entrada.codigo}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
