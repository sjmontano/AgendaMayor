import { redirect } from "next/navigation";
import { EventoForm } from "@/components/eventos/evento-form";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Crear evento (HU-11). Los tipos permitidos dependen del rol. */
export default async function NuevoEventoPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

  // Mismas reglas del service (patrón Strategy), aquí solo para mostrar las opciones
  const tiposPermitidos =
    usuario.nombre_rol === "ADMIN"
      ? ["OFICIAL", "EAFI", "COMUNIDAD"]
      : usuario.nombre_rol === "DOCENTE"
        ? ["EAFI", "COMUNIDAD"]
        : ["COMUNIDAD"];

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <h1>Crear evento</h1>
          <p>Publica un evento en la cartelera. Si quieres, puedes vender entradas con Bold.</p>
        </div>
      </section>
      <section className="seccion">
        <div className="contenedor" style={{ maxWidth: 820 }}>
          <div className="caja">
            <EventoForm tiposPermitidos={tiposPermitidos} facultadUsuario={usuario.facultad ?? ""} />
          </div>
        </div>
      </section>
    </>
  );
}
