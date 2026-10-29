import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { StampIcon } from "@/components/icons/stamp";
import { Badge, BadgeEstado, BadgeTipo } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { Tile } from "@/components/ui/tile";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { BotonCancelarEvento, BotonReembolso } from "@/components/eventos/acciones-evento";
import { ValidadorEntradas } from "@/components/eventos/validador-entradas";
import { usuarioActual } from "@/lib/sesion-vista";
import { badgeEntrada, badgeOrden, etiquetaEntrada, etiquetaOrden } from "@/lib/design-tokens";
import { formatearCentavos, fechaHoraLarga } from "@/lib/utils";
import { obtenerPorId } from "@/modelo/eventos/evento.repository";
import { puedeGestionarEvento } from "@/modelo/eventos/evento.service";
import { listarOrdenesDelEvento } from "@/modelo/taquilla/taquilla.service";

export const metadata: Metadata = { title: "Gestión de evento" };
export const dynamic = "force-dynamic";

export default async function PanelEventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await usuarioActual();
  if (!usuario) redirect(`/ingresar?siguiente=/panel/eventos`);

  const { id } = await params;
  const evento = await obtenerPorId(Number(id));
  if (!evento || !puedeGestionarEvento(usuario, evento)) notFound();

  const ordenes = await listarOrdenesDelEvento(evento.id_evento, usuario);
  const pagadas = ordenes.filter((o) => o.estado === "PAGADA");
  const pendientes = ordenes.filter((o) => o.estado === "PENDIENTE");
  const recaudado = pagadas.reduce((s, o) => s + o.total_centavos, 0);
  const vendidas = evento.tipos_entrada.reduce((s, t) => s + t.cantidad_vendida, 0);
  const capacidad = evento.tipos_entrada.reduce((s, t) => s + t.cantidad_total, 0);
  const entradas = pagadas.flatMap((o) => o.entradas);
  const validas = entradas.filter((e) => e.estado === "VALIDA").length;
  const usadas = entradas.filter((e) => e.estado === "USADA").length;
  const esGratis = evento.tipos_entrada.every((t) => t.precio_centavos === 0);

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/panel/eventos"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-unimayor-700 underline-offset-4 hover:text-unimayor-900 hover:underline"
        >
          <ArrowRightIcon size={16} className="rotate-180" aria-hidden="true" />
          Volver a mis eventos
        </Link>

        <div className="mt-5">
          <EncabezadoSeccion
            eyebrow="Organizador · Taquilla"
            titulo={evento.titulo}
            descripcion="Ventas, entradas y validación en la puerta."
            accion={
              <div className="flex flex-wrap gap-2">
                <BtnMayor href={`/eventos/${evento.id_evento}`} variante="secondary" tamano="sm">
                  Ver público
                </BtnMayor>
                <BotonCancelarEvento eventoId={evento.id_evento} estado={evento.estado} />
              </div>
            }
            como="h1"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <BadgeTipo tipo={evento.tipo} />
          <BadgeEstado estado={evento.estado} />
          <Badge className="bg-white text-muted ring-1 ring-line">
            {fechaHoraLarga(evento.fecha_inicio)}
          </Badge>
          <Badge className="bg-white text-muted ring-1 ring-line">
            {evento.es_virtual ? "Virtual" : evento.lugar}
          </Badge>
        </div>

        {evento.estado === "CANCELADO" && (
          <div role="alert" className="mt-6 rounded-tile border border-error/30 bg-error-soft p-4 text-sm text-error">
            <p className="font-extrabold">Evento cancelado</p>
            <p className="mt-1">{evento.motivo_cancelacion ?? "Las entradas fueron anuladas."}</p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile>
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Recaudado</p>
            <p className="mt-2 text-2xl font-extrabold text-unimayor-900 tabular-nums">
              {formatearCentavos(recaudado)}
            </p>
            <p className="mt-1 text-xs text-muted">{pagadas.length} órdenes pagadas</p>
          </Tile>
          <Tile>
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Entradas vendidas</p>
            <p className="mt-2 text-2xl font-extrabold text-unimayor-900 tabular-nums">
              {vendidas}
              {capacidad > 0 && <span className="text-sm font-bold text-muted">/{capacidad}</span>}
            </p>
            <p className="mt-1 text-xs text-muted">{esGratis ? "Reservas gratis" : "Incluye cortesías"}</p>
          </Tile>
          <Tile>
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">En puerta</p>
            <p className="mt-2 text-2xl font-extrabold text-unimayor-900 tabular-nums">
              {usadas}
              <span className="text-sm font-bold text-muted">/{entradas.length}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{validas} válidas por usar</p>
          </Tile>
          <Tile tono="azul">
            <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Pendientes</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums">{pendientes.length}</p>
            <p className="mt-1 text-xs text-white/70">Órdenes esperando pago</p>
          </Tile>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Tile className="p-6">
              <div className="flex items-center gap-2">
                <StampIcon size={20} className="text-unimayor-700" aria-hidden="true" />
                <h2 className="text-lg font-extrabold text-unimayor-900">Validar entrada en la puerta</h2>
              </div>
              <p className="mt-1 text-sm text-muted">
                Escanea el QR o escribe el código. Cada entrada solo puede usarse una vez.
              </p>
              <div className="mt-4">
                <ValidadorEntradas deshabilitado={evento.estado === "CANCELADO"} />
              </div>
            </Tile>

            <Tile className="p-6">
              <h2 className="text-lg font-extrabold text-unimayor-900">Órdenes</h2>
              {ordenes.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Aún no hay compras para este evento.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                        <th className="py-2 pr-3">Orden</th>
                        <th className="py-2 pr-3">Comprador</th>
                        <th className="py-2 pr-3">Estado</th>
                        <th className="py-2 pr-3 text-right">Total</th>
                        <th className="py-2 pr-3">Entradas</th>
                        <th className="py-2 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenes.map((orden) => (
                        <tr key={orden.id_orden} className="border-b border-line/70 last:border-0">
                          <td className="py-3 pr-3">
                            <p className="font-mono text-xs font-bold text-ink">{orden.codigo}</p>
                            <p className="text-[11px] text-muted">{fechaHoraLarga(orden.creada_en)}</p>
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-bold text-ink">{orden.nombre_comprador}</p>
                            <p className="text-[11px] text-muted">{orden.correo_comprador}</p>
                          </td>
                          <td className="py-3 pr-3">
                            <Badge className={badgeOrden[orden.estado] ?? badgeOrden.PENDIENTE}>
                              {etiquetaOrden[orden.estado] ?? orden.estado}
                            </Badge>
                          </td>
                          <td className="py-3 pr-3 text-right font-extrabold text-unimayor-900">
                            {formatearCentavos(orden.total_centavos)}
                          </td>
                          <td className="py-3 pr-3 text-xs text-muted">
                            {orden.entradas.length} {orden.entradas.length === 1 ? "entrada" : "entradas"}
                          </td>
                          <td className="py-3 text-right">
                            {orden.estado === "PAGADA" ? (
                              <BotonReembolso codigo={orden.codigo} totalCentavos={orden.total_centavos} />
                            ) : (
                              <span className="text-[11px] text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tile>

            <Tile className="p-6">
              <h2 className="text-lg font-extrabold text-unimayor-900">Asistentes</h2>
              {entradas.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Las entradas aparecerán aquí cuando se confirme el pago.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                        <th className="py-2 pr-3">Código</th>
                        <th className="py-2 pr-3">Asistente</th>
                        <th className="py-2 pr-3">Estado</th>
                        <th className="py-2 text-right">Usada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entradas.map((entrada) => (
                        <tr key={entrada.id_entrada} className="border-b border-line/70 last:border-0">
                          <td className="py-2.5 pr-3 font-mono text-xs font-bold text-ink">{entrada.codigo}</td>
                          <td className="py-2.5 pr-3">
                            <p className="font-bold text-ink">{entrada.nombre_asistente}</p>
                            <p className="text-[11px] text-muted">{entrada.correo_asistente}</p>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge className={badgeEntrada[entrada.estado] ?? badgeEntrada.VALIDA}>
                              {etiquetaEntrada[entrada.estado] ?? entrada.estado}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right text-[11px] text-muted">
                            {entrada.usada_en ? fechaHoraLarga(entrada.usada_en) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tile>
          </div>

          <aside className="space-y-4">
            <Tile className="p-5">
              <h2 className="text-sm font-extrabold text-unimayor-900">Tipos de entrada</h2>
              {evento.tipos_entrada.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Este evento no tiene taquilla.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {evento.tipos_entrada.map((tipo) => {
                    const disponibles = Math.max(
                      0,
                      tipo.cantidad_total - tipo.cantidad_vendida - tipo.cantidad_reservada
                    );
                    return (
                      <li key={tipo.id_tipo_entrada} className="rounded-box bg-unimayor-tint p-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-bold text-ink">{tipo.nombre}</p>
                          <p className="text-sm font-extrabold text-unimayor-900">
                            {tipo.precio_centavos === 0 ? "Gratis" : formatearCentavos(tipo.precio_centavos)}
                          </p>
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-muted">
                          {tipo.cantidad_vendida} vendidas · {tipo.cantidad_reservada} reservadas ·{" "}
                          {disponibles} disponibles
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
                          <div
                            className="h-full rounded-full bg-unimayor-700"
                            style={{
                              width: `${tipo.cantidad_total > 0 ? Math.min(100, (tipo.cantidad_vendida / tipo.cantidad_total) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Tile>

            <Tile className="p-5">
              <h2 className="text-sm font-extrabold text-unimayor-900">Datos del evento</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Aforo</dt>
                  <dd className="font-bold text-ink">{evento.aforo ?? "Sin límite"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Máx. por compra</dt>
                  <dd className="font-bold text-ink">{evento.max_por_compra}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Venta</dt>
                  <dd className="text-right font-bold text-ink">
                    {evento.venta_inicio ? fechaHoraLarga(evento.venta_inicio) : "Abierta"}
                    {evento.venta_fin ? ` — ${fechaHoraLarga(evento.venta_fin)}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Estado</dt>
                  <dd className="font-bold text-ink">{evento.estado}</dd>
                </div>
              </dl>
            </Tile>

            <Tile className="border-unimayor-900/15 bg-unimayor-tint p-5 text-xs leading-relaxed text-muted">
              <p className="font-extrabold text-unimayor-900">Sobre los reembolsos</p>
              <p className="mt-1">
                El reembolso es total, se procesa en Stripe y anula las entradas. El cupo vuelve a quedar disponible.
              </p>
            </Tile>
          </aside>
        </div>
      </div>
    </div>
  );
}
