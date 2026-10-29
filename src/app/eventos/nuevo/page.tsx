import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { EventoForm } from "@/components/eventos/evento-form";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { usuarioActual } from "@/lib/sesion-vista";

export const metadata: Metadata = { title: "Crear evento" };
export const dynamic = "force-dynamic";

/**
 * /eventos/nuevo — crear un evento y, si se quiere, abrir su taquilla.
 * Ruta privada: el proxy exige cookie y aquí se verifica la sesión real.
 */
export default async function NuevoEventoPage() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/eventos/nuevo");

  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-unimayor-700 underline-offset-4 hover:text-unimayor-900 hover:underline"
        >
          <ArrowRightIcon size={16} className="rotate-180" aria-hidden="true" />
          Volver a la cartelera
        </Link>

        <div className="mt-5">
          <EncabezadoSeccion
            eyebrow="Cartelera · Nuevo evento"
            titulo="Publica un evento"
            descripcion="Comparte la información, define el lugar y, si lo necesitas, abre una taquilla con Stripe para vender entradas."
            como="h1"
          />
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          {usuario.nombre_rol === "ESTUDIANTE"
            ? "Como estudiante puedes publicar eventos de comunidad. Si necesitas un evento EAFI u oficial, pídele a un docente o al equipo administrativo que lo cree."
            : usuario.nombre_rol === "DOCENTE"
              ? "Como docente puedes publicar eventos EAFI de tu facultad y eventos de comunidad."
              : "Como ADMIN puedes publicar eventos oficiales, EAFI y de comunidad."}
        </p>

        <div className="mt-8">
          <EventoForm
            usuario={{
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              facultad: usuario.facultad,
              nombre_rol: usuario.nombre_rol,
            }}
          />
        </div>
      </div>
    </div>
  );
}
