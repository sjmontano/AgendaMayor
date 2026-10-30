import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { diaYMes, formatearFechaHora } from "@/lib/formato";

export interface EventoTarjeta {
  id_evento: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  lugar: string;
  es_virtual: boolean;
  imagen: string | null;
  permite_entradas: boolean;
}

export function EventoCard({ evento }: { evento: EventoTarjeta }) {
  const { dia, mes } = diaYMes(evento.fecha_inicio);

  return (
    <Link href={`/eventos/${evento.id_evento}`} className="tarjeta">
      <div className="tarjeta-imagen">
        {evento.imagen ? (
          <img src={evento.imagen} alt="" />
        ) : (
          <span className="fecha-bloque">
            <strong>{dia}</strong>
            <span>{mes}</span>
          </span>
        )}
      </div>
      <div className="tarjeta-cuerpo">
        <div className="acciones">
          <Etiqueta valor={evento.tipo} />
          {evento.permite_entradas && <span className="etiqueta etiqueta--dorada">Entradas</span>}
        </div>
        <h3>{evento.titulo}</h3>
        <p className="recortar">{evento.descripcion}</p>
        <div className="tarjeta-pie">
          <span>{evento.es_virtual ? "Virtual" : evento.lugar}</span>
          <span>{formatearFechaHora(evento.fecha_inicio)}</span>
        </div>
      </div>
    </Link>
  );
}
