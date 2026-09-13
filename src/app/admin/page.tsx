import Link from "next/link";
import { apiGet, headersConSesion } from "@/lib/api";
import { AccionesModeracion, BotonImportar } from "@/components/admin/moderacion";
import { GestionPuestos } from "@/components/admin/puestos";

/**
 * Panel /admin — Vista (capa de Presentación).
 * Consume /api/admin/* con las cookies de sesión reenviadas.
 * 401/403 → mensaje de acceso denegado (no redirección muda).
 */
interface Pendiente {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  facultad: string;
  programa: string;
  tipo: string;
  autor: { username: string; nombre: string; apellido: string } | null;
}

export default async function AdminPage() {
  let pendientes: Pendiente[] = [];
  let denegado = false;

  try {
    pendientes = await apiGet<Pendiente[]>("/api/admin/proyectos?estado=EN_REVISION", {
      headers: await headersConSesion(),
    });
  } catch {
    denegado = true;
  }

  if (denegado) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#004884]">Acceso denegado</h1>
        <p className="mt-2 text-sm">Esta sección es solo para docentes y administradores.</p>
        <Link href="/ingresar" className="mt-4 inline-block font-bold text-[#195a90] underline-offset-4 hover:underline">
          Ingresar →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Administración</p>
      <h1 className="mt-1 text-4xl font-extrabold text-[#004884]">Panel</h1>

      <section className="mt-8" aria-label="Moderación">
        <h2 className="text-xl font-bold">Pendientes de revisión ({pendientes.length})</h2>
        {pendientes.length === 0 ? (
          <p className="mt-4 rounded-[10px] border-2 border-[#E4E4E7] bg-[#f8fbfd] p-6 text-sm">
            No hay proyectos por revisar.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pendientes.map((p) => (
              <li key={p.id_proyecto} className="rounded-[10px] border-2 border-[#E4E4E7] bg-white p-5">
                <Link href={`/proyectos/${p.id_proyecto}`} className="text-lg font-bold hover:text-[#004884] hover:underline underline-offset-4">
                  {p.titulo}
                </Link>
                <p className="text-sm text-zinc-600">
                  {p.autor ? `@${p.autor.username}` : "—"} · {p.facultad} · {p.tipo}
                </p>
                <AccionesModeracion id={p.id_proyecto} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-label="Integración UNIMAYOR">
        <h2 className="text-xl font-bold">Eventos del portal</h2>
        <div className="mt-4">
          <BotonImportar />
        </div>
      </section>

      <section className="mt-10" aria-label="Puestos EAFI">
        <h2 className="text-xl font-bold">Puestos (mesas EAFI)</h2>
        <div className="mt-4">
          <GestionPuestos />
        </div>
      </section>
    </div>
  );
}
