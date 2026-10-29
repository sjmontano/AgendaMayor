import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { PlusIcon } from "@/components/icons/plus";
import { StampIcon } from "@/components/icons/stamp";
import { BtnMayor } from "@/components/ui/botones";
import { Tile } from "@/components/ui/tile";
import { fechaHoraLarga } from "@/lib/utils";

interface EventoResumen {
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tipos_entrada: { cantidad_vendida: number }[];
}

interface OrdenResumen {
  estado: string;
  entradas: unknown[];
  evento: { titulo: string; fecha_inicio: string; fecha_fin: string };
}

/**
 * Accesos rápidos del panel a la taquilla. Es presentacional: la página
 * (Server Component) consulta el Modelo y le pasa los datos ya listos.
 */
export function AccesosEventos({
  eventos,
  ordenes,
}: {
  eventos: EventoResumen[];
  ordenes: OrdenResumen[];
}) {
  const ahora = new Date();
  const proximoEvento = eventos
    .filter((e) => e.estado === "PUBLICADO" && new Date(e.fecha_fin) >= ahora)
    .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0];
  const entradas = ordenes.filter((o) => o.estado === "PAGADA" && o.entradas.length > 0);
  const totalEntradas = entradas.reduce((s, o) => s + o.entradas.length, 0);
  const proximaEntrada = entradas
    .filter((o) => new Date(o.evento.fecha_fin) >= ahora)
    .sort(
      (a, b) =>
        new Date(a.evento.fecha_inicio).getTime() - new Date(b.evento.fecha_inicio).getTime()
    )[0];
  const vendidas = eventos.reduce(
    (s, e) => s + e.tipos_entrada.reduce((t, tipo) => t + tipo.cantidad_vendida, 0),
    0
  );

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Tile className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-unimayor-700 uppercase">Mis eventos</p>
            <p className="mt-1 text-2xl font-extrabold text-unimayor-900 tabular-nums">
              {eventos.length}
              <span className="ml-2 text-xs font-bold text-muted">
                {eventos.length === 1 ? "evento" : "eventos"}
              </span>
            </p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-box bg-unimayor-100 text-unimayor-900">
            <CalendarDaysIcon size={20} aria-hidden="true" />
          </span>
        </div>
        {proximoEvento ? (
          <p className="mt-3 text-sm text-muted">
            <span className="font-bold text-ink">Próximo:</span> {proximoEvento.titulo} ·{" "}
            {fechaHoraLarga(proximoEvento.fecha_inicio)}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Publica un evento y, si quieres, abre su taquilla con Stripe.
          </p>
        )}
        {eventos.some((e) => e.tipos_entrada.length > 0) && (
          <p className="mt-1 text-xs font-bold text-muted">{vendidas} entradas vendidas en total</p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <BtnMayor href="/panel/eventos" variante="secondary" tamano="sm" icono={ArrowRightIcon}>
            Gestionar eventos
          </BtnMayor>
          <BtnMayor href="/eventos/nuevo" variante="ghost" tamano="sm" icono={PlusIcon}>
            Crear evento
          </BtnMayor>
        </div>
      </Tile>

      <Tile className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-unimayor-700 uppercase">Mis entradas</p>
            <p className="mt-1 text-2xl font-extrabold text-unimayor-900 tabular-nums">
              {totalEntradas}
              <span className="ml-2 text-xs font-bold text-muted">
                {totalEntradas === 1 ? "entrada" : "entradas"}
              </span>
            </p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-box bg-gold-soft text-gold-ink">
            <StampIcon size={20} aria-hidden="true" />
          </span>
        </div>
        {proximaEntrada ? (
          <p className="mt-3 text-sm text-muted">
            <span className="font-bold text-ink">Próxima:</span> {proximaEntrada.evento.titulo} ·{" "}
            {fechaHoraLarga(proximaEntrada.evento.fecha_inicio)}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Cuando compres o reserves una entrada, la verás aquí con su código QR.
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <BtnMayor href="/mis-entradas" variante="secondary" tamano="sm" icono={ArrowRightIcon}>
            Ver mis entradas
          </BtnMayor>
          <Link
            href="/eventos"
            className="inline-flex h-9 items-center px-2 text-[13px] font-bold text-unimayor-700 underline-offset-4 hover:text-unimayor-900 hover:underline"
          >
            Explorar cartelera
          </Link>
        </div>
      </Tile>
    </div>
  );
}
