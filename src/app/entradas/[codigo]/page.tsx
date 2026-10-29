import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { MapPinIcon } from "@/components/icons/map-pin";
import { StampIcon } from "@/components/icons/stamp";
import { Badge } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { BotonImprimir } from "@/components/eventos/boton-imprimir";
import { EstadoPago } from "@/components/eventos/estado-pago";
import { ordenParaCliente } from "@/lib/orden-cliente";
import { badgeEntrada, etiquetaEntrada, colors } from "@/lib/design-tokens";
import { fechaHoraLarga, formatearCentavos } from "@/lib/utils";
import { obtenerOrdenParaVer } from "@/modelo/taquilla/taquilla.service";
import { usuarioActual } from "@/lib/sesion-vista";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mis entradas",
  robots: { index: false, follow: false },
};

/**
 * Página de entradas con QR. Se accede con el token del correo de éxito o con
 * la sesión del comprador/organizador. No se indexa.
 */
export default async function EntradasPage({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { codigo } = await params;
  const { token } = await searchParams;
  const usuario = await usuarioActual();
  const orden = await obtenerOrdenParaVer(codigo, token ?? null, usuario).catch(() => notFound());
  const visible = ordenParaCliente(orden);

  if (orden.estado !== "PAGADA") {
    return (
      <div className="min-h-[60vh] bg-unimayor-tint px-4 py-12 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <EstadoPago
            codigo={orden.codigo}
            token={token ?? null}
            estadoInicial={orden.estado}
            eventoId={orden.evento_id}
            tituloEvento={orden.evento.titulo}
            totalCentavos={orden.total_centavos}
            correo={orden.correo_comprador}
          />
        </div>
      </div>
    );
  }

  const qrs = await Promise.all(
    orden.entradas.map((entrada) =>
      QRCode.toString(entrada.codigo, {
        type: "svg",
        width: 220,
        margin: 1,
        color: { dark: colors.unimayor900, light: colors.white },
      })
    )
  );

  const activas = orden.entradas.filter((e) => e.estado === "VALIDA").length;

  return (
    <div className="bg-unimayor-tint">
      <header className="bg-unimayor-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Tus entradas</p>
              <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-extrabold">
                {orden.evento.titulo}
              </h1>
            </div>
            <div className="print:hidden">
              <BotonImprimir />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-white/85">
            <span className="inline-flex items-center gap-2">
              <CalendarDaysIcon size={16} aria-hidden="true" />
              {fechaHoraLarga(orden.evento.fecha_inicio)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon size={16} aria-hidden="true" />
              {orden.evento.es_virtual ? "Virtual" : orden.evento.lugar}
            </span>
            <span className="inline-flex items-center gap-2">
              <StampIcon size={16} aria-hidden="true" />
              Orden {orden.codigo}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        {orden.evento.estado === "CANCELADO" && (
          <div role="alert" className="mb-5 rounded-tile border border-error/30 bg-error-soft p-4 text-sm text-error">
            <p className="font-extrabold">Evento cancelado</p>
            <p className="mt-1">
              Estas entradas ya no son válidas para el acceso. Si pagaste, contacta al organizador para gestionar el reembolso.
            </p>
          </div>
        )}

        <div className="rounded-tile border border-line bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-sm font-extrabold text-unimayor-900">
                {orden.entradas.length} {orden.entradas.length === 1 ? "entrada" : "entradas"}
              </p>
              <p className="text-xs text-muted">
                {activas} válida{activas === 1 ? "" : "s"} · Comprador: {orden.nombre_comprador} ({orden.correo_comprador})
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Total pagado</p>
              <p className="text-lg font-extrabold text-unimayor-900">{formatearCentavos(orden.total_centavos)}</p>
            </div>
          </div>

          {visible.evento.url_acceso_privado && (
            <div className="mt-4 rounded-box border border-unimayor-900/20 bg-unimayor-tint p-4">
              <p className="text-sm font-extrabold text-unimayor-900">Enlace privado del evento</p>
              <p className="mt-1 text-xs text-muted">
                Este enlace es solo para compradores. No lo compartas públicamente.
              </p>
              <BtnMayor
                href={visible.evento.url_acceso_privado}
                externo
                variante="secondary"
                tamano="sm"
                icono={ExternalLinkIcon}
                className="mt-2"
              >
                Abrir evento virtual
              </BtnMayor>
            </div>
          )}

          <ul className="mt-5 space-y-4">
            {orden.entradas.map((entrada, i) => (
              <li
                key={entrada.id_entrada}
                className="break-inside-avoid rounded-tile border border-line bg-unimayor-tint/50 p-4 sm:flex sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={badgeEntrada[entrada.estado] ?? badgeEntrada.VALIDA}>
                      {etiquetaEntrada[entrada.estado] ?? entrada.estado}
                    </Badge>
                    <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                      Entrada {i + 1} de {orden.entradas.length}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-unimayor-900">
                    {orden.evento.titulo}
                  </p>
                  <p className="text-sm font-bold text-ink">{entrada.nombre_asistente}</p>
                  <p className="mt-2 text-xs text-muted">
                    Código: <span className="font-mono font-bold text-ink">{entrada.codigo}</span>
                  </p>
                  {entrada.usada_en && (
                    <p className="mt-1 text-xs font-bold text-warning">
                      Usada el {fechaHoraLarga(entrada.usada_en)}
                    </p>
                  )}
                </div>

                <div className="mt-4 shrink-0 sm:mt-0">
                  <div
                    className="rounded-box bg-white p-2 shadow-soft"
                    role="img"
                    aria-label={`Código QR de la entrada ${entrada.codigo}`}
                    dangerouslySetInnerHTML={{ __html: qrs[i] }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-box bg-warning-soft px-3 py-2 text-xs leading-relaxed text-warning">
            Guarda este enlace o inicia sesión con {orden.correo_comprador} para volver a ver tus entradas. Cada QR se valida una sola vez en la puerta.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <BtnMayor href={`/eventos/${orden.evento_id}`} variante="ghost" tamano="sm" icono={ArrowRightIcon}>
            Volver al evento
          </BtnMayor>
          <Link
            href="/mis-entradas"
            className="text-sm font-bold text-unimayor-700 underline underline-offset-4 hover:text-unimayor-900"
          >
            Ver todas mis entradas
          </Link>
        </div>
      </div>
    </div>
  );
}
