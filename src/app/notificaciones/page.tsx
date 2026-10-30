import { redirect } from "next/navigation";
import { ListaNotificaciones } from "@/components/notificaciones/lista-notificaciones";
import { listarPorUsuario } from "@/modelo/notificaciones/notificacion.repository";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Notificaciones del usuario (HU-10): cambios de estado de proyectos y compras. */
export default async function NotificacionesPage() {
  const usuario = await usuarioActualOpcional();
  if (!usuario) redirect("/ingresar");

  const notificaciones = await listarPorUsuario(usuario.id_usuario);

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <h1>Notificaciones</h1>
          <p>Te avisamos cuando revisan tus proyectos o se confirma una compra.</p>
        </div>
      </section>
      <section className="seccion">
        <div className="contenedor" style={{ maxWidth: 820 }}>
          <div className="caja">
            <ListaNotificaciones notificaciones={notificaciones} />
          </div>
        </div>
      </section>
    </>
  );
}
