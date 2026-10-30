import Link from "next/link";
import { notFound } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { CompraEntradas } from "@/components/eventos/compra-entradas";
import { obtenerDetalle } from "@/modelo/eventos/evento.service";
import { usuarioActualOpcional } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/formato";

export const dynamic = "force-dynamic";

/** Detalle del evento y, si vende entradas, el carrito de compra. */
export default async function EventoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await obtenerDetalle(Number(id)).catch(() => null);
  if (!evento) notFound();

  const usuario = await usuarioActualOpcional();
  const terminado = new Date(evento.fecha_fin) < new Date();

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <div className="acciones" style={{ marginBottom: "0.75rem" }}>
            <Etiqueta valor={evento.tipo} />
            {evento.edicion && <span className="etiqueta etiqueta--dorada">{evento.edicion}</span>}
          </div>
          <h1>{evento.titulo}</h1>
          <p>
            {formatearFechaHora(evento.fecha_inicio)} · {evento.es_virtual ? "Virtual" : evento.lugar}
          </p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor dos-columnas">
          <article className="caja">
            {evento.imagen && (
              <img src={evento.imagen} alt="" style={{ borderRadius: 10, marginBottom: "1.5rem" }} />
            )}
            <h2>Acerca del evento</h2>
            <p className="texto-largo">{evento.descripcion}</p>
            <dl className="datos">
              <dt>Inicia</dt>
              <dd>{formatearFechaHora(evento.fecha_inicio)}</dd>
              <dt>Termina</dt>
              <dd>{formatearFechaHora(evento.fecha_fin)}</dd>
              <dt>Lugar</dt>
              <dd>
                {evento.es_virtual && evento.url_virtual ? (
                  <a href={evento.url_virtual} target="_blank" rel="noreferrer">
                    Enlace de conexión
                  </a>
                ) : (
                  evento.lugar
                )}
              </dd>
              {evento.facultad && (
                <>
                  <dt>Facultad</dt>
                  <dd>{evento.facultad}</dd>
                </>
              )}
              <dt>Organiza</dt>
              <dd>
                <Link href={`/perfil/${evento.autor.username}`}>
                  {evento.autor.nombre} {evento.autor.apellido}
                </Link>
              </dd>
            </dl>
          </article>

          <aside className="caja">
            <h3>Entradas</h3>
            {!evento.permite_entradas ? (
              <p className="subtitulo">Este evento es de entrada libre, no requiere boleta.</p>
            ) : terminado ? (
              <p className="alerta alerta--info">Este evento ya terminó.</p>
            ) : !usuario ? (
              <>
                <p className="subtitulo">Inicia sesión para comprar tus entradas.</p>
                <Link href="/ingresar" className="btn btn-primario btn-bloque">
                  Ingresar
                </Link>
              </>
            ) : (
              <CompraEntradas
                eventoId={evento.id_evento}
                maxPorCompra={evento.max_por_compra}
                tipos={evento.tiposEntrada}
              />
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
