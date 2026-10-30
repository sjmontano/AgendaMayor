import Link from "next/link";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { listarPublicados } from "@/modelo/proyectos/proyecto.service";
import { ProyectoQuerySchema } from "@/modelo/proyectos/proyecto.dto";
import { FACULTADES } from "@/lib/facultades";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; facultad?: string; tipo?: string; page?: string }>;
}

/**
 * Vitrina de proyectos (HU-07). Los filtros son un formulario GET normal:
 * al enviarlo, los valores viajan en la URL y la página se vuelve a generar.
 */
export default async function ProyectosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filtros = ProyectoQuerySchema.parse({
    q: params.q || undefined,
    facultad: params.facultad || undefined,
    tipo: params.tipo || undefined,
    page: params.page ?? 1,
    limit: 12,
  });
  const { data: proyectos, total } = await listarPublicados(filtros);
  const totalPaginas = Math.max(1, Math.ceil(total / filtros.limit));

  // Mantiene los filtros al cambiar de página
  function urlPagina(pagina: number) {
    const query = new URLSearchParams({ ...params, page: String(pagina) } as Record<string, string>);
    return `/proyectos?${query.toString()}`;
  }

  return (
    <>
      <section className="encabezado-pagina">
        <div className="contenedor">
          <span className="etiqueta-superior" style={{ color: "var(--dorado)" }}>
            Vitrina
          </span>
          <h1>Proyectos estudiantiles</h1>
          <p>Trabajos publicados y avalados por los docentes de cada facultad.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <form className="filtros" method="GET">
            <div className="campo">
              <label htmlFor="q">Buscar</label>
              <input id="q" name="q" defaultValue={filtros.q} placeholder="Título o descripción" />
            </div>
            <div className="campo">
              <label htmlFor="facultad">Facultad</label>
              <select id="facultad" name="facultad" defaultValue={filtros.facultad ?? ""}>
                <option value="">Todas</option>
                {FACULTADES.map((f) => (
                  <option key={f.slug} value={f.nombre}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="tipo">Tipo</label>
              <select id="tipo" name="tipo" defaultValue={filtros.tipo ?? ""}>
                <option value="">Todos</option>
                <option value="INSTITUCIONAL">Institucional</option>
                <option value="EAFI">EAFI</option>
                <option value="COMUNIDAD">Comunidad</option>
              </select>
            </div>
            <button className="btn btn-primario" type="submit">
              Filtrar
            </button>
          </form>

          <div className="titulo-seccion">
            <p className="subtitulo">
              {total} {total === 1 ? "proyecto encontrado" : "proyectos encontrados"}
            </p>
            <Link href="/proyectos/nuevo" className="btn btn-dorado btn-pequeno">
              + Publicar proyecto
            </Link>
          </div>

          {proyectos.length === 0 ? (
            <p className="vacio">No hay proyectos con esos filtros.</p>
          ) : (
            <div className="grilla">
              {proyectos.map((p) => (
                <ProyectoCard key={p.id_proyecto} proyecto={p} />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <nav className="paginacion">
              {filtros.page > 1 && (
                <Link href={urlPagina(filtros.page - 1)} className="btn btn-borde btn-pequeno">
                  ← Anterior
                </Link>
              )}
              <span className="etiqueta">
                Página {filtros.page} de {totalPaginas}
              </span>
              {filtros.page < totalPaginas && (
                <Link href={urlPagina(filtros.page + 1)} className="btn btn-borde btn-pequeno">
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
