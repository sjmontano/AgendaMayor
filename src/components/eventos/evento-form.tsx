"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";
import { FACULTADES } from "@/lib/facultades";

interface Props {
  tiposPermitidos: string[];
  facultadUsuario: string;
}

interface FilaEntrada {
  nombre: string;
  precio: number;
  cantidad: number;
}

/** Formulario para crear un evento, con tipos de entrada opcionales. */
export function EventoForm({ tiposPermitidos, facultadUsuario }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState(tiposPermitidos[0]);
  const [esVirtual, setEsVirtual] = useState(false);
  const [vendeEntradas, setVendeEntradas] = useState(false);
  const [entradas, setEntradas] = useState<FilaEntrada[]>([{ nombre: "General", precio: 10000, cantidad: 50 }]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function cambiarEntrada(indice: number, campo: keyof FilaEntrada, valor: string) {
    const copia = [...entradas];
    copia[indice] = { ...copia[indice], [campo]: campo === "nombre" ? valor : Number(valor) };
    setEntradas(copia);
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // El input datetime-local no trae zona horaria: se convierte a ISO
    const aIso = (valor: FormDataEntryValue | null) => new Date(String(valor)).toISOString();

    setCargando(true);
    setError("");
    try {
      const evento = await llamarApi<{ id_evento: number }>("/api/eventos", "POST", {
        titulo: form.get("titulo"),
        descripcion: form.get("descripcion"),
        tipo,
        fechaInicio: aIso(form.get("fechaInicio")),
        fechaFin: aIso(form.get("fechaFin")),
        esVirtual,
        lugar: esVirtual ? undefined : form.get("lugar"),
        urlVirtual: esVirtual ? form.get("urlVirtual") : undefined,
        facultad: tipo === "EAFI" ? form.get("facultad") : undefined,
        edicion: tipo === "EAFI" ? form.get("edicion") : undefined,
        imagen: form.get("imagen") || undefined,
        tiposEntrada: vendeEntradas ? entradas : [],
      });
      router.push(`/eventos/${evento.id_evento}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setCargando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      {error && <p className="alerta alerta--error">{error}</p>}

      <div className="campo">
        <label htmlFor="titulo">Título</label>
        <input id="titulo" name="titulo" required maxLength={200} />
      </div>

      <div className="campo">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" required />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="tipo">Tipo de evento</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {tiposPermitidos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="imagen">Imagen (URL, opcional)</label>
          <input id="imagen" name="imagen" type="url" placeholder="https://…" />
        </div>
      </div>

      {tipo === "EAFI" && (
        <div className="fila">
          <div className="campo">
            <label htmlFor="facultad">Facultad</label>
            <select id="facultad" name="facultad" defaultValue={facultadUsuario} required>
              {FACULTADES.map((f) => (
                <option key={f.slug} value={f.nombre}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="edicion">Edición</label>
            <input id="edicion" name="edicion" placeholder="EAFI 2026-2" required />
          </div>
        </div>
      )}

      <div className="fila">
        <div className="campo">
          <label htmlFor="fechaInicio">Inicio</label>
          <input id="fechaInicio" name="fechaInicio" type="datetime-local" required />
        </div>
        <div className="campo">
          <label htmlFor="fechaFin">Fin</label>
          <input id="fechaFin" name="fechaFin" type="datetime-local" required />
        </div>
      </div>

      <label className="check">
        <input type="checkbox" checked={esVirtual} onChange={(e) => setEsVirtual(e.target.checked)} />
        Es un evento virtual
      </label>

      {esVirtual ? (
        <div className="campo">
          <label htmlFor="urlVirtual">Enlace de conexión</label>
          <input id="urlVirtual" name="urlVirtual" type="url" required placeholder="https://meet…" />
        </div>
      ) : (
        <div className="campo">
          <label htmlFor="lugar">Lugar</label>
          <input id="lugar" name="lugar" required maxLength={100} placeholder="Auditorio, sede Bicentenario" />
        </div>
      )}

      <label className="check">
        <input type="checkbox" checked={vendeEntradas} onChange={(e) => setVendeEntradas(e.target.checked)} />
        Vender entradas (pago con Bold)
      </label>

      {vendeEntradas && (
        <div className="caja" style={{ boxShadow: "none" }}>
          <h3>Tipos de entrada</h3>
          <p className="subtitulo">Precio en pesos. Usa 0 para entradas gratuitas con reserva.</p>
          {entradas.map((fila, i) => (
            <div key={i} className="fila" style={{ gridTemplateColumns: "2fr 1fr 1fr auto", marginBottom: "0.75rem" }}>
              <input value={fila.nombre} onChange={(e) => cambiarEntrada(i, "nombre", e.target.value)} placeholder="Nombre" required aria-label="Nombre de la entrada" />
              <input type="number" min={0} value={fila.precio} onChange={(e) => cambiarEntrada(i, "precio", e.target.value)} aria-label="Precio" />
              <input type="number" min={1} value={fila.cantidad} onChange={(e) => cambiarEntrada(i, "cantidad", e.target.value)} aria-label="Cantidad" />
              <button type="button" className="btn btn-peligro btn-pequeno" onClick={() => setEntradas(entradas.filter((_, j) => j !== i))} disabled={entradas.length === 1}>
                Quitar
              </button>
            </div>
          ))}
          {entradas.length < 5 && (
            <button type="button" className="btn btn-borde btn-pequeno" onClick={() => setEntradas([...entradas, { nombre: "", precio: 0, cantidad: 10 }])}>
              + Agregar tipo de entrada
            </button>
          )}
        </div>
      )}

      <button className="btn btn-primario" type="submit" disabled={cargando}>
        {cargando ? "Guardando…" : "Publicar evento"}
      </button>
    </form>
  );
}
