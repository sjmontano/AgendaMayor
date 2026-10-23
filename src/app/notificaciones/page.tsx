import type { Metadata } from "next";
import { CentroNotificaciones } from "@/components/notificaciones/centro-notificaciones";
import { EncabezadoSeccion } from "@/components/ui/seccion";

export const metadata: Metadata = { title: "Notificaciones" };

/** /notificaciones — HU-15. Ruta privada (proxy.ts). */
export default function NotificacionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <EncabezadoSeccion
        como="h1"
        eyebrow="Tu actividad"
        titulo="Notificaciones"
        descripcion="Resultados de revisión de tus proyectos y avisos de la plataforma."
      />
      <div className="mt-8">
        <CentroNotificaciones />
      </div>
    </div>
  );
}
