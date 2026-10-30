import { redirect } from "next/navigation";
import { PublicarForm } from "@/components/proyectos/publicar-form";
import { usuarioActualOpcional } from "@/lib/auth";
import { listarEafi } from "@/modelo/eventos/evento.repository";

export const dynamic = "force-dynamic";

/** Publicar proyecto (HU-06). Requiere sesión. */
export default async function NuevoProyectoPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

  const eventosEafi = (await listarEafi()).map((e) => ({ id: e.id_evento, titulo: e.titulo }));

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <h1>Publicar proyecto</h1>
          <p>Tu proyecto quedará en revisión hasta que un docente de tu facultad lo apruebe.</p>
        </div>
      </section>
      <section className="seccion">
        <div className="contenedor" style={{ maxWidth: 820 }}>
          <div className="caja">
            <PublicarForm facultadInicial={usuario.facultad ?? ""} eventosEafi={eventosEafi} />
          </div>
        </div>
      </section>
    </>
  );
}
