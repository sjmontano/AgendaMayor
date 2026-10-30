"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { llamarApi } from "@/lib/api";
import { FACULTADES, programasDe } from "@/lib/facultades";

/** Formulario de registro (HU-01). Solo acepta correos @unimayor.edu.co. */
export function RegistroForm() {
  const [facultad, setFacultad] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setCargando(true);
    setError("");
    try {
      await llamarApi("/api/usuarios/registro", "POST", {
        nombre: form.get("nombre"),
        apellido: form.get("apellido"),
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
        facultad: facultad || undefined,
        programa: form.get("programa") || undefined,
        semestre: form.get("semestre") ? Number(form.get("semestre")) : undefined,
      });
      router.push("/panel");
      router.refresh(); // vuelve a leer la sesión para actualizar el menú
    } catch (err) {
      setError((err as Error).message);
      setCargando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      {error && <p className="alerta alerta--error">{error}</p>}
      <div className="fila">
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" required maxLength={50} />
        </div>
        <div className="campo">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" name="apellido" required maxLength={50} />
        </div>
      </div>
      <div className="fila">
        <div className="campo">
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" />
          <small>Letras, números y guion bajo.</small>
        </div>
        <div className="campo">
          <label htmlFor="semestre">Semestre</label>
          <input id="semestre" name="semestre" type="number" min={1} max={10} />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="email">Correo institucional</label>
        <input id="email" name="email" type="email" required placeholder="nombre@unimayor.edu.co" />
      </div>
      <div className="campo">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <small>Mínimo 8 caracteres.</small>
      </div>
      <div className="fila">
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
          <select id="programa" name="programa" key={facultad}>
            <option value="">Selecciona…</option>
            {programasDe(facultad).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <button className="btn btn-primario btn-bloque" type="submit" disabled={cargando}>
        {cargando ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="subtitulo">
        ¿Ya tienes cuenta? <Link href="/ingresar">Ingresa</Link>
      </p>
    </form>
  );
}
