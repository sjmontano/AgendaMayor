import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { PlusIcon } from "@/components/icons/plus";
import { Badge, BadgeEstado, BadgeTipo } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { Tile } from "@/components/ui/tile";
import { Vacio } from "@/components/ui/vacio";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { usuarioActual } from "@/lib/sesion-vista";
import { formatearCentavos, fechaHoraLarga } from "@/lib/utils";
import { listarParaPanel } from "@/modelo/eventos/evento.service";

export const metadata: Metadata = { title: "Mis eventos" };
export const dynamic = "force-dynamic";

export default async function PanelEventosPage() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/panel/eventos");

  const eventos = await listarParaPanel(usuario);
  const publicados = eventos.filter((e) => e.estado === "PUBLICADO").length;
  const entradasVendidas = eventos.reduce(
    (s, e) => s + e.tipos_entrada.reduce((t, tipo) => t + tipo.cantidad_vendida, 0),
    0
  );
  const ingresos = eventos.reduce(
    (s, e) =>
      s +
      e.tipos_entrada.reduce(
        (t, tipo) => t + tipo.cantidad_vendida * tipo.precio_centavos,
        0
      ),
    0
  );

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/panel"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-unimayor-700 underline-offset-4 hover:text-unimayor-900 hover:underline"
        >
          <ArrowRightIcon size={16} className="rotate-180" aria-hidden="true" />
          Volver al panel
        </Link>

        <div className="mt-5">
          <EncabezadoSeccion
            eyebrow={usuario.nombre_rol === "ADMIN" ? "Administración · Eventos" : "Organizador · Eventos"}
            titulo={usuario.nombre_rol === "ADMIN" ? "Todos los eventos" : "Mis eventos"}
            descripcion="Revisa el estado de tus eventos, las entradas vendidas y el dinero recaudado."
            accion={
              <BtnMayor href="/eventos/nuevo" variante="gold" icono={PlusIcon}>
                Crear evento
              </BtnMayor>
            }
            como="h1"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile>
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Eventos</p>
            <p className="mt-2 text-3xl font-extrabold text-unimayor-900 tabular-nums">{eventos.length}</p>
            <p className="mt-1 text-xs text-muted">{publicados} publicados</p>
          </Tile>
          <Tile>
            <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Entradas vendidas</p>
            <p className="mt-2 text-3xl font-extrabold text-unimayor-900 tabular-nums">{entradasVendidas}</p>
            <p className="mt-1 text-xs text-muted">Incluye reservas gratis</p>
          </Tile>
          <Tile tono="oro">
            <p className="text-xs font-bold tracking-[0.16em] text-unimayor-950/70 uppercase">Recaudado</p>
            <p className="mt-2 text-2xl font-extrabold text-unimayor-950 tabular-nums">
              {formatearCentavos(ingresos)}
            </p>
            <p className="mt-1 text-xs text-unimayor-950/70">Antes de comisiones de Stripe</p>
          </Tile>
          <Tile tono="azul">
            <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Siguiente paso</p>
            <p className="mt-2 text-sm leading-relaxed font-bold">
              Valida los QR en la puerta desde el panel de cada evento.
            </p>
            <BtnMayor href="/eventos" variante="onDark" tamano="sm" className="mt-4">
              Ver cartelera
            </BtnMayor>
          </Tile>
        </div>

        {eventos.length === 0 ? (
          <Vacio
            className="mt-8"
            titulo="Aún no has creado eventos"
            texto="Publica tu primer evento y, si quieres, abre una taquilla para vender entradas con Stripe."
            accion={
              <BtnMayor href="/eventos/nuevo" variante="primary" icono={PlusIcon}>
                Crear mi primer evento
              </BtnMayor>
            }
          />
        ) : (
          <ul className="mt-8 space-y-4">
            {eventos.map((evento) => {
              const vendidas = evento.tipos_entrada.reduce((s, t) => s + t.cantidad_vendida, 0);
              const capacidad = evento.tipos_entrada.reduce((s, t) => s + t.cantidad_total, 0);
              const recaudado = evento.tipos_entrada.reduce(
                (s, t) => s + t.cantidad_vendida * t.precio_centavos,
                0
              );
              return (
                <li
                  key={evento.id_evento}
                  className="rounded-tile border border-line bg-white p-5 shadow-soft sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <BadgeTipo tipo={evento.tipo} />
                        <BadgeEstado estado={evento.estado} />
                        {evento.tipos_entrada.length > 0 ? (
                          <Badge className="bg-gold-soft text-gold-ink">
                            {evento.tipos_entrada.some((t) => t.precio_centavos > 0)
                              ? "Taquilla con pago"
                              : "Reserva gratis"}
                          </Badge>
                        ) : (
                          <Badge className="bg-line-soft text-muted">Sin taquilla</Badge>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg leading-snug font-extrabold text-unimayor-900">
                        <Link
                          href={`/eventos/${evento.id_evento}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {evento.titulo}
                        </Link>
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-muted">
                        <CalendarDaysIcon size={14} aria-hidden="true" />
                        {fechaHoraLarga(evento.fecha_inicio)} · {evento.es_virtual ? "Virtual" : evento.lugar}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center lg:min-w-[260px]">
                      <div className="rounded-box bg-unimayor-tint px-3 py-2">
                        <p className="text-[10px] font-bold tracking-[0.12em] text-muted uppercase">Vendidas</p>
                        <p className="text-lg font-extrabold text-unimayor-900 tabular-nums">
                          {vendidas}
                          {capacidad > 0 && <span className="text-xs font-bold text-muted">/{capacidad}</span>}
                        </p>
                      </div>
                      <div className="rounded-box bg-unimayor-tint px-3 py-2">
                        <p className="text-[10px] font-bold tracking-[0.12em] text-muted uppercase">Recaudado</p>
                        <p className="text-sm font-extrabold text-unimayor-900">
                          {formatearCentavos(recaudado)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <BtnMayor
                        href={`/panel/eventos/${evento.id_evento}`}
                        variante="primary"
                        tamano="sm"
                        icono={ArrowRightIcon}
                      >
                        Gestionar
                      </BtnMayor>
                      <BtnMayor href={`/eventos/${evento.id_evento}`} variante="ghost" tamano="sm">
                        Ver público
                      </BtnMayor>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
