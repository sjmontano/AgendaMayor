import { ok, err } from "@/lib/errors";
import { getSesionDesdeCookies } from "@/lib/sesion";
import { obtenerUsuarioPorId, requiereRol } from "@/lib/auth";
import { obtenerEventosUnimayor } from "@/lib/integraciones/unimayor-rss";
import { crear, contarPorTitulo } from "@/modelo/eventos/evento.repository";

/**
 * POST /api/admin/importar-eventos — Importa el RSS de UNIMAYOR como EVENTO OFICIAL.
 * Solo ADMIN. Idempotente: no duplica por título.
 */
export async function POST() {
  try {
    const sesion = await getSesionDesdeCookies();
    const usuario = await obtenerUsuarioPorId(Number(sesion.userId));
    requiereRol(usuario, "ADMIN");

    const externos = await obtenerEventosUnimayor();

    let creados = 0;
    let omitidos = 0;

    for (const ext of externos) {
      if ((await contarPorTitulo(ext.titulo)) > 0) {
        omitidos++;
        continue;
      }

      // La fecha del RSS viene en formato libre (RFC 2822): normalizar a ISO.
      const fecha =
        ext.publicadoEn && !Number.isNaN(Date.parse(ext.publicadoEn))
          ? new Date(ext.publicadoEn).toISOString()
          : new Date().toISOString();

      await crear({
        titulo: ext.titulo,
        descripcion: `${ext.descripcionTexto}\n\nFuente: ${ext.urlOrigen}`,
        tipo: "OFICIAL",
        fecha_inicio: fecha,
        fecha_fin: fecha,
        lugar: ext.lugar ?? "UNIMAYOR",
        es_virtual: false,
        url_virtual: null,
        facultad: null,
        edicion: null,
        imagen: ext.imagen,
        autor_id: usuario.id_usuario,
      });

      creados++;
    }

    return ok({ total: externos.length, creados, omitidos });
  } catch (e) {
    return err(e);
  }
}
