import Link from "next/link";
import { redirect } from "next/navigation";
import { Etiqueta } from "@/components/ui/etiqueta";
import { misEntradas } from "@/modelo/taquilla/taquilla.service";
import { usuarioActualOpcional } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/formato";

export const dynamic = "force-dynamic";

/** Entradas compradas por el usuario. El código se presenta en la puerta del evento. */
export default async function MisEntradasPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

  const entradas = await misEntradas(usuario);

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <h1>Mis entradas</h1>
          <p>Presenta el código de cada entrada en el ingreso del evento.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor" style={{ display: "grid", gap: "1.25rem" }}>
          {entradas.length === 0 ? (
            <p className="vacio">
              Todavía no tienes entradas. <Link href="/eventos">Explora la cartelera</Link>.
            </p>
          ) : (
            entradas.map((entrada) => (
              <article key={entrada.codigo} className="ticket">
                <div className="ticket-info">
                  <Etiqueta valor={entrada.estado} />
                  <h3 style={{ marginTop: "0.5rem" }}>
                    <Link href={`/eventos/${entrada.evento.id_evento}`}>{entrada.evento.titulo}</Link>
                  </h3>
                  <p className="subtitulo">
                    {entrada.nombre_tipo} · {formatearFechaHora(entrada.evento.fecha_inicio)} · {entrada.evento.lugar}
                  </p>
                </div>
                <div className="ticket-codigo">
                  <small>Código</small>
                  <code>{entrada.codigo}</code>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
