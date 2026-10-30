import Link from "next/link";
import { notFound } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { AccionesAutor } from "@/components/proyectos/acciones-autor";
import { obtenerPorId } from "@/modelo/proyectos/proyecto.service";
import { obtenerPorProyecto } from "@/modelo/puestos/puesto.service";
import { usuarioActualOpcional } from "@/lib/auth";
import { formatearFecha } from "@/lib/formato";

export const dynamic = "force-dynamic";

/** Detalle de un proyecto (HU-08) con su puesto en la feria EAFI si lo tiene. */
export default async function ProyectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyecto = await obtenerPorId(Number(id)).catch(() => null);
  if (!proyecto || proyecto.estado === "ELIMINADO") notFound();

  // Los proyectos no publicados solo los ve su autor o un docente/admin
  const usuario = await usuarioActualOpcional();
  const esAutor = usuario?.id_usuario === proyecto.autor_id;
  const esModerador = usuario?.nombre_rol === "DOCENTE" || usuario?.nombre_rol === "ADMIN";
  if (proyecto.estado !== "PUBLICADO" && !esAutor && !esModerador) notFound();

  const puesto = await obtenerPorProyecto(proyecto.id_proyecto);

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <div className="acciones" style={{ marginBottom: "0.75rem" }}>
            <Etiqueta valor={proyecto.tipo} />
            {proyecto.estado !== "PUBLICADO" && <Etiqueta valor={proyecto.estado} />}
            {proyecto.destacado && <span className="etiqueta etiqueta--dorada">★ Destacado</span>}
          </div>
          <h1>{proyecto.titulo}</h1>
          <p>
            {proyecto.programa} · {proyecto.facultad}
          </p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor dos-columnas">
          <article className="caja">
            {proyecto.estado === "RECHAZADO" && proyecto.motivo_rechazo && (
              <p className="alerta alerta--error">Motivo del rechazo: {proyecto.motivo_rechazo}</p>
            )}
            <h2>Descripción</h2>
            <p className="texto-largo">{proyecto.descripcion}</p>

            {proyecto.fotos.length > 0 && (
              <div className="galeria">
                {proyecto.fotos.map((foto) => (
                  <img key={foto} src={foto} alt={`Imagen de ${proyecto.titulo}`} />
                ))}
              </div>
            )}

            {esAutor && <AccionesAutor idProyecto={proyecto.id_proyecto} estado={proyecto.estado} />}
          </article>

          <aside>
            <div className="caja">
              <h3>Ficha del proyecto</h3>
              <dl className="datos">
                <dt>Autor</dt>
                <dd>
                  {proyecto.autor ? (
                    <Link href={`/perfil/${proyecto.autor.username}`}>
                      {proyecto.autor.nombre} {proyecto.autor.apellido}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
                <dt>Facultad</dt>
                <dd>{proyecto.facultad}</dd>
                <dt>Programa</dt>
                <dd>{proyecto.programa}</dd>
                <dt>Registrado</dt>
                <dd>{formatearFecha(proyecto.fecha_registro)}</dd>
              </dl>
            </div>

            <div className="caja">
              <h3>Puesto en la feria EAFI</h3>
              {puesto ? (
                <dl className="datos">
                  <dt>Puesto</dt>
                  <dd>{puesto.codigo}</dd>
                  <dt>Lugar</dt>
                  <dd>
                    {puesto.edificio}, piso {puesto.piso}, {puesto.salon}
                  </dd>
                  <dt>Referencia</dt>
                  <dd>{puesto.ubicacion}</dd>
                </dl>
              ) : (
                <p className="subtitulo">Este proyecto no tiene puesto asignado.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
