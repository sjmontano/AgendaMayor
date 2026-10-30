"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";
import { Etiqueta } from "@/components/ui/etiqueta";

interface Puesto {
  id_puesto: number;
  codigo: string;
  edificio: string;
  piso: number;
  salon: string;
  ubicacion: string;
  estado: string;
  evento_id: number;
  proyecto_id: number | null;
}

interface Opcion {
  id: number;
  titulo: string;
}

interface Props {
  puestos: Puesto[];
  eventos: Opcion[];
  proyectos: Opcion[];
}

/** Administración de puestos (mesas) de la feria EAFI: crear, asignar, liberar y eliminar. */
export function Puestos({ puestos, eventos, proyectos }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function ejecutar(accion: () => Promise<unknown>) {
    setError("");
    try {
      await accion();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const form = new FormData(formulario);
    ejecutar(async () => {
      await llamarApi("/api/puestos", "POST", {
        codigo: form.get("codigo"),
        edificio: form.get("edificio"),
        piso: Number(form.get("piso")),
        salon: form.get("salon"),
        ubicacion: form.get("ubicacion"),
        eventoId: Number(form.get("eventoId")),
      });
      formulario.reset();
    });
  }

  function asignar(idPuesto: number, proyectoId: string) {
    if (!proyectoId) return;
    ejecutar(() => llamarApi(`/api/puestos/${idPuesto}`, "PATCH", { accion: "asignar", proyectoId: Number(proyectoId) }));
  }

  const tituloProyecto = (id: number | null) => proyectos.find((p) => p.id === id)?.titulo ?? `Proyecto #${id}`;

  return (
    <div className="dos-columnas">
      <div className="caja">
        {error && <p className="alerta alerta--error">{error}</p>}
        {puestos.length === 0 ? (
          <p className="vacio">No hay puestos creados.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Proyecto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {puestos.map((p) => (
                  <tr key={p.id_puesto}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <strong>{p.codigo}</strong>
                    </td>
                    <td>
                      {p.edificio}, piso {p.piso}, {p.salon}
                    </td>
                    <td>
                      <Etiqueta valor={p.estado} />
                    </td>
                    <td>
                      {p.proyecto_id ? (
                        tituloProyecto(p.proyecto_id)
                      ) : (
                        <select defaultValue="" onChange={(e) => asignar(p.id_puesto, e.target.value)} aria-label="Asignar proyecto">
                          <option value="">Asignar…</option>
                          {proyectos.map((pr) => (
                            <option key={pr.id} value={pr.id}>
                              {pr.titulo}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      {p.proyecto_id ? (
                        <button
                          className="btn btn-borde btn-pequeno"
                          onClick={() => ejecutar(() => llamarApi(`/api/puestos/${p.id_puesto}`, "PATCH", { accion: "liberar" }))}
                        >
                          Liberar
                        </button>
                      ) : (
                        <button
                          className="btn btn-peligro btn-pequeno"
                          onClick={() => ejecutar(() => llamarApi(`/api/puestos/${p.id_puesto}`, "DELETE"))}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form className="caja formulario" onSubmit={crear}>
        <h3>Nuevo puesto</h3>
        <div className="campo">
          <label htmlFor="eventoId">Feria EAFI</label>
          <select id="eventoId" name="eventoId" required>
            <option value="">Selecciona…</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className="fila">
          <div className="campo">
            <label htmlFor="codigo">Código</label>
            <input id="codigo" name="codigo" required maxLength={20} placeholder="A-01" />
          </div>
          <div className="campo">
            <label htmlFor="piso">Piso</label>
            <input id="piso" name="piso" type="number" min={0} max={10} required defaultValue={1} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="edificio">Edificio</label>
          <input id="edificio" name="edificio" required maxLength={100} />
        </div>
        <div className="campo">
          <label htmlFor="salon">Salón</label>
          <input id="salon" name="salon" required maxLength={100} />
        </div>
        <div className="campo">
          <label htmlFor="ubicacion">Referencia</label>
          <input id="ubicacion" name="ubicacion" required maxLength={200} placeholder="Junto a la entrada principal" />
        </div>
        <button className="btn btn-primario" type="submit">
          Crear puesto
        </button>
      </form>
    </div>
  );
}
