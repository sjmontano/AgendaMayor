"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CheckIcon } from "@/components/icons/check";
import { ClockIcon } from "@/components/icons/clock";
import { BtnMayor } from "@/components/ui/botones";
import { Campo } from "@/components/ui/campo";
import { ApiHttpError, apiPost } from "@/lib/api";
import { SelectorPasarela, type PasarelaId } from "@/components/eventos/selector-pasarela";
import { cn, fechaHoraLarga, formatearCentavos } from "@/lib/utils";

export interface TipoEntradaVenta {
  id_tipo_entrada: number;
  nombre: string;
  descripcion: string | null;
  precio_centavos: number;
  disponibles: number;
}

interface Props {
  eventoId: number;
  tipos: TipoEntradaVenta[];
  maxPorCompra: number;
  ventaInicio: string | null;
  ventaFin: string | null;
  politicaDevolucion: string | null;
  usuario: { nombre: string; correo: string } | null;
  cancelado: boolean;
}

type ResultadoCheckout = { url: string; gratis: boolean; codigo: string };

const NOMBRE_PASARELA: Record<PasarelaId, string> = { STRIPE: "Stripe", WOMPI: "Wompi", BOLD: "Bold" };

/**
 * Panel de compra. El precio y el cupo vienen del servidor; aquí solo se
 * elige tipo/cantidad y se recogen los datos del comprador.
 */
