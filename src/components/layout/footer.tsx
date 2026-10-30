import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor">
        <div>
          <img src="/brand/logo_blanco.png" alt="Colegio Mayor del Cauca" />
          <p>
            Agenda Mayor es la vitrina de proyectos estudiantiles y la cartelera de eventos de la
            Institución Universitaria Colegio Mayor del Cauca.
          </p>
        </div>
        <div>
          <h3>Explorar</h3>
          <Link href="/proyectos">Vitrina de proyectos</Link>
          <Link href="/eventos">Cartelera de eventos</Link>
          <Link href="/proyectos/nuevo">Publicar proyecto</Link>
        </div>
        <div>
          <h3>Institución</h3>
          <a href="https://www.unimayor.edu.co" target="_blank" rel="noreferrer">
            unimayor.edu.co
          </a>
          <span>Popayán, Cauca — Colombia</span>
        </div>
      </div>
      <p className="footer-copy">
        Proyecto académico · Arquitectura de Software · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
