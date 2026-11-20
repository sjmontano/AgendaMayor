import { redirect } from "next/navigation";
import { EstadoOrden } from "@/components/eventos/estado-orden";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Página de la orden: aquí espera el comprador mientras paga en Bold (otra pestaña)
 * y aquí lo devuelve Bold al terminar. El estado lo consulta el navegador a la API.
 */
export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ orden?: string }> }) {
  const { orden: codigo } = await searchParams;
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");
  if (!codigo) redirect("/mis-entradas");

  return (
    <section className="seccion">
      <div className="contenedor" style={{ maxWidth: 760 }}>
        <EstadoOrden codigo={codigo} />
      </div>
    </section>
  );
}
