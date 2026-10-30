import Link from "next/link";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";

interface Props {
  usuario: { username: string; rol: string } | null;
  noLeidas: number;
}

/** Barra de navegación. En celular el menú se abre con <details> (sin JavaScript). */
export function Navbar({ usuario, noLeidas }: Props) {
  const enlaces = (
    <>
      <Link href="/proyectos">Proyectos</Link>
      <Link href="/eventos">Eventos</Link>
      {usuario ? (
        <>
          <Link href="/panel">Mi panel</Link>
          <Link href="/mis-entradas">Mis entradas</Link>
          <Link href="/notificaciones" className="campana" aria-label="Notificaciones">
            Notificaciones
            {noLeidas > 0 && <span className="contador">{noLeidas}</span>}
          </Link>
          <Link href={`/perfil/${usuario.username}`}>@{usuario.username}</Link>
          <BotonCerrarSesion />
        </>
      ) : (
        <>
          <Link href="/ingresar">Ingresar</Link>
          <Link href="/registro" className="btn btn-dorado btn-pequeno">
            Crear cuenta
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="contenedor">
        <Link href="/" className="logo">
          <img src="/brand/escudo-unimayor.png" alt="" />
          <span>
            Agenda Mayor
            <small>Colegio Mayor del Cauca</small>
          </span>
        </Link>

        <nav className="menu">{enlaces}</nav>

        <details className="menu-movil">
          <summary>Menú</summary>
          <nav>{enlaces}</nav>
        </details>
      </div>
    </header>
  );
}
