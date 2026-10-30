import Link from "next/link";
import { redirect } from "next/navigation";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { Moderacion } from "@/components/panel/moderacion";
import { ValidarEntrada } from "@/components/panel/validar-entrada";
import { Puestos } from "@/components/panel/puestos";
import { ImportarEventos } from "@/components/panel/importar-eventos";
import { usuarioActualOpcional } from "@/lib/auth";
import { listarMios, colaDeRevision, listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { listar as listarPuestos } from "@/modelo/puestos/puesto.service";
import { listarEafi } from "@/modelo/eventos/evento.repository";

export const dynamic = "force-dynamic";

/**
 * Panel según el rol:
 *  - Todos: mis proyectos.
 *  - DOCENTE y ADMIN: cola de revisión y validación de entradas.
 *  - ADMIN: puestos de la feria EAFI e importación de eventos del portal.
 */
export default async function PanelPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

  const esModerador = usuario.nombre_rol === "DOCENTE" || usuario.nombre_rol === "ADMIN";
  const esAdmin = usuario.nombre_rol === "ADMIN";

  const misProyectos = await listarMios(usuario.id_usuario);
  // El docente solo revisa su facultad; el admin revisa todas
  const cola = esModerador
    ? await colaDeRevision(usuario.nombre_rol === "DOCENTE" ? usuario.facultad : null)
    : [];

  const datosAdmin = esAdmin
    ? await Promise.all([listarPuestos(), listarEafi(), listarPublicados({ page: 1, limit: 50 })])
    : null;

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <span className="etiqueta etiqueta--dorada">{usuario.nombre_rol}</span>
          <h1 style={{ marginTop: "0.5rem" }}>Hola, {usuario.nombre}</h1>
          <p>
            {esAdmin
              ? "Revisas proyectos de todas las facultades, administras los puestos EAFI y validas entradas."
              : esModerador
                ? "Revisas los proyectos de tu facultad y validas entradas en tus eventos."
                : "Aquí ves el estado de tus proyectos y puedes publicar uno nuevo."}
          </p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2>Mis proyectos</h2>
            <div className="acciones">
              <Link href="/proyectos/nuevo" className="btn btn-dorado btn-pequeno">
                + Publicar proyecto
              </Link>
              <Link href="/eventos/nuevo" className="btn btn-borde btn-pequeno">
                + Crear evento
              </Link>
            </div>
          </div>
          {misProyectos.length === 0 ? (
            <p className="vacio">Aún no has publicado proyectos.</p>
          ) : (
            <div className="grilla">
              {misProyectos.map((p) => (
                <ProyectoCard key={p.id_proyecto} proyecto={p} mostrarEstado />
              ))}
            </div>
          )}
        </div>
      </section>

      {esModerador && (
        <section className="seccion seccion--gris">
          <div className="contenedor dos-columnas">
            <div>
              <div className="titulo-seccion">
                <div>
                  <h2>Cola de revisión</h2>
                  <p className="subtitulo">
                    {usuario.nombre_rol === "DOCENTE" ? `Proyectos de ${usuario.facultad}` : "Todas las facultades"}
                  </p>
                </div>
              </div>
              <Moderacion proyectos={cola} />
            </div>
            <div className="caja">
              <h3>Validar entrada</h3>
              <p className="subtitulo">Escribe el código que presenta el asistente en la puerta.</p>
              <ValidarEntrada />
            </div>
          </div>
        </section>
      )}

      {datosAdmin && (
        <section className="seccion">
          <div className="contenedor">
            <div className="titulo-seccion">
              <h2>Puestos feria EAFI</h2>
              <ImportarEventos />
            </div>
            <Puestos
              puestos={datosAdmin[0]}
              eventos={datosAdmin[1].map((e) => ({ id: e.id_evento, titulo: e.titulo }))}
              proyectos={datosAdmin[2].data.map((p) => ({ id: p.id_proyecto, titulo: p.titulo }))}
            />
          </div>
        </section>
      )}
    </>
  );
}
