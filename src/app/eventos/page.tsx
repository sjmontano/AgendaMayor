import type { Metadata } from "next";
import { PlusIcon } from "@/components/icons/plus";
import { listarActivos as listarEventosDb } from "@/modelo/eventos/evento.repository";
import { aResumenPublico } from "@/modelo/eventos/evento.service";
import { obtenerEventosUnimayor } from "@/lib/integraciones/unimayor-rss";
import { Cartelera } from "@/components/eventos/cartelera";
import type { EventoRssData } from "@/components/eventos/evento-card";
import { BtnMayor } from "@/components/ui/botones";
import { EncabezadoSeccion } from "@/components/ui/seccion";
import { usuarioActual } from "@/lib/sesion-vista";

export const metadata: Metadata = { title: "Cartelera de eventos" };
export const dynamic = "force-dynamic";

/**
 * Cartelera /eventos — HU-09. Eventos de la BD + publicaciones en vivo del RSS
 * de UNIMAYOR (server-side, caché 1h en el módulo de integración).
 */
export default async function EventosPage() {
  const [db, rss, usuario] = await Promise.all([
    listarEventosDb({ page: 1, limit: 48 }).catch(() => null),
    obtenerEventosUnimayor().catch(() => []),
    usuarioActual(),
  ]);
  const eventos = db ? db.data.map(aResumenPublico) : [];
  const portal: EventoRssData[] = rss.map((e, i) => ({ ...e, id_rss: i }));

  return (
    <>
      <section className="border-b border-line bg-unimayor-tint">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6">
          <EncabezadoSeccion
            como="h1"
            eyebrow="Cartelera"
            titulo="Eventos académicos"
            descripcion="Eventos oficiales, ferias EAFI, actividades de la comunidad y lo último del portal institucional."
            accion={
              usuario ? (
                <BtnMayor href="/eventos/nuevo" variante="gold" icono={PlusIcon}>
                  Crear evento
                </BtnMayor>
              ) : (
                <BtnMayor href="/ingresar?siguiente=/eventos/nuevo" variante="secondary">
                  Publicar un evento
                </BtnMayor>
              )
            }
          />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Cartelera eventos={eventos} portal={portal} />
      </div>
    </>
  );
}
