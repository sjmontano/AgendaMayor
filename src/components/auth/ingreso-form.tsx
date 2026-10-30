"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { llamarApi } from "@/lib/api";

/** Formulario de inicio de sesión (HU-02). */
export function IngresoForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setCargando(true);
    setError("");
    try {
      await llamarApi("/api/auth/login", "POST", {
        email: form.get("email"),
        password: form.get("password"),
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
      <div className="campo">
        <label htmlFor="email">Correo institucional</label>
        <input id="email" name="email" type="email" required placeholder="nombre@unimayor.edu.co" autoComplete="email" />
      </div>
      <div className="campo">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn btn-primario btn-bloque" type="submit" disabled={cargando}>
        {cargando ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="subtitulo">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </form>
  );
}
