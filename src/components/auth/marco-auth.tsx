/** Diseño compartido de ingresar y registro: panel azul a la izquierda y formulario a la derecha. */
export function MarcoAuth({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="auth">
      <div className="auth-lado">
        <span className="etiqueta-superior" style={{ color: "var(--dorado)" }}>
          Agenda Mayor
        </span>
        <h2>Tu proyecto merece ser visto</h2>
        <p>
          Publica tus proyectos, recibe el aval de tus docentes y participa en los eventos de la
          institución con tu cuenta @unimayor.edu.co.
        </p>
      </div>
      <div className="auth-form">
        <h1>{titulo}</h1>
        {children}
      </div>
    </section>
  );
}
