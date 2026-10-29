"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { UserPlusIcon } from "@/components/icons/user-plus";
import { BtnMayor } from "@/components/ui/botones";
import { Campo, CampoClave, CampoSelect } from "@/components/ui/campo";
import { apiPost, mensajeDeError } from "@/lib/api";
import { FACULTADES, facultadProgramas } from "@/lib/facultades";
import { cn } from "@/lib/utils";

/**
 * Registro en dos pasos (HU-01): 1) cuenta (correo institucional + contraseña),
 * 2) perfil académico (nombre, usuario sugerido, facultad → programa).
 * Validación en línea al salir de cada campo; consentimiento Ley 1581 obligatorio.
 */
type Errores = Partial<Record<"email" | "password" | "nombre" | "apellido" | "username" | "consentimiento", string>>;

export function RegistroForm() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [datos, setDatos] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    username: "",
    facultad: "",
    programa: "",
    consentimiento: false,
  });
  const [usernameTocado, setUsernameTocado] = useState(false);

  const slug = FACULTADES.find((f) => f.nombre === datos.facultad)?.slug;
  const programas = slug ? facultadProgramas[slug] : [];

  function set<K extends keyof typeof datos>(k: K, v: (typeof datos)[K]) {
    setDatos((d) => {
      const nuevo = { ...d, [k]: v };
      // Sugiere el usuario a partir del correo mientras no lo edite a mano
      if (k === "email" && !usernameTocado) {
        nuevo.username = String(v).split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30);
      }
      if (k === "facultad") nuevo.programa = "";
      return nuevo;
    });
  }

  function validar(campo: keyof Errores, d = datos): string | undefined {
    switch (campo) {
      case "email": {
        const v = d.email.trim().toLowerCase();
        if (!v) return "Escribe tu correo institucional";
        if (!/^\S+@\S+\.\S+$/.test(v)) return "Ese correo no parece válido";
        if (!v.endsWith("@unimayor.edu.co")) return "Debe terminar en @unimayor.edu.co";
        return;
      }
      case "password":
        if (d.password.length < 8) return "Mínimo 8 caracteres";
        return;
      case "nombre":
        return d.nombre.trim() ? undefined : "Escribe tu nombre";
      case "apellido":
        return d.apellido.trim() ? undefined : "Escribe tu apellido";
      case "username":
        if (d.username.length < 3) return "Mínimo 3 caracteres";
        if (!/^[a-zA-Z0-9_]+$/.test(d.username)) return "Solo letras, números y guion bajo";
        return;
      case "consentimiento":
        return d.consentimiento ? undefined : "Debes aceptar el tratamiento de datos para continuar";
    }
  }

  function tocar(campo: keyof Errores) {
    setErrores((e) => ({ ...e, [campo]: validar(campo) }));
  }

  function continuar() {
    const e: Errores = { email: validar("email"), password: validar("password") };
    setErrores(e);
    if (!e.email && !e.password) setPaso(2);
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (paso === 1) return continuar();
    const campos: (keyof Errores)[] = ["nombre", "apellido", "username", "consentimiento"];
    const e: Errores = Object.fromEntries(campos.map((c) => [c, validar(c)]));
    setErrores(e);
    if (Object.values(e).some(Boolean)) return;

    setError(null);
    setCargando(true);
    try {
      await apiPost("/api/usuarios/registro", {
        email: datos.email.toLowerCase().trim(),
        password: datos.password,
        username: datos.username,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        facultad: datos.facultad || undefined,
        programa: datos.programa || undefined,
      });
      router.push("/panel?bienvenida=1");
      router.refresh();
    } catch (err) {
      setError(mensajeDeError(err, "No pudimos crear tu cuenta. Inténtalo de nuevo."));
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <ol className="mb-8 flex items-center gap-3" aria-label="Pasos del registro">
        {["Tu cuenta", "Tu perfil"].map((t, i) => {
          const n = (i + 1) as 1 | 2;
          const hecho = paso > n;
          const actual = paso === n;
          return (
            <li key={t} className="flex flex-1 items-center gap-3" aria-current={actual ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors duration-300",
                  hecho ? "bg-success text-white" : actual ? "bg-unimayor-900 text-white" : "bg-line-soft text-muted"
                )}
              >
                {hecho ? "✓" : n}
              </span>
              <span className={cn("text-sm font-bold", actual ? "text-ink" : "text-muted")}>{t}</span>
              {i === 0 && (
                <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <motion.span
                    className="absolute inset-0 origin-left bg-success"
                    animate={{ scaleX: paso > 1 ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        {paso === 1 ? (
          <motion.div
            key="p1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <Campo
              etiqueta="Correo institucional"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nombre@unimayor.edu.co"
              value={datos.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => datos.email && tocar("email")}
              error={errores.email}
              ayuda="Solo correos @unimayor.edu.co."
              autoFocus
            />
            <CampoClave
              etiqueta="Contraseña"
              name="password"
              autoComplete="new-password"
              value={datos.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => datos.password && tocar("password")}
              error={errores.password}
              ayuda="Mínimo 8 caracteres. Mezcla mayúsculas, números y símbolos."
              medidor
            />
            <BtnMayor type="submit" tamano="lg" anchoCompleto icono={ArrowRightIcon}>
              Continuar
            </BtnMayor>
          </motion.div>
        ) : (
          <motion.div
            key="p2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo
                etiqueta="Nombre"
                name="nombre"
                autoComplete="given-name"
                maxLength={50}
                value={datos.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                onBlur={() => tocar("nombre")}
                error={errores.nombre}
                autoFocus
              />
              <Campo
                etiqueta="Apellido"
                name="apellido"
                autoComplete="family-name"
                maxLength={50}
                value={datos.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                onBlur={() => tocar("apellido")}
                error={errores.apellido}
              />
            </div>
            <Campo
              etiqueta="Nombre de usuario"
              name="username"
              autoComplete="username"
              maxLength={30}
              value={datos.username}
              onChange={(e) => {
                setUsernameTocado(true);
                set("username", e.target.value);
              }}
              onBlur={() => tocar("username")}
              error={errores.username}
              ayuda={datos.username ? `Tu perfil: agendamayor/perfil/${datos.username}` : "Letras, números y guion bajo."}
              icono={<span className="text-sm font-bold">@</span>}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoSelect
                etiqueta="Facultad"
                opcional
                value={datos.facultad}
                onChange={(e) => set("facultad", e.target.value)}
              >
                <option value="">Seleccionar…</option>
                {FACULTADES.map((f) => (
                  <option key={f.slug} value={f.nombre}>
                    {f.nombre}
                  </option>
                ))}
              </CampoSelect>
              <CampoSelect
                etiqueta="Programa"
                opcional
                value={datos.programa}
                onChange={(e) => set("programa", e.target.value)}
                disabled={programas.length === 0}
              >
                <option value="">{datos.facultad ? "Seleccionar…" : "Elige facultad primero"}</option>
                {programas.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </CampoSelect>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 rounded-box p-3 text-sm ring-1 ring-line transition-colors hover:bg-unimayor-tint has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-unimayor-900">
                <input
                  type="checkbox"
                  checked={datos.consentimiento}
                  onChange={(e) => {
                    set("consentimiento", e.target.checked);
                    setErrores((er) => ({ ...er, consentimiento: undefined }));
                  }}
                  className="mt-0.5 size-5 shrink-0 accent-unimayor-900"
                  aria-describedby={errores.consentimiento ? "consent-error" : undefined}
                />
                <span>
                  Acepto el tratamiento de mis datos personales conforme a la{" "}
                  <strong>Ley 1581 de 2012</strong>.
                </span>
              </label>
              {errores.consentimiento && (
                <p id="consent-error" role="alert" className="mt-1.5 text-xs font-semibold text-error">
                  {errores.consentimiento}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-box bg-error-soft px-4 py-3 text-sm font-semibold text-error">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <BtnMayor variante="secondary" tamano="lg" onClick={() => setPaso(1)} disabled={cargando}>
                Atrás
              </BtnMayor>
              <BtnMayor type="submit" tamano="lg" anchoCompleto cargando={cargando} icono={UserPlusIcon} className="flex-1">
                {cargando ? "Creando cuenta…" : "Crear cuenta"}
              </BtnMayor>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingresar" className="font-bold text-unimayor-700 underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
