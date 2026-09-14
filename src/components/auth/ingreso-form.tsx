"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { LoadingButton } from "@/components/ui/skeleton";
import { FACULTADES } from "@/lib/facultades";

/**
 * Formulario de ingreso — Vista (capa de Presentación).
 * Mensaje genérico ante credenciales inválidas (HU-02).
 * Ahora incluye login con Google (OAuth).
 */
export function IngresoForm() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmitGoogle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const supabase = getSupabaseBrowser();
      // Sign in with Google OAuth (redirect). Usamos signInWithOAuth en lugar de signInWithIdp
      // porque el tipo de esta versión no incluye signInWithIdp, pero el método sí existe en runtime.
      const { error: signError } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (signError) throw new Error(signError.message);
      // Después del redirect, Supabase regresa al /auth/callback que configuramos en Vercel.
      // El router.push no alcanza a correr hasta el próximo render; el usuario será redirigido
      // por Supabase y luego podrá navegar.
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión con Google");
    } finally {
      setCargando(false);
    }
  }

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
    "w-full border-2 border-[#E4E4E7] bg-white px-4 py-3 text-sm rounded-[10x] outline-none focus:border-[#004884] focus:shadow-[3px_3px_0_#004884] placeholder:text-zinc-400";
  const labelCls = "flex flex-col gap-1 text-xs font-bold tracking-widest uppercase";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Login con Google */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={onSubmitGoogle}
          className="w-full flex items-center gap-3 rounded-[10x] border-2 border-[#E4E4E7] bg-white px-6 py-3 text-sm font-bold tracking-widest text-[#195a90] shadow-[4px_4px_0_#333030] hover:bg-[#F5F5F5] hover:text-[#195a90]"
          aria-label="Iniciar sesión con Google"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M22.21 20.04a5.94 5.94 0 0 1-1.35.18c-.37 0-.74-.15-1.05-.43a5.97 5.97 0 0 1-.43-1.35c0-.37.15-.74.43-1.05A5.96 5.96 0 0 1 16 5.48c0-1.1.9-2 2-2.04a5.92 5.92 0 0 1 1.75 1.02 5.95 5.95 0 0 1 .1.88 5.98 5.98 0 0 1-.43 1.35 5.96 5.96 0 0 1-.77.92c-.28.38-.6 1.03-1.05 1.57a14.28 14.28 0 0 1-1.58.6c-.19 0-.38-.03-.57-.08a5.93 5.93 0 0 1-.28-.36 5.99 5.99 0 0 1-.1-.75c0-1.06-.86-2.03-2.05-2.07a5.95 5.95 0 0 1-.82-.55 5.98 5.98 0 0 1-.19-.88 5.99 5.99 0 0 1-.17-.66c0-.37.02-.74.03-1.12a13.16 13.16 0 0 0 .6-2.46 13.15 13.16 0 0 1 2.45.83 13.15 13.16 0 0 1 .82 1.55 13.17 13.17 0 0 1-.6 2.48 13.17 13.17 0 0 1-2.55.12 13.13 13.13 0 0 1-2.56-.12c-.73 0-1.42.22-2.06.57a10.04 10.04 0 0 0-1.17.35 10.05 10.05 0 0 1-.3 1.06 10.05 10.05 0 0 1-.9 1.28c0 .34.02.68.03.99a7.79 7.79 0 0 1-.48 1.41 7.8 7.8 0 0 1-.87.75 7.79 7.79 0 0 1-1.11.35 7.78 7.78 0 0 1-1.51-.03 7.8 7.8 0 0 1-1.45-.77c-.12-.33-.26-.66-.38-.98a5.97 5.97 0 0 1-.18-1.35 5.98 5.98 0 0 1 .05-1.95 5.99 5.99 0 0 1 .18-1.35 5.99 5.99 0 0 1 .56-.92 5.99 5.99 0 0 1 .99-.6 5.94 5.94 0 0 1 1.36-.55 5.97 5.97 0 0 1 1.06.18c.37 0 .74.15 1.05.43a5.95 5.95 0 0 1 .43 1.35 5.98 5.98 0 0 1-.1 1.35 5.98 5.98 0 0 1-.43.98c0 .37-.15.74-.43 1.05a5.99 5.99 0 0 1-.66.43 5.97 5.97 0 0 1-.38.76 5.95 5.95 0 0 1-.76.18 5.99 5.99 0 0 1-1.05-.18 5.99 5.99 0 0 1-1.35-.55z"/>
            <path d="M12 6.31c1.66 0 3.04.97 3.5 2.36h-.06c.59-.65 1.17-1.65 1.46-2.92a13.6 13.6 0 0 1 1.77-2.68 5.38 5.38 0 0 0-.55-3.05 3.7 3.7 0 0 0-2.95-.45c-.31 0-.62.05-1.02.1t-1.01 0 0 0 .55c.5-.6 1.24-.66 1.97-.5a6.89 6.89 0 0 0 2.04.18 6.58 6.58 0 0 1 1.48.47 3.27 3.27 0 0 1 1.39 1.35 2.85 2.85 0 0 1 1.2 2.18 2.5 2.5 0 0 1 1.09 2.51 2.5 2.5 0 0 1 1.18 2.55c.08.68-.12 1.41-.4 2.08a9.89 9.89 0 0 1-.68 2.37 9.91 9.91 0 0 1-.82 2.47c-.1 1.11-.14 2.32-.14 3.53a8.88 8.88 0 0 1-1.88.61 8.9 8.9 0 0 1-1.89-1.15 8.92 8.92 0 0 1-.7-2.06c0-.53.2-1.03.54-1.48a6.55 6.55 0 0 0 1.08-.66 6.24 6.24 0 0 1 .56-1.37c0-.68-.23-1.33-.66-1.93a4.34 4.34 0 0 0-.42-1.65 4.16 4.16 0 0 0-1.15-.44m0-2.73c-2.06 0-3.74 1.38-3.96 3.38a2.54 2.54 0 0 1-1.18 2.61c-.1 1.4.35 2.8 1.03 3.79a2.27 2.27 0 0 1 2.5 1.22c2.65 0 3.76-1.64 3.58-3.93a2.45 2.45 0 0 1 1.07-2.54 2.55 2.55 0 0 1 .1-2.55 2.58 2.58 0 0 1-.07-2.56z"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Correo <input name="email" type="email" required className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase">
        Contraseña <input name="password" type="password" required className={inputCls} />
      </label>
      {error && (
        <p role="alert" className="rounded-[10x] border-2 border-[#DC2626] bg-red-50 p-3 text-sm font-semibold text-[#DC2626]">
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