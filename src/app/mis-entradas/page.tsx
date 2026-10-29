import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { MapPinIcon } from "@/components/icons/map-pin";
import { Badge } from "@/components/ui/badge";
import { BtnMayor } from "@/components/ui/botones";
import { Vacio } from "@/components/ui/vacio";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { badgeOrden, etiquetaOrden } from "@/lib/design-tokens";
import { formatearCentavos, fechaHoraLarga } from "@/lib/utils";
import { usuarioActual } from "@/lib/sesion-vista";
import { listarMisEntradas } from "@/modelo/taquilla/taquilla.service";

export const metadata: Metadata = { title: "Mis entradas" };
export const dynamic = "force-dynamic";

export default async function MisEntradasPage() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/mis-entradas");

  const ordenes = await listarMisEntradas(usuario);
  const conEntradas = ordenes.filter((o) => o.entradas.length > 0 || o.estado === "PENDIENTE");

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <EncabezadoSeccion
          eyebrow="Mi cuenta · Taquilla"
          titulo="Mis entradas"
          descripcion="Aquí están las entradas que compraste o reservaste. Abre una para ver su código QR."
          accion={
            <BtnMayor href="/eventos" variante="secondary" tamano="sm" icono={ArrowRightIcon}>
              Ver cartelera
            </BtnMayor>
          }
          como="h1"
        />

        {conEntradas.length === 0 ? (
          <Vacio
            className="mt-8"
            titulo="Aún no tienes entradas"
            texto="Cuando compres o reserves una entrada, aparecerá aquí con su código QR."
            accion={
              <BtnMayor href="/eventos" variante="primary" icono={ArrowRightIcon}>
                Explorar eventos
              </BtnMayor>
            }
          />
        ) : (
          <ul className="mt-8 space-y-4">
            {conEntradas.map((orden) => {
              const enlace =
                orden.estado === "PAGADA"
                  ? `/entradas/${orden.codigo}`
                  : `/checkout/resultado?orden=${orden.codigo}`;
              return (
                <li key={orden.id_orden}>
                  <Link
                    href={enlace}
                    className="group flex flex-col gap-4 rounded-tile border border-line bg-white p-5 shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-unimayor-900/25 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={badgeOrden[orden.estado] ?? badgeOrden.PENDIENTE}>
                          {etiquetaOrden[orden.estado] ?? orden.estado}
                        </Badge>
                        <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                          Orden {orden.codigo}
                        </span>
                      </div>
                      <p className="mt-2 text-lg leading-snug font-extrabold text-unimayor-900 group-hover:underline group-hover:underline-offset-4">
                        {orden.evento.titulo}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDaysIcon size={14} aria-hidden="true" />
                          {fechaHoraLarga(orden.evento.fecha_inicio)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon size={14} aria-hidden="true" />
                          {orden.evento.es_virtual ? "Virtual" : orden.evento.lugar}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-5 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-xs text-muted">
                          {orden.entradas.length} {orden.entradas.length === 1 ? "entrada" : "entradas"}
                        </p>
                        <p className="font-extrabold text-unimayor-900">
                          {formatearCentavos(orden.total_centavos)}
                        </p>
                      </div>
                      <ArrowRightIcon
                        size={20}
                        className="text-unimayor-700 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
