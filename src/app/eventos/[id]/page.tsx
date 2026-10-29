import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { ClockIcon } from "@/components/icons/clock";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { MapPinIcon } from "@/components/icons/map-pin";
import { StampIcon } from "@/components/icons/stamp";
import { UserIcon } from "@/components/icons/user";
import { Avatar } from "@/components/ui/avatar";
import { Badge, BadgeEstado, BadgeTipo } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { Tile } from "@/components/ui/tile";
import { CompraEntradas } from "@/components/eventos/compra-entradas";
import { usuarioActual } from "@/lib/sesion-vista";
import { formatearCentavos, fechaHoraLarga, horaCorta } from "@/lib/utils";
import { obtenerPorId } from "@/modelo/eventos/evento.repository";
import { obtenerDetallePublico, puedeGestionarEvento } from "@/modelo/eventos/evento.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const evento = await obtenerPorId(Number(id));
  if (!evento || evento.estado !== "PUBLICADO") return { title: "Evento" };
  return {
    title: evento.titulo,
    description: evento.descripcion.slice(0, 160),
  };
}

export default async function EventoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { id } = await params;
  const { pago } = await searchParams;
  const usuario = await usuarioActual();

  const evento = await obtenerDetallePublico(Number(id), usuario).catch(() => notFound());
  const esGestor = Boolean(usuario && puedeGestionarEvento(usuario, evento));
  const finalizado = new Date(evento.fecha_fin) < new Date();
  const tipos = evento.tipos_entrada.map((t) => ({
    id_tipo_entrada: t.id_tipo_entrada,
    nombre: t.nombre,
    descripcion: t.descripcion,
    precio_centavos: t.precio_centavos,
    disponibles: Math.max(0, t.cantidad_total - t.cantidad_vendida - t.cantidad_reservada),
  }));
  const disponibles = tipos.reduce((s, t) => s + t.disponibles, 0);

  return (
    <div className="bg-unimayor-tint">
      <section className="relative overflow-hidden bg-unimayor-950 text-white">
        {evento.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.imagen}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-40"
          />
        ) : (
          <div className="bg-grid-dark absolute inset-0 bg-gradient-to-br from-unimayor-900 to-unimayor-950" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-unimayor-950 via-unimayor-950/75 to-unimayor-900/20" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeTipo tipo={evento.tipo} className="shadow-soft" />
            <BadgeEstado estado={evento.estado} className="shadow-soft" />
            {evento.es_pagado && (
              <Badge className="bg-gold-soft text-gold-ink shadow-soft">
                Entradas desde {formatearCentavos(evento.precio_desde_centavos ?? 0)}
              </Badge>
            )}
            {evento.permite_entradas && (
              <Badge className="bg-white/15 text-white shadow-soft">
                {disponibles > 0 ? `${disponibles} cupos disponibles` : "Entradas agotadas"}
              </Badge>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            {evento.titulo}
          </h1>

          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-white/85">
            <span className="inline-flex items-center gap-2">
              <CalendarDaysIcon size={18} aria-hidden="true" />
              {fechaHoraLarga(evento.fecha_inicio)}
            </span>
            <span className="inline-flex items-center gap-2">
              <ClockIcon size={18} aria-hidden="true" />
              Hasta {horaCorta(evento.fecha_fin)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon size={18} aria-hidden="true" />
              {evento.es_virtual ? "Evento virtual" : evento.lugar}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/15 pt-5">
            <Avatar
              nombre={evento.autor.nombre}
              apellido={evento.autor.apellido}
              src={evento.autor.avatar}
              tamano="md"
            />
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Organiza</p>
              <Link
                href={`/perfil/${evento.autor.username}`}
                className="text-sm font-extrabold text-white underline-offset-4 hover:underline"
              >
                {evento.autor.nombre} {evento.autor.apellido}
              </Link>
            </div>
            {evento.facultad && (
              <span className="ml-auto rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/85">
                {evento.facultad}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-14">
        <main className="min-w-0 space-y-6">
          {pago === "cancelado" && (
            <div role="status" className="rounded-tile border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
              <p className="font-extrabold">Pago cancelado</p>
              <p className="mt-1">No se cobró nada. Puedes intentarlo de nuevo cuando quieras.</p>
            </div>
          )}

          {evento.estado === "CANCELADO" && (
            <div role="alert" className="rounded-tile border border-error/30 bg-error-soft p-4 text-sm text-error">
              <p className="font-extrabold">Este evento fue cancelado</p>
              {evento.motivo_cancelacion && <p className="mt-1">{evento.motivo_cancelacion}</p>}
            </div>
          )}

          {esGestor && evento.estado !== "PUBLICADO" && (
            <div role="status" className="rounded-tile border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
              <p className="font-extrabold">Vista previa del organizador</p>
              <p className="mt-1">Este evento está en estado {evento.estado} y no aparece en la cartelera pública.</p>
            </div>
          )}

          {finalizado && evento.estado === "PUBLICADO" && (
            <div role="status" className="rounded-tile border border-line bg-white p-4 text-sm text-muted">
              Este evento ya finalizó. La información se conserva como registro de la cartelera.
            </div>
          )}

          <Tile className="p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-unimayor-900">Sobre el evento</h2>
            <p className="mt-4 whitespace-pre-line text-[0.9375rem] leading-[1.75] text-ink">
              {evento.descripcion}
            </p>
          </Tile>

          <Tile className="p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-unimayor-900">Detalles</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Fecha y hora</dt>
                <dd className="mt-1 text-sm font-bold text-ink">{fechaHoraLarga(evento.fecha_inicio)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Finaliza</dt>
                <dd className="mt-1 text-sm font-bold text-ink">{fechaHoraLarga(evento.fecha_fin)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Lugar</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink">
                  <MapPinIcon size={16} aria-hidden="true" />
                  {evento.es_virtual ? "Virtual" : evento.lugar}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Organiza</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink">
                  <UserIcon size={16} aria-hidden="true" />
                  {evento.autor.nombre} {evento.autor.apellido}
                </dd>
              </div>
              {evento.facultad && (
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Facultad</dt>
                  <dd className="mt-1 text-sm font-bold text-ink">{evento.facultad}</dd>
                </div>
              )}
              {evento.edicion && (
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Edición</dt>
                  <dd className="mt-1 text-sm font-bold text-ink">{evento.edicion}</dd>
                </div>
              )}
            </dl>

            {evento.es_virtual && (
              <div className="mt-6 rounded-box border border-line bg-unimayor-tint p-4">
                <p className="text-sm font-bold text-ink">Acceso al evento virtual</p>
                {evento.url_virtual ? (
                  <BtnMayor
                    href={evento.url_virtual}
                    externo
                    variante="secondary"
                    tamano="sm"
                    icono={ExternalLinkIcon}
                    className="mt-2"
                  >
                    Abrir enlace del evento
                  </BtnMayor>
                ) : (
                  <p className="mt-1 text-sm text-muted">
                    El enlace de acceso se entrega en la página de tus entradas una vez confirmado el pago.
                  </p>
                )}
              </div>
            )}

            {evento.politica_devolucion && (
              <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
                <span className="font-bold text-ink">Política de devoluciones: </span>
                {evento.politica_devolucion}
              </p>
            )}
          </Tile>

          {esGestor && (
            <Tile className="border-unimayor-900/20 bg-unimayor-tint p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-unimayor-700 uppercase">Organizador</p>
                  <h2 className="mt-1 text-lg font-extrabold text-unimayor-900">Gestiona este evento</h2>
                  <p className="mt-1 text-sm text-muted">
                    Revisa ventas, valida entradas en la puerta y reembolsa si es necesario.
                  </p>
                </div>
                <BtnMayor href={`/panel/eventos/${evento.id_evento}`} variante="primary" icono={ArrowRightIcon}>
                  Ir al panel de ventas
                </BtnMayor>
              </div>
            </Tile>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <BtnMayor href="/eventos" variante="ghost" tamano="sm">
              Volver a la cartelera
            </BtnMayor>
            {!usuario && (
              <Link
                href={`/ingresar?siguiente=/eventos/${evento.id_evento}`}
                className="text-sm font-bold text-unimayor-700 underline underline-offset-4 hover:text-unimayor-900"
              >
                Inicia sesión para ver tus compras
              </Link>
            )}
            {usuario && (
              <Link
                href="/mis-entradas"
                className="text-sm font-bold text-unimayor-700 underline underline-offset-4 hover:text-unimayor-900"
              >
                Ver mis entradas
              </Link>
            )}
          </div>
        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CompraEntradas
            eventoId={evento.id_evento}
            tipos={tipos}
            maxPorCompra={evento.max_por_compra}
            ventaInicio={evento.venta_inicio}
            ventaFin={evento.venta_fin}
            politicaDevolucion={evento.politica_devolucion}
            usuario={usuario ? { nombre: `${usuario.nombre} ${usuario.apellido}`, correo: usuario.correo } : null}
            cancelado={evento.estado === "CANCELADO"}
          />

          {evento.permite_entradas && (
            <div className="rounded-tile border border-line bg-white p-4 text-xs leading-relaxed text-muted">
              <p className="flex items-center gap-1.5 font-extrabold text-ink">
                <StampIcon size={16} aria-hidden="true" />
                Entradas con código QR
              </p>
              <p className="mt-1.5">
                Cada entrada tiene un código único. Preséntalo en la puerta; el organizador lo validará una sola vez.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
