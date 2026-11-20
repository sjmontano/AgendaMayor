import { redirect } from "next/navigation";
import { ListaEntradas } from "@/components/eventos/lista-entradas";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Entradas compradas por el usuario. El código se presenta en la puerta del evento. */
export default async function MisEntradasPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

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
          <ListaEntradas />
        </div>
      </section>
    </>
  );
}
