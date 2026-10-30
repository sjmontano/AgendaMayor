import { notFound } from "next/navigation";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { EditarPerfil } from "@/components/perfil/editar-perfil";
import { obtenerPerfilPublico } from "@/modelo/usuarios/usuario.service";
import { listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { usuarioActualOpcional } from "@/lib/auth";
import { iniciales } from "@/lib/formato";

export const dynamic = "force-dynamic";

/** Perfil público (HU-04). Si es el propio perfil, permite completarlo (HU-03). */
export default async function PerfilPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const perfil = await obtenerPerfilPublico(username).catch(() => null);
  if (!perfil) notFound();

  const [{ data: proyectos }, usuario] = await Promise.all([
    listarPublicados({ autor: username, page: 1, limit: 50 }),
    usuarioActualOpcional(),
  ]);
  const esPropio = usuario?.username === perfil.username;

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor perfil-cabecera">
          {perfil.avatar ? (
            <img className="avatar" src={perfil.avatar} alt="" />
          ) : (
            <div className="avatar">{iniciales(perfil.nombre, perfil.apellido)}</div>
          )}
          <div>
            <span className="etiqueta etiqueta--dorada">{perfil.rol}</span>
            <h1 style={{ marginTop: "0.5rem" }}>
              {perfil.nombre} {perfil.apellido}
            </h1>
            <p>
              @{perfil.username}
              {perfil.programa && ` · ${perfil.programa}`}
              {perfil.semestre && ` · Semestre ${perfil.semestre}`}
            </p>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor dos-columnas">
          <div>
            <div className="titulo-seccion">
              <h2>Proyectos publicados</h2>
            </div>
            {proyectos.length === 0 ? (
              <p className="vacio">Aún no tiene proyectos publicados.</p>
            ) : (
              <div className="grilla">
                {proyectos.map((p) => (
                  <ProyectoCard key={p.id_proyecto} proyecto={p} />
                ))}
              </div>
            )}
          </div>

          <aside className="caja">
            <h3>Sobre mí</h3>
            <p>{perfil.bio ?? "Sin descripción."}</p>
            <dl className="datos">
              <dt>Facultad</dt>
              <dd>{perfil.facultad ?? "—"}</dd>
              <dt>Semillero</dt>
              <dd>{perfil.semillero ?? "—"}</dd>
            </dl>
            {esPropio && <EditarPerfil perfil={perfil} />}
          </aside>
        </div>
      </section>
    </>
  );
}
