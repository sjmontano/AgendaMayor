"use client";

/** Se muestra si una página falla al cargar. */
export default function ErrorPagina({ reset }: { reset: () => void }) {
  return (
    <section className="seccion">
      <div className="contenedor vacio">
        <h1>Algo salió mal</h1>
        <p>No pudimos cargar esta página. Inténtalo de nuevo.</p>
        <button className="btn btn-primario" onClick={reset}>
          Reintentar
        </button>
      </div>
    </section>
  );
}
