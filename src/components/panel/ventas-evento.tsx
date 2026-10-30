import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { formatearFechaHora, formatearPrecio } from "@/lib/formato";

interface VentasEvento {
  id_evento: number;
  titulo: string;
  fecha_inicio: string;
  tipos: { nombre: string; precio: number; vendidas: number; total: number }[];
  recaudado: number;
  entradas: { codigo: string; asistente: string; correo: string; tipo: string; estado: string }[];
}

/**
 * Ventas de un evento para su organizador: resumen por tipo de entrada
 * y la lista de entradas vendidas. La lista se despliega con <details> (sin JavaScript).
 */
export function VentasEvento({ evento }: { evento: VentasEvento }) {
  const vendidas = evento.tipos.reduce((suma, t) => suma + t.vendidas, 0);
  const usadas = evento.entradas.filter((e) => e.estado === "USADA").length;

  return (
    <article className="caja">
      <div className="titulo-seccion" style={{ marginBottom: "1rem" }}>
        <div>
          <h3>
            <Link href={`/eventos/${evento.id_evento}`}>{evento.titulo}</Link>
          </h3>
          <p className="subtitulo">{formatearFechaHora(evento.fecha_inicio)}</p>
        </div>
        <div className="acciones">
          <span className="etiqueta">{vendidas} vendidas</span>
          <span className="etiqueta etiqueta--USADA">{usadas} ingresaron</span>
          <span className="etiqueta etiqueta--PAGADA">Recaudado {formatearPrecio(evento.recaudado)}</span>
        </div>
      </div>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Tipo de entrada</th>
              <th>Precio</th>
              <th>Vendidas</th>
              <th>Disponibles</th>
            </tr>
          </thead>
          <tbody>
            {evento.tipos.map((t) => (
              <tr key={t.nombre}>
                <td>{t.nombre}</td>
                <td>{formatearPrecio(t.precio)}</td>
                <td>
                  {t.vendidas} de {t.total}
                </td>
                <td>{t.total - t.vendidas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details style={{ marginTop: "1rem" }}>
        <summary className="btn btn-borde btn-pequeno">Ver asistentes ({evento.entradas.length})</summary>
        {evento.entradas.length === 0 ? (
          <p className="vacio" style={{ marginTop: "1rem" }}>
            Todavía no se han vendido entradas.
          </p>
        ) : (
          <div className="tabla-contenedor" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asistente</th>
                  <th>Correo</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {evento.entradas.map((e) => (
                  <tr key={e.codigo}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <code>{e.codigo}</code>
                    </td>
                    <td>{e.asistente}</td>
                    <td>{e.correo}</td>
                    <td>{e.tipo}</td>
                    <td>
                      <Etiqueta valor={e.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </article>
  );
}
