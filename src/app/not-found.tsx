import Link from "next/link";

export default function NoEncontrado() {
  return (
    <section className="seccion">
      <div className="contenedor vacio">
        <h1>Página no encontrada</h1>
        <p>Lo que buscas no existe o ya no está disponible.</p>
        <Link href="/" className="btn btn-primario">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
