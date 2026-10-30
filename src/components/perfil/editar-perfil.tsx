"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";
import { FACULTADES, programasDe } from "@/lib/facultades";

interface Perfil {
  facultad: string | null;
  programa: string | null;
  semestre: number | null;
  semillero: string | null;
  bio: string | null;
  avatar: string | null;
}

/** Formulario para completar el perfil propio (HU-03). Se muestra al pulsar "Editar". */
export function EditarPerfil({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [facultad, setFacultad] = useState(perfil.facultad ?? "");
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    try {
      await llamarApi("/api/perfil", "PATCH", {
        facultad: facultad || undefined,
        programa: form.get("programa") || undefined,
        semestre: form.get("semestre") ? Number(form.get("semestre")) : undefined,
        semillero: form.get("semillero") || undefined,
        bio: form.get("bio") || undefined,
        avatar: form.get("avatar") || undefined,
      });
      setAbierto(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!abierto) {
    return (
      <button className="btn btn-borde btn-bloque" style={{ marginTop: "1rem" }} onClick={() => setAbierto(true)}>
        Editar mi perfil
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={guardar} style={{ marginTop: "1rem" }}>
      {error && <p className="alerta alerta--error">{error}</p>}
      <div className="campo">
        <label htmlFor="facultad">Facultad</label>
        <select id="facultad" value={facultad} onChange={(e) => setFacultad(e.target.value)}>
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
        <select id="programa" name="programa" defaultValue={perfil.programa ?? ""} key={facultad}>
          <option value="">Selecciona…</option>
          {programasDe(facultad).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="semestre">Semestre</label>
        <input id="semestre" name="semestre" type="number" min={1} max={10} defaultValue={perfil.semestre ?? ""} />
      </div>
      <div className="campo">
        <label htmlFor="semillero">Semillero</label>
        <input id="semillero" name="semillero" maxLength={100} defaultValue={perfil.semillero ?? ""} />
      </div>
      <div className="campo">
        <label htmlFor="bio">Biografía</label>
        <textarea id="bio" name="bio" maxLength={280} defaultValue={perfil.bio ?? ""} style={{ minHeight: 90 }} />
      </div>
      <div className="campo">
        <label htmlFor="avatar">Foto (URL)</label>
        <input id="avatar" name="avatar" type="url" defaultValue={perfil.avatar ?? ""} />
      </div>
      <div className="acciones">
        <button className="btn btn-primario" type="submit">
          Guardar
        </button>
        <button className="btn btn-borde" type="button" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
