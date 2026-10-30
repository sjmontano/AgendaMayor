import Link from "next/link";
import { redirect } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { verOrden } from "@/modelo/taquilla/taquilla.service";
import { usuarioActualOpcional } from "@/lib/auth";
import { formatearPrecio } from "@/lib/formato";

export const dynamic = "force-dynamic";

const MENSAJES: Record<string, { clase: string; texto: string }> = {
  PAGADA: { clase: "alerta--exito", texto: "¡Pago aprobado! Tus entradas ya están listas." },
  PENDIENTE: { clase: "alerta--info", texto: "Tu pago está en proceso. Recarga esta página en unos segundos." },
  RECHAZADA: { clase: "alerta--error", texto: "El pago fue rechazado. Puedes intentarlo de nuevo." },
  EXPIRADA: { clase: "alerta--error", texto: "El tiempo para pagar terminó. Puedes hacer una nueva compra." },
};

/** Página a la que Bold devuelve al comprador. Consulta el estado real del pago. */
export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ orden?: string }> }) {
  const { orden: codigo } = await searchParams;
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");
  if (!codigo) redirect("/mis-entradas");

  const orden = await verOrden(codigo, usuario).catch(() => null);
  if (!orden) {
    return (
      <section className="seccion">
        <div className="contenedor">
          <p className="vacio">No encontramos esa orden.</p>
        </div>
      </section>
    );
  }
  const mensaje = MENSAJES[orden.estado] ?? MENSAJES.PENDIENTE;

  return (
    <section className="seccion">
      <div className="contenedor" style={{ maxWidth: 760 }}>
        <div className="caja">
          <span className="etiqueta-superior">Orden {orden.codigo}</span>
          <h1>{orden.evento.titulo}</h1>
          <p className={`alerta ${mensaje.clase}`}>{mensaje.texto}</p>

          <table>
            <thead>
              <tr>
                <th>Entrada</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.items.map((item) => (
                <tr key={item.nombre}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatearPrecio(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total">
            <span>Total</span>
            <span>{formatearPrecio(orden.total)}</span>
          </div>
          <p>
            Estado: <Etiqueta valor={orden.estado} />
          </p>

          <div className="acciones">
            {orden.estado === "PAGADA" && (
              <Link href="/mis-entradas" className="btn btn-primario">
                Ver mis entradas
              </Link>
            )}
            {orden.estado === "PENDIENTE" && (
              <Link href={`/checkout/resultado?orden=${orden.codigo}`} className="btn btn-primario">
                Actualizar estado
              </Link>
            )}
            <Link href={`/eventos/${orden.evento.id_evento}`} className="btn btn-borde">
              Volver al evento
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
