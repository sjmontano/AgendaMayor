"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { apiPost } from "@/lib/api";
import { FACULTADES } from "@/lib/facultades";
import { LoadingButton } from "@/components/ui/skeleton";

/**
 * Formulario de registro — Vista (capa de Presentación).
 * Paso 1: signUp en Auth. Paso 2: POST /api/usuarios/registro (fila USUARIO).
 * HU-01: dominio @unimayor.edu.co + consentimiento Ley 1581 obligatorios.
 */
export function RegistroForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const fd = new FormData(e.currentTarget);
      const email = String(fd.get("email")).toLowerCase().trim();
      const password = String(fd.get("password"));
      if (!email.endsWith("@unimayor.edu.co")) throw new Error("Solo correos @unimayor.edu.co");
      if (password.length < 8) throw new Error("La contraseña debe tener mínimo 8 caracteres");
      if (!fd.get("consentimiento")) throw new Error("Debes aceptar el tratamiento de datos (Ley 1581/2012)");

      const supabase = getSupabaseBrowser();
      const { error: signError } = await supabase.auth.signUp({ email, password });
      if (signError) throw new Error(signError.message);

      await apiPost("/api/usuarios/registro", {
        username: String(fd.get("username")),
        nombre: String(fd.get("nombre")),
        apellido: String(fd.get("apellido")),
        facultad: String(fd.get("facultad")) || undefined,
        programa: String(fd.get("programa")) || undefined,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el registro");
    } finally {
      setCargando(false);
    }
  }

  const inputCls =
    "w-full border-2 border-[#E4E4E7] bg-white px-4 py-3 text-sm rounded-[10px] outline-none focus:border-[#004884] focus:shadow-[3px_3px_0_#004884] placeholder:text-zinc-400";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
          Nombre <input name="nombre" required maxLength={50} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
          Apellido <input name="apellido" required maxLength={50} className={inputCls} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Username <input name="username" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Correo institucional <input name="email" type="email" required placeholder="usuario@unimayor.edu.co" className={inputCls} aria-describedby="email-ayuda" />
      </label>
      <p id="email-ayuda" className="text-xs text-zinc-500">Solo correos @unimayor.edu.co en minúsculas.</p>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Contraseña <input name="password" type="password" required minLength={8} className={inputCls} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
          Facultad
          <select name="facultad" className={inputCls} defaultValue="">
            <option value="">Seleccionar…</option>
            {FACULTADES.map((f) => (
              <option key={f.slug} value={f.nombre}>{f.nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
          Programa <input name="programa" maxLength={100} className={inputCls} />
        </label>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input name="consentimiento" type="checkbox" className="mt-1 size-4 accent-[#004884]" />
        Acepto el tratamiento de mis datos personales (Ley 1581/2012).
      </label>
      {error && (
        <p role="alert" className="rounded-[10px] border-2 border-[#DC2626] bg-red-50 p-3 text-sm font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      {cargando ? (
        <LoadingButton label="Creando cuenta" />
      ) : (
        <button type="submit" className="w-full border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]">
          Crear cuenta
        </button>
      )}
    </form>
  );
}
