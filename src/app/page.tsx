import Link from "next/link";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { EventoCard } from "@/components/eventos/evento-card";
import { listarDestacados } from "@/modelo/proyectos/proyecto.service";
import { listarProximos } from "@/modelo/eventos/evento.service";
import { listarActivos as listarAvisos } from "@/modelo/avisos/aviso.repository";
import { formatearFecha } from "@/lib/formato";

export const dynamic = "force-dynamic";

/** Página de inicio: presentación, accesos, proyectos destacados, eventos y avisos. */
export default async function InicioPage() {
  const [proyectos, eventos, avisos] = await Promise.all([
    listarDestacados(6),
    listarProximos(3),
    listarAvisos(),
  ]);

  return (
    <>
      <section className="hero">
        <div className="contenedor">
          <div>
            <span className="etiqueta-superior">Colegio Mayor del Cauca</span>
            <h1>
              Lo que crean nuestros estudiantes, <span>en un solo lugar</span>
            </h1>
            <p>
              Descubre los proyectos de las facultades, revisa la cartelera de eventos y compra tus
              entradas para las actividades de la institución.
            </p>
            <div className="acciones">
              <Link href="/proyectos" className="btn btn-dorado">
                Ver proyectos
              </Link>
              <Link href="/eventos" className="btn btn-borde">
                Ver eventos
              </Link>
            </div>
          </div>
          <div className="hero-cifras">
            <div className="cifra">
              <strong>4</strong>
              <span>Facultades participando</span>
            </div>
            <div className="cifra">
              <strong>{proyectos.length}</strong>
              <span>Proyectos destacados</span>
            </div>
            <div className="cifra">
              <strong>{eventos.length}</strong>
              <span>Eventos próximos</span>
            </div>
            <div className="cifra">
              <strong>EAFI</strong>
              <span>Feria de proyectos</span>
            </div>
          </div>
        </div>
      </section>

      <div className="contenedor">
        <div className="accesos">
          <Link href="/proyectos" className="acceso">
            Vitrina <small>Proyectos publicados</small>
          </Link>
          <Link href="/eventos" className="acceso">
            Cartelera <small>Eventos y entradas</small>
          </Link>
          <Link href="/proyectos/nuevo" className="acceso">
            Publicar <small>Comparte tu proyecto</small>
          </Link>
          <Link href="/panel" className="acceso">
            Mi panel <small>Según tu rol</small>
          </Link>
        </div>
      </div>

      {avisos.length > 0 && (
        <section className="seccion">
          <div className="contenedor">
            <div className="titulo-seccion">
              <h2>Avisos</h2>
            </div>
            <div className="grilla">
              {avisos.map((aviso) => (
                <article key={aviso.id_aviso} className="aviso">
                  <h3>{aviso.titulo}</h3>
                  <p>{aviso.texto}</p>
                  <small>{formatearFecha(aviso.fecha)}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="seccion">
        <div className="contenedor">
          <div className="titulo-seccion">
            <div>
              <h2>Proyectos destacados</h2>
              <p className="subtitulo">Seleccionados por los docentes de cada facultad.</p>
            </div>
            <Link href="/proyectos" className="btn btn-borde btn-pequeno">
              Ver todos
            </Link>
          </div>
          {proyectos.length === 0 ? (
            <p className="vacio">Todavía no hay proyectos publicados.</p>
          ) : (
            <div className="grilla">
              {proyectos.map((p) => (
                <ProyectoCard key={p.id_proyecto} proyecto={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="seccion seccion--gris">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2>¿Cómo publicar tu proyecto?</h2>
          </div>
          <div className="pasos">
            <div className="paso">
              <h3>Crea tu cuenta</h3>
              <p>Con tu correo institucional @unimayor.edu.co.</p>
            </div>
            <div className="paso">
              <h3>Publica</h3>
              <p>Describe tu proyecto, facultad y programa.</p>
            </div>
            <div className="paso">
              <h3>Revisión docente</h3>
              <p>Un docente de tu facultad lo aprueba o te indica qué mejorar.</p>
            </div>
            <div className="paso">
              <h3>¡En la vitrina!</h3>
              <p>Tu proyecto queda visible para toda la comunidad.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="titulo-seccion">
            <h2>Próximos eventos</h2>
            <Link href="/eventos" className="btn btn-borde btn-pequeno">
              Ver cartelera
            </Link>
          </div>
          {eventos.length === 0 ? (
            <p className="vacio">No hay eventos próximos.</p>
          ) : (
            <div className="grilla">
              {eventos.map((e) => (
                <EventoCard key={e.id_evento} evento={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
