import Link from "next/link";
import { EventoCard } from "@/components/eventos/evento-card";
import { listarActivos } from "@/modelo/eventos/evento.repository";
import { obtenerEventosUnimayor } from "@/lib/integraciones/unimayor-rss";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Cartelera de eventos (propios + noticias del portal UNIMAYOR por RSS). */
export default async function EventosPage() {
  const [{ data: eventos }, delPortal, usuario] = await Promise.all([
    listarActivos({ page: 1, limit: 50 }),
    obtenerEventosUnimayor().catch(() => []), // si el portal falla, la página sigue funcionando
    usuarioActualOpcional(),
  ]);

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <span className="etiqueta-superior" style={{ color: "var(--dorado)" }}>
            Cartelera
          </span>
          <h1>Eventos</h1>
          <p>Eventos oficiales, ferias EAFI y actividades de la comunidad. Algunos venden entradas.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2>Eventos en Agenda Mayor</h2>
            {usuario && (
              <Link href="/eventos/nuevo" className="btn btn-dorado btn-pequeno">
                + Crear evento
              </Link>
            )}
          </div>
          {eventos.length === 0 ? (
            <p className="vacio">No hay eventos publicados.</p>
          ) : (
            <div className="grilla">
              {eventos.map((e) => (
                <EventoCard key={e.id_evento} evento={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {delPortal.length > 0 && (
        <section className="seccion seccion--gris">
          <div className="contenedor">
            <div className="titulo-seccion">
              <div>
                <h2>Desde el portal UNIMAYOR</h2>
                <p className="subtitulo">Publicaciones recientes de unimayor.edu.co.</p>
              </div>
            </div>
            <div className="grilla">
              {delPortal.slice(0, 6).map((e) => (
                <a key={e.urlOrigen} href={e.urlOrigen} target="_blank" rel="noreferrer" className="tarjeta">
                  <div className="tarjeta-imagen">{e.imagen ? <img src={e.imagen} alt="" /> : "U"}</div>
                  <div className="tarjeta-cuerpo">
                    <span className="etiqueta">Portal institucional</span>
                    <h3>{e.titulo}</h3>
                    <p className="recortar">{e.descripcionTexto}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
