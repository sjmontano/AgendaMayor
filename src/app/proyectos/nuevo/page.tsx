import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicarForm } from "@/components/proyectos/publicar-form";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { usuarioActual } from "@/lib/sesion-vista";
import { obtenerPerfilPublico } from "@/modelo/usuarios/usuario.service";

export const metadata: Metadata = { title: "Publicar proyecto" };

/** /proyectos/nuevo — HU-06. Ruta privada; precarga facultad/programa del perfil. */
export default async function NuevoProyectoPage() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/proyectos/nuevo");
  const perfil = await obtenerPerfilPublico(usuario.username).catch(() => null);

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <EncabezadoSeccion
          como="h1"
          eyebrow="Publicar"
          titulo="Nuevo proyecto"
          descripcion="Cuatro pasos y queda en revisión. Puedes salir cuando quieras: guardamos tu borrador."
        />
        <div className="mt-8">
          <PublicarForm
            autor={{
              username: usuario.username,
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              facultad: perfil?.facultad ?? usuario.facultad,
              programa: perfil?.programa ?? null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
