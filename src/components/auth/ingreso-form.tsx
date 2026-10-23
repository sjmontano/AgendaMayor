"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimationControls } from "motion/react";
import { useState } from "react";
import { LogInIcon as LoginIcon } from "@/components/icons/login";
import { BtnMayor } from "@/components/ui/botones";
import { Campo, CampoClave } from "@/components/ui/campo";
import { apiPost } from "@/lib/api";

/**
 * Formulario de ingreso (HU-02) — POST /api/auth/login.
 * Mensaje genérico ante credenciales inválidas; el formulario "niega" con un
 * leve temblor. Tras ingresar vuelve a la ruta pedida (?siguiente=) o al panel.
 */
function destinoSeguro(siguiente: string | null) {
  return siguiente && siguiente.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/panel";
}

export function IngresoForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const temblor = useAnimationControls();

  function validarCorreo(valor: string) {
    const v = valor.trim().toLowerCase();
    if (!v) return "Escribe tu correo";
    if (!/^\S+@\S+\.\S+$/.test(v)) return "Ese correo no parece válido";
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).toLowerCase().trim();
    const errCorreo = validarCorreo(email);
    setErrorCorreo(errCorreo);
    if (errCorreo) return;

    setCargando(true);
    try {
      await apiPost("/api/auth/login", { email, password: String(fd.get("password")) });
      router.push(destinoSeguro(params.get("siguiente")));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión");
      void temblor.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      setCargando(false);
    }
  }

  return (
    <motion.form animate={temblor} onSubmit={onSubmit} className="space-y-5" noValidate>
      {params.get("siguiente") && (
        <p className="rounded-box bg-unimayor-tint px-4 py-3 text-sm text-unimayor-900 ring-1 ring-unimayor-100" role="status">
          Inicia sesión para continuar.
        </p>
      )}
      <Campo
        etiqueta="Correo institucional"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="nombre@unimayor.edu.co"
        required
        error={errorCorreo}
        onBlur={(e) => e.target.value && setErrorCorreo(validarCorreo(e.target.value))}
      />
      <CampoClave etiqueta="Contraseña" name="password" autoComplete="current-password" required />

      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-box bg-error-soft px-4 py-3 text-sm font-semibold text-error"
        >
          <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 8v5m0 3.5v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />
          </svg>
          {error}
        </motion.p>
      )}

      <BtnMayor type="submit" tamano="lg" anchoCompleto cargando={cargando} icono={LoginIcon}>
        {cargando ? "Ingresando…" : "Iniciar sesión"}
      </BtnMayor>

      <div className="relative py-2 text-center text-xs text-muted">
        <span className="absolute inset-x-0 top-1/2 border-t border-line" aria-hidden="true" />
        <span className="relative bg-white px-3">¿Primera vez en Agenda Mayor?</span>
      </div>
      <BtnMayor href="/registro" variante="secondary" tamano="lg" anchoCompleto>
        Crear cuenta con mi correo UNIMAYOR
      </BtnMayor>
      <p className="text-center text-xs text-muted">
        ¿Olvidaste tu contraseña? Escribe a{" "}
        <Link href="mailto:institucional@unimayor.edu.co" className="font-bold text-unimayor-700 underline-offset-4 hover:underline">
          institucional@unimayor.edu.co
        </Link>
      </p>
    </motion.form>
  );
}
