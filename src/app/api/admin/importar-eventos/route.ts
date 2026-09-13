import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/errors';
import { getSesionActual } from '@/lib/supabase/auth.adapter';
import { obtenerUsuarioPorAuthId, requiereRol } from '@/lib/auth';
import { obtenerEventosUnimayor } from '@/lib/integraciones/unimayor-rss';
import { getSupabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/admin/importar-eventos — Importa el RSS de UNIMAYOR como EVENTO OFICIAL.
 * Solo ADMIN. Idempotente: no duplica por título.
 */
export async function POST(_request: NextRequest) {
  try {
    const sesion = await getSesionActual();
    const usuario = await obtenerUsuarioPorAuthId(sesion.userId);
    requiereRol(usuario, 'ADMIN');

    const externos = await obtenerEventosUnimayor();
    const supabase = getSupabaseServer();

    let creados = 0;
    let omitidos = 0;

    for (const ext of externos) {
      const { count } = await supabase
        .from('evento')
        .select('*', { count: 'exact', head: true })
        .eq('titulo', ext.titulo);

      if ((count ?? 0) > 0) {
        omitidos++;
        continue;
      }

      const { error } = await supabase.from('evento').insert({
        titulo: ext.titulo,
        descripcion: `${ext.descripcionTexto}\n\nFuente: ${ext.urlOrigen}`,
        tipo: 'OFICIAL',
        fecha_inicio: ext.publicadoEn ?? new Date().toISOString(),
        fecha_fin: ext.publicadoEn ?? new Date().toISOString(),
        lugar: ext.lugar ?? 'UNIMAYOR',
        es_virtual: false,
        facultad: null,
        imagen: ext.imagen,
        autor_id: usuario.id_usuario,
        activo: true,
      });

      if (!error) creados++;
    }

    return ok({ total: externos.length, creados, omitidos });
  } catch (e) {
    return err(e);
  }
}