export function CompraEntradas({
  eventoId,
  tipos,
  maxPorCompra,
  ventaInicio,
  ventaFin,
  politicaDevolucion,
  usuario,
  cancelado,
}: Props) {
  const disponibles = tipos.filter((t) => t.disponibles > 0);
  const [tipoId, setTipoId] = useState<number>(disponibles[0]?.id_tipo_entrada ?? tipos[0]?.id_tipo_entrada ?? 0);
  const [cantidad, setCantidad] = useState(1);
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [correo, setCorreo] = useState(usuario?.correo ?? "");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [aceptaDatos, setAceptaDatos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [pasarela, setPasarela] = useState<PasarelaId | null>(null);

  const tipo = tipos.find((t) => t.id_tipo_entrada === tipoId) ?? tipos[0];
  const ahora = new Date();
  const abre = ventaInicio ? new Date(ventaInicio) : null;
  const cierra = ventaFin ? new Date(ventaFin) : null;
  const ventaCerrada = Boolean((abre && ahora < abre) || (cierra && ahora > cierra));
  const agotado = !tipos.some((t) => t.disponibles > 0);
  const max = Math.max(1, Math.min(maxPorCompra || 1, tipo?.disponibles ?? 1, 20));
  const total = useMemo(() => (tipo?.precio_centavos ?? 0) * cantidad, [tipo, cantidad]);

  function cambiarCantidad(delta: number) {
    setCantidad((c) => Math.min(max, Math.max(1, c + delta)));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nuevos: Record<string, string> = {};
    if (!tipo) nuevos.tipo = "Elige un tipo de entrada.";
    if (nombre.trim().length < 3) nuevos.nombre = "Escribe tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) nuevos.correo = "Escribe un correo válido.";
    if (!aceptaDatos) nuevos.acepta = "Debes aceptar el tratamiento de datos.";
    if (total > 0 && !pasarela) nuevos.pasarela = "Elige un método de pago.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0 || !tipo) return;

    setCargando(true);
    try {
      const resultado = await apiPost<ResultadoCheckout>("/api/checkout", {
        eventoId,
        tipoEntradaId: tipo.id_tipo_entrada,
        cantidad,
        nombre: nombre.trim(),
        correo: correo.trim(),
        documento: documento.trim() || undefined,
        telefono: telefono.trim() || undefined,
        aceptaDatos: true,
        ...(total > 0 && pasarela ? { pasarela } : {}),
      });
      window.location.assign(resultado.url);
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err.message
          : "No pudimos iniciar la compra. Revisa tu conexión e inténtalo de nuevo."
      );
      setCargando(false);
    }
  }

  if (cancelado) {
    return (
      <section className="rounded-tile border border-error/25 bg-error-soft p-5" aria-labelledby="compra-cancelada">
        <h2 id="compra-cancelada" className="text-lg font-extrabold text-error">
          Evento cancelado
        </h2>
        <p className="mt-2 text-sm text-error/90">
          Este evento fue cancelado por el organizador. Si ya compraste una entrada, revisa tu correo o contacta al organizador.
        </p>
      </section>
    );
  }

  if (tipos.length === 0) {
    return (
      <section className="rounded-tile border border-line bg-white p-5 shadow-soft" aria-labelledby="entrada-libre">
        <h2 id="entrada-libre" className="text-lg font-extrabold text-unimayor-900">
          Entrada libre
        </h2>
        <p className="mt-2 text-sm text-muted">
          Este evento no requiere compra de entradas. Puedes asistir directamente y consultar los detalles en esta página.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-tile border border-line bg-white p-5 shadow-soft sm:p-6" noValidate>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-unimayor-700 uppercase">Taquilla</p>
          <h2 className="mt-1 text-xl font-extrabold text-unimayor-900">Elige tu entrada</h2>
        </div>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-extrabold text-success">
          {total === 0 ? "Reserva gratis" : "Pago seguro"}
        </span>
      </div>

      {ventaCerrada ? (
        <div className="mt-5 rounded-box border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
          <p className="font-extrabold">
            {abre && ahora < abre ? "La venta aún no ha abierto" : "La venta de entradas cerró"}
          </p>
          {abre && ahora < abre && <p className="mt-1">Abre el {fechaHoraLarga(abre.toISOString())}.</p>}
        </div>
      ) : agotado ? (
        <div className="mt-5 rounded-box border border-line bg-line-soft p-4 text-sm text-muted">
          <p className="font-extrabold text-ink">Entradas agotadas</p>
          <p className="mt-1">Ya no quedan cupos disponibles para este evento.</p>
        </div>
      ) : (
        <>
          <fieldset className="mt-5">
            <legend className="sr-only">Tipo de entrada</legend>
            <div className="space-y-2">
              {tipos.map((t) => {
                const sinCupo = t.disponibles < 1;
                return (
                  <label
                    key={t.id_tipo_entrada}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-box border p-3.5 transition-colors",
                      tipoId === t.id_tipo_entrada
                        ? "border-unimayor-900 bg-unimayor-tint ring-1 ring-unimayor-900"
                        : "border-line hover:border-unimayor-900/35",
                      sinCupo && "pointer-events-none opacity-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="tipo-entrada"
                      value={t.id_tipo_entrada}
                      checked={tipoId === t.id_tipo_entrada}
                      onChange={() => {
                        setTipoId(t.id_tipo_entrada);
                        setCantidad(1);
                      }}
                      className="mt-1 size-4 accent-unimayor-900"
                      disabled={sinCupo}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-bold text-ink">{t.nombre}</span>
                        <span className="shrink-0 font-extrabold text-unimayor-900">
                          {t.precio_centavos === 0 ? "Gratis" : formatearCentavos(t.precio_centavos)}
                        </span>
                      </span>
                      {t.descripcion && <span className="mt-0.5 block text-xs text-muted">{t.descripcion}</span>}
                      <span className="mt-1 block text-[11px] font-bold text-muted">
                        {sinCupo ? "Agotada" : `${t.disponibles} disponibles`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink">Cantidad</p>
              <p className="text-xs text-muted">Máximo {max} por compra</p>
            </div>
            <div className="flex items-center gap-1 rounded-box border border-line bg-white p-1">
              <button
                type="button"
                onClick={() => cambiarCantidad(-1)}
                disabled={cantidad <= 1}
                className="flex size-9 items-center justify-center rounded-lg text-lg font-extrabold text-unimayor-900 transition-colors hover:bg-unimayor-100 disabled:opacity-40"
                aria-label="Quitar una entrada"
              >
                −
              </button>
              <span className="w-8 text-center font-extrabold text-ink tabular-nums" aria-live="polite">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => cambiarCantidad(1)}
                disabled={cantidad >= max}
                className="flex size-9 items-center justify-center rounded-lg text-lg font-extrabold text-unimayor-900 transition-colors hover:bg-unimayor-100 disabled:opacity-40"
                aria-label="Añadir una entrada"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-line pt-5">
            <Campo
              etiqueta="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              error={errores.nombre}
              required
            />
            <Campo
              etiqueta="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              ayuda="Lo usaremos para identificar tu compra. Al terminar verás el enlace de tus entradas."
              error={errores.correo}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                etiqueta="Documento"
                opcional
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                autoComplete="off"
                inputMode="numeric"
              />
              <Campo
                etiqueta="Teléfono"
                opcional
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={aceptaDatos}
              onChange={(e) => setAceptaDatos(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-unimayor-900"
            />
            <span>
              Acepto el tratamiento de mis datos personales para la gestión de esta compra y el control de acceso al evento.
            </span>
          </label>
          {errores.acepta && (
            <p role="alert" className="mt-1 text-xs font-bold text-error">
              {errores.acepta}
            </p>
          )}

          {total > 0 && (
            <div className="mt-5">
              <SelectorPasarela valor={pasarela} onCambio={setPasarela} />
              {errores.pasarela && (
                <p role="alert" className="mt-1 text-xs font-bold text-error">
                  {errores.pasarela}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex items-baseline justify-between gap-3 rounded-box bg-unimayor-tint px-4 py-3">
            <span className="text-sm font-bold text-ink">Total</span>
            <span className="text-xl font-extrabold text-unimayor-900">
              {total === 0 ? "Gratis" : formatearCentavos(total)}
            </span>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-box bg-error-soft px-3 py-2 text-sm font-bold text-error">
              {error}
            </p>
          )}

          <BtnMayor
            type="submit"
            variante="gold"
            anchoCompleto
            cargando={cargando}
            icono={ArrowRightIcon}
            className="mt-4"
          >
            {total === 0 ? "Reservar entrada gratis" : `Pagar con ${NOMBRE_PASARELA[pasarela ?? "STRIPE"]}`}
          </BtnMayor>

          <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
            <ClockIcon size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              {total === 0
                ? "La reserva se confirma de inmediato y verás tus entradas con código QR."
                : `Serás redirigido a la página segura de ${NOMBRE_PASARELA[pasarela ?? "STRIPE"]}. No almacenamos los datos de tu tarjeta ni de tu banco.`}
            </span>
          </div>

          {politicaDevolucion && (
            <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
              <span className="font-bold text-ink">Devoluciones: </span>
              {politicaDevolucion}
            </p>
          )}
        </>
      )}

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold text-success">
        <CheckIcon size={14} aria-hidden="true" />
        <span>{total === 0 ? "Reserva sin costo" : `Pago procesado por ${NOMBRE_PASARELA[pasarela ?? "STRIPE"]}`}</span>
      </div>
    </form>
  );
}
