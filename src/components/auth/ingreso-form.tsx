"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { LoadingButton } from "@/components/ui/skeleton";

/**
 * Formulario de ingreso — Vista (capa de Presentación).
 * Mensaje genérico ante credenciales inválidas (HU-02).
 */
export function IngresoForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const fd = new FormData(e.currentTarget);
      const supabase = getSupabaseBrowser();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: String(fd.get("email")).toLowerCase().trim(),
        password: String(fd.get("password")),
      });
      if (signError) throw new Error("Correo o contraseña incorrectos");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setCargando(false);
    }
  }

  const inputCls =
    "w-full border-2 border-[#E4E4E7] bg-white px-4 py-3 text-sm rounded-[10px] outline-none focus:border-[#004884] focus:shadow-[3px_3px_0_#004884] placeholder:text-zinc-400";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Correo <input name="email" type="email" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Contraseña <input name="password" type="password" required className={inputCls} />
      </label>
      {error && (
        <p role="alert" className="rounded-[10px] border-2 border-[#DC2626] bg-red-50 p-3 text-sm font-semibold text-[#DC2626]">
          {error}
        </p>
      )}
      {cargando ? (
        <LoadingButton label="Ingresando" />
      ) : (
        <button type="submit" className="w-full border-2 border-[#004884] bg-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884]">
          Iniciar sesión
        </button>
      )}
      <p className="text-center text-sm">
        ¿Sin cuenta?{" "}
        <Link href="/registro" className="font-bold text-[#195a90] underline-offset-4 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
