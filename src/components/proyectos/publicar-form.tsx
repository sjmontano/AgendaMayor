"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";
import { FACULTADES, programasDe } from "@/lib/facultades";

interface Props {
  facultadInicial: string;
  eventosEafi: { id: number; titulo: string }[];
}

/** Formulario para publicar un proyecto. Envía los datos a POST /api/proyectos. */
export function PublicarForm({ facultadInicial, eventosEafi }: Props) {
  const router = useRouter();
  const [facultad, setFacultad] = useState(facultadInicial);
  const [tipo, setTipo] = useState("COMUNIDAD");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Las fotos se escriben como URLs, una por línea
    const fotos = String(form.get("fotos"))
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    setCargando(true);
    setError("");
    try {
      const proyecto = await llamarApi<{ id_proyecto: number }>("/api/proyectos", "POST", {
        titulo: form.get("titulo"),
        descripcion: form.get("descripcion"),
        facultad,
        programa: form.get("programa"),
        tipo,
        fotos,
        eventoOrigenId: tipo === "EAFI" ? Number(form.get("eventoOrigenId")) : undefined,
      });
      router.push(`/proyectos/${proyecto.id_proyecto}`);
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
        <input id="titulo" name="titulo" required maxLength={100} />
      </div>

      <div className="campo">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" required maxLength={5000} />
        <small>Cuenta qué problema resuelve, cómo lo hiciste y qué resultados obtuviste.</small>
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="facultad">Facultad</label>
          <select id="facultad" value={facultad} onChange={(e) => setFacultad(e.target.value)} required>
            <option value="">Selecciona…</option>
            {FACULTADES.map((f) => (
              <option key={f.slug} value={f.nombre}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="programa">Programa</label>
          <select id="programa" name="programa" required key={facultad}>
            <option value="">Selecciona…</option>
            {programasDe(facultad).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="tipo">Tipo de proyecto</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="COMUNIDAD">Comunidad</option>
            <option value="INSTITUCIONAL">Institucional</option>
            <option value="EAFI">EAFI (feria)</option>
          </select>
        </div>
        {tipo === "EAFI" && (
          <div className="campo">
            <label htmlFor="eventoOrigenId">Feria EAFI</label>
            <select id="eventoOrigenId" name="eventoOrigenId" required>
              <option value="">Selecciona…</option>
              {eventosEafi.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.titulo}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="campo">
        <label htmlFor="fotos">Fotos (opcional)</label>
        <textarea id="fotos" name="fotos" style={{ minHeight: 80 }} placeholder="https://…/foto1.jpg" />
        <small>Pega la URL de cada imagen en una línea (máximo 10).</small>
      </div>

      <button className="btn btn-primario" type="submit" disabled={cargando}>
        {cargando ? "Enviando…" : "Enviar a revisión"}
      </button>
    </form>
  );
}
