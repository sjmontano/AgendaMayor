"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { SendIcon } from "@/components/icons/send";
import { PlusIcon } from "@/components/icons/plus";
import { XIcon } from "@/components/icons/x";
import { RocketIcon } from "@/components/icons/rocket";
import { BtnMayor, BtnIcono } from "@/components/ui/botones";
import { Campo, CampoArea, CampoSelect } from "@/components/ui/campo";
import { useToast } from "@/components/ui/toast";
import { ProyectoCard, type ProyectoCardData } from "@/components/vitrina/proyecto-card";
import { apiGet, apiPost } from "@/lib/api";
import { FACULTADES, facultadProgramas } from "@/lib/facultades";
import { cn } from "@/lib/utils";

/**
 * Asistente de publicación (HU-06) — 4 pasos con vista previa en vivo:
 * 1 Información · 2 Académico · 3 Imágenes · 4 Revisión.
 * Valida por paso, guarda borrador local automáticamente y, al enviar,
 * el Service deja el proyecto EN_REVISION y notifica al autor.
 */
interface Autor {
  username: string;
  nombre: string;
  apellido: string;
  facultad: string | null;
  programa: string | null;
}

interface Datos {
  titulo: string;
  descripcion: string;
  facultad: string;
  programa: string;
  tipo: "COMUNIDAD" | "INSTITUCIONAL" | "EAFI";
  eventoOrigenId: string;
  fotos: string[];
}

interface EventoOpcion {
  id_evento: number;
  titulo: string;
  tipo: string;
}

const CLAVE_BORRADOR = "agenda-mayor:borrador-proyecto";
const PASOS = ["Información", "Académico", "Imágenes", "Revisión"];

const TIPOS: { valor: Datos["tipo"]; titulo: string; texto: string }[] = [
  { valor: "COMUNIDAD", titulo: "Comunidad", texto: "Trabajo de aula, semillero o iniciativa propia." },
  { valor: "INSTITUCIONAL", titulo: "Institucional", texto: "Opción de grado o proyecto avalado por un programa." },
  { valor: "EAFI", titulo: "EAFI", texto: "Para exhibir en el Encuentro Académico de Facultad." },
];

function urlValida(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function PublicarForm({ autor }: { autor: Autor }) {
  const toast = useToast();
  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [datos, setDatos] = useState<Datos>({
    titulo: "",
    descripcion: "",
    facultad: autor.facultad ?? "",
    programa: autor.programa ?? "",
    tipo: "COMUNIDAD",
    eventoOrigenId: "",
    fotos: [],
  });
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [nuevaFoto, setNuevaFoto] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<number | null>(null);
  const [borradorRestaurable, setBorradorRestaurable] = useState<Datos | null>(null);
  const [eventos, setEventos] = useState<EventoOpcion[]>([]);
  const encabezado = useRef<HTMLDivElement>(null);

  const slug = FACULTADES.find((f) => f.nombre === datos.facultad)?.slug;
  const programas = slug ? facultadProgramas[slug] : [];

  // Ofrece restaurar un borrador guardado
  useEffect(() => {
    // Se lee tras montar (localStorage no existe en el servidor)
    const t = window.setTimeout(() => {
      try {
        const crudo = localStorage.getItem(CLAVE_BORRADOR);
        if (crudo) {
          const b = JSON.parse(crudo) as Datos;
          if (b.titulo || b.descripcion) setBorradorRestaurable(b);
        }
      } catch {
        /* almacenamiento no disponible */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Autoguardado del borrador
  useEffect(() => {
    if (exito !== null) return;
    const t = window.setTimeout(() => {
      try {
        if (datos.titulo || datos.descripcion) localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datos));
      } catch {
        /* almacenamiento no disponible */
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [datos, exito]);

  // Eventos EAFI para vincular el proyecto
  useEffect(() => {
    if (datos.tipo !== "EAFI" || eventos.length > 0) return;
    let vivo = true;
    apiGet<{ data: EventoOpcion[] }>("/api/eventos?limit=50")
      .then((r) => vivo && setEventos(r.data.filter((e) => e.tipo === "EAFI")))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [datos.tipo, eventos.length]);

  function set<K extends keyof Datos>(k: K, v: Datos[K]) {
    setDatos((d) => ({ ...d, [k]: v, ...(k === "facultad" ? { programa: "" } : {}) }));
    setErrores((e) => ({ ...e, [k]: undefined }));
  }

  function validarPaso(p: number) {
    const e: Record<string, string | undefined> = {};
    if (p === 0) {
      if (datos.titulo.trim().length < 5) e.titulo = "Escribe un título de al menos 5 caracteres";
      if (datos.descripcion.trim().length < 40) e.descripcion = "Cuenta un poco más: mínimo 40 caracteres";
    }
    if (p === 1) {
      if (!datos.facultad) e.facultad = "Elige la facultad";
      if (!datos.programa) e.programa = "Elige el programa";
      if (datos.tipo === "EAFI" && !datos.eventoOrigenId) e.eventoOrigenId = "Los proyectos EAFI deben vincularse a un evento EAFI";
    }
    if (p === 3 && !consentimiento) e.consentimiento = "Debes aceptar para publicar";
    setErrores(e);
    return !Object.values(e).some(Boolean);
  }

  function ir(destino: number) {
    if (destino > paso) {
      for (let p = paso; p < destino; p++) {
        if (!validarPaso(p)) {
          setPaso(p);
          return;
        }
      }
    }
    setDireccion(destino > paso ? 1 : -1);
    setPaso(destino);
    encabezado.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function agregarFoto() {
    const v = nuevaFoto.trim();
    if (!v) return;
    if (!urlValida(v)) {
      setErrores((e) => ({ ...e, foto: "Pega una dirección que empiece por https://" }));
      return;
    }
    if (datos.fotos.includes(v)) {
      setErrores((e) => ({ ...e, foto: "Esa imagen ya está en la lista" }));
      return;
    }
    if (datos.fotos.length >= 10) {
      setErrores((e) => ({ ...e, foto: "Máximo 10 imágenes" }));
      return;
    }
    set("fotos", [...datos.fotos, v]);
    setNuevaFoto("");
    setErrores((e) => ({ ...e, foto: undefined }));
  }

  async function publicar() {
    if (!validarPaso(3)) return;
    setEnviando(true);
    try {
      const payload: Record<string, unknown> = {
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        facultad: datos.facultad,
        programa: datos.programa,
        tipo: datos.tipo,
        fotos: datos.fotos,
      };
      if (datos.tipo === "EAFI") payload.eventoOrigenId = Number(datos.eventoOrigenId);
      const r = await apiPost<{ id_proyecto: number }>("/api/proyectos", payload);
      try {
        localStorage.removeItem(CLAVE_BORRADOR);
      } catch {
        /* almacenamiento no disponible */
      }
      setExito(r.id_proyecto);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error("No pudimos enviar tu proyecto", e instanceof Error ? e.message : undefined);
    } finally {
      setEnviando(false);
    }
  }

  const vistaPrevia: ProyectoCardData = {
    id_proyecto: 0,
    titulo: datos.titulo || "Título de tu proyecto",
    descripcion: datos.descripcion || "Aquí aparecerá el resumen de tu proyecto tal como lo verá la comunidad.",
    fotos: datos.fotos,
    facultad: datos.facultad || "Tu facultad",
    programa: datos.programa || "Tu programa",
    tipo: datos.tipo,
    estado: "EN_REVISION",
    destacado: false,
    autor: { username: autor.username, nombre: autor.nombre, apellido: autor.apellido, avatar: null },
  };

  if (exito !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className="relative mx-auto max-w-xl overflow-hidden rounded-tile border border-line bg-white p-8 text-center shadow-soft sm:p-10"
        role="status"
      >
        {Array.from({ length: 14 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className={cn("absolute top-1/3 left-1/2 size-2 rounded-sm", i % 3 === 0 ? "bg-gold" : i % 3 === 1 ? "bg-unimayor-900" : "bg-unimayor-nav")}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos((i / 14) * Math.PI * 2) * (120 + (i % 4) * 30),
              y: Math.sin((i / 14) * Math.PI * 2) * (90 + (i % 3) * 25) + 60,
              opacity: 0,
              rotate: 180 + i * 20,
            }}
            transition={{ duration: 1.3, ease: "easeOut", delay: 0.15 }}
          />
        ))}
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 220, delay: 0.1 }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold text-unimayor-950"
          aria-hidden="true"
        >
          <RocketIcon size={30} />
        </motion.span>
        <h2 className="mt-5 text-2xl font-black text-unimayor-900">¡Proyecto enviado a revisión!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Un docente de <strong className="text-ink">{datos.facultad}</strong> lo revisará. Te avisaremos en la campana con el
          resultado.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <BtnMayor href="/panel" icono={ArrowRightIcon}>
            Ver seguimiento
          </BtnMayor>
          <BtnMayor
            variante="secondary"
            onClick={() => {
              setExito(null);
              setPaso(0);
              setConsentimiento(false);
              setDatos((d) => ({ ...d, titulo: "", descripcion: "", fotos: [], eventoOrigenId: "" }));
            }}
          >
            Publicar otro
          </BtnMayor>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <div ref={encabezado} className="scroll-mt-28" />

        {borradorRestaurable && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-tile bg-gold-soft px-5 py-3 ring-1 ring-gold/40">
            <p className="text-sm text-gold-ink">
              Tienes un borrador sin enviar: <strong>{borradorRestaurable.titulo || "sin título"}</strong>
            </p>
            <div className="flex gap-2">
              <BtnMayor
                tamano="sm"
                variante="gold"
                onClick={() => {
                  setDatos(borradorRestaurable);
                  setBorradorRestaurable(null);
                }}
              >
                Restaurar
              </BtnMayor>
              <BtnMayor
                tamano="sm"
                variante="ghost"
                onClick={() => {
                  setBorradorRestaurable(null);
                  try {
                    localStorage.removeItem(CLAVE_BORRADOR);
                  } catch {
                    /* almacenamiento no disponible */
                  }
                }}
              >
                Descartar
              </BtnMayor>
            </div>
          </div>
        )}

        {/* Stepper */}
        <nav aria-label="Pasos de publicación" className="mb-8">
          <ol className="grid grid-cols-4 gap-2">
            {PASOS.map((p, i) => {
              const hecho = i < paso;
              const actual = i === paso;
              return (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => ir(i)}
                    aria-current={actual ? "step" : undefined}
                    className="group flex w-full flex-col gap-2 text-left"
                  >
                    <span className="relative h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.span
                        className="absolute inset-0 origin-left rounded-full bg-unimayor-900"
                        initial={false}
                        animate={{ scaleX: hecho ? 1 : actual ? 0.5 : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                    <span className={cn("text-xs font-bold sm:text-[13px]", actual ? "text-unimayor-900" : hecho ? "text-ink" : "text-muted")}>
                      <span className="mr-1 tabular-nums">{i + 1}.</span>
                      <span className="hidden sm:inline">{p}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="rounded-tile border border-line bg-white p-5 sm:p-7">
          <AnimatePresence mode="wait" initial={false} custom={direccion}>
            <motion.div
              key={paso}
              custom={direccion}
              initial={{ opacity: 0, x: 28 * direccion }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 * direccion }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {paso === 0 && (
                <fieldset className="space-y-5">
                  <legend className="mb-1 text-xl font-extrabold text-unimayor-900">Cuéntanos de tu proyecto</legend>
                  <p className="text-sm text-muted">Un buen título y una descripción clara hacen que más gente lo abra.</p>
                  <Campo
                    etiqueta="Título"
                    value={datos.titulo}
                    onChange={(e) => set("titulo", e.target.value)}
                    maxLength={100}
                    contador={{ actual: datos.titulo.length, max: 100 }}
                    error={errores.titulo}
                    placeholder="Ej. Sistema de riego inteligente para huertas urbanas"
                    autoFocus
                  />
                  <CampoArea
                    etiqueta="Descripción"
                    value={datos.descripcion}
                    onChange={(e) => set("descripcion", e.target.value)}
                    maxLength={5000}
                    contador={{ actual: datos.descripcion.length, max: 5000 }}
                    error={errores.descripcion}
                    rows={8}
                    ayuda="¿Qué problema resuelve? ¿Cómo lo hiciste? ¿Qué lograste?"
                  />
                </fieldset>
              )}

              {paso === 1 && (
                <fieldset className="space-y-6">
                  <legend className="mb-1 text-xl font-extrabold text-unimayor-900">Datos académicos</legend>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <CampoSelect etiqueta="Facultad" value={datos.facultad} onChange={(e) => set("facultad", e.target.value)} error={errores.facultad}>
                      <option value="">Seleccionar…</option>
                      {FACULTADES.map((f) => (
                        <option key={f.slug} value={f.nombre}>
                          {f.nombre}
                        </option>
                      ))}
                    </CampoSelect>
                    <CampoSelect
                      etiqueta="Programa"
                      value={datos.programa}
                      onChange={(e) => set("programa", e.target.value)}
                      disabled={programas.length === 0}
                      error={errores.programa}
                    >
                      <option value="">{datos.facultad ? "Seleccionar…" : "Elige facultad primero"}</option>
                      {programas.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </CampoSelect>
                  </div>

                  <div role="radiogroup" aria-label="Tipo de proyecto">
                    <p className="mb-2 text-[13px] font-bold text-ink">Tipo de proyecto</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {TIPOS.map((t) => {
                        const activo = datos.tipo === t.valor;
                        return (
                          <label
                            key={t.valor}
                            className={cn(
                              "relative cursor-pointer rounded-box border-2 p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-unimayor-900",
                              activo ? "border-unimayor-900 bg-unimayor-tint" : "border-line bg-white hover:border-unimayor-100"
                            )}
                          >
                            <input
                              type="radio"
                              name="tipo"
                              value={t.valor}
                              checked={activo}
                              onChange={() => set("tipo", t.valor)}
                              className="sr-only"
                            />
                            <span className="flex items-center justify-between">
                              <span className="font-extrabold text-ink">{t.titulo}</span>
                              <span
                                className={cn(
                                  "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                                  activo ? "border-unimayor-900 bg-unimayor-900" : "border-line"
                                )}
                                aria-hidden="true"
                              >
                                {activo && <span className="size-2 rounded-full bg-white" />}
                              </span>
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted">{t.texto}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {datos.tipo === "EAFI" && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <CampoSelect
                          etiqueta="Evento EAFI"
                          value={datos.eventoOrigenId}
                          onChange={(e) => set("eventoOrigenId", e.target.value)}
                          error={errores.eventoOrigenId}
                          ayuda={eventos.length === 0 ? "No hay eventos EAFI activos. Elige otro tipo o pregunta a tu docente." : undefined}
                        >
                          <option value="">Seleccionar evento…</option>
                          {eventos.map((e) => (
                            <option key={e.id_evento} value={e.id_evento}>
                              {e.titulo}
                            </option>
                          ))}
                        </CampoSelect>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </fieldset>
              )}

              {paso === 2 && (
                <fieldset className="space-y-5">
                  <legend className="mb-1 text-xl font-extrabold text-unimayor-900">Imágenes</legend>
                  <p className="text-sm text-muted">
                    Opcional, pero los proyectos con imagen se abren mucho más. La primera será la portada.
                  </p>
                  <div className="flex items-start gap-2">
                    <Campo
                      className="flex-1"
                      etiqueta="Dirección de la imagen"
                      type="url"
                      inputMode="url"
                      value={nuevaFoto}
                      onChange={(e) => {
                        setNuevaFoto(e.target.value);
                        setErrores((er) => ({ ...er, foto: undefined }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarFoto();
                        }
                      }}
                      placeholder="https://…"
                      error={errores.foto}
                      ayuda={`${datos.fotos.length}/10 imágenes. Usa enlaces públicos (Drive con acceso público, Imgur…).`}
                    />
                    <BtnMayor className="mt-[26px]" icono={PlusIcon} iconoPos="inicio" onClick={agregarFoto} variante="secondary">
                      Añadir
                    </BtnMayor>
                  </div>
                  {datos.fotos.length > 0 && (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <AnimatePresence initial={false}>
                        {datos.fotos.map((f, i) => (
                          <motion.li
                            key={f}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative aspect-[16/10] overflow-hidden rounded-box bg-line-soft ring-1 ring-line"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f} alt={`Imagen ${i + 1}`} className="size-full object-cover" />
                            {i === 0 && (
                              <span className="absolute bottom-2 left-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold text-unimayor-950">
                                Portada
                              </span>
                            )}
                            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => set("fotos", [f, ...datos.fotos.filter((x) => x !== f)])}
                                  className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-unimayor-900 shadow-soft hover:bg-white"
                                >
                                  Usar de portada
                                </button>
                              )}
                              <BtnIcono
                                icono={XIcon}
                                etiqueta={`Quitar imagen ${i + 1}`}
                                tamano={14}
                                onClick={() => set("fotos", datos.fotos.filter((x) => x !== f))}
                                className="size-7 bg-white/90 shadow-soft hover:bg-error-soft hover:text-error"
                              />
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </fieldset>
              )}

              {paso === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-extrabold text-unimayor-900">Revisa antes de enviar</h2>
                  <dl className="divide-y divide-line-soft rounded-box ring-1 ring-line">
                    {[
                      ["Título", datos.titulo, 0],
                      ["Facultad", datos.facultad, 1],
                      ["Programa", datos.programa, 1],
                      ["Tipo", TIPOS.find((t) => t.valor === datos.tipo)?.titulo, 1],
                      ["Imágenes", `${datos.fotos.length}`, 2],
                    ].map(([k, v, p]) => (
                      <div key={String(k)} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <dt className="text-muted">{k}</dt>
                        <dd className="flex min-w-0 items-center gap-3 font-semibold text-ink">
                          <span className="truncate">{v || "—"}</span>
                          <button type="button" onClick={() => ir(Number(p))} className="shrink-0 text-xs font-bold text-unimayor-700 underline-offset-4 hover:underline">
                            Editar
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="rounded-box bg-unimayor-tint p-4 text-sm text-ink">
                    <p className="font-bold text-unimayor-900">¿Qué pasa después?</p>
                    <p className="mt-1 text-muted">
                      Tu proyecto queda <strong className="text-warning">en revisión</strong> hasta que un docente de tu facultad lo
                      avale. Si pide ajustes, podrás corregir y reenviarlo desde tu panel.
                    </p>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-box p-3 text-sm ring-1 ring-line transition-colors hover:bg-unimayor-tint">
                      <input
                        type="checkbox"
                        checked={consentimiento}
                        onChange={(e) => {
                          setConsentimiento(e.target.checked);
                          setErrores((er) => ({ ...er, consentimiento: undefined }));
                        }}
                        className="mt-0.5 size-5 shrink-0 accent-unimayor-900"
                      />
                      <span>
                        Confirmo que soy autor(a) de este trabajo y acepto el tratamiento de datos (<strong>Ley 1581 de 2012</strong>).
                      </span>
                    </label>
                    {errores.consentimiento && (
                      <p role="alert" className="mt-1.5 text-xs font-semibold text-error">
                        {errores.consentimiento}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line-soft pt-5">
            <BtnMayor variante="ghost" onClick={() => ir(paso - 1)} disabled={paso === 0 || enviando}>
              Atrás
            </BtnMayor>
            <span className="hidden text-xs text-muted sm:inline">Borrador guardado en este dispositivo</span>
            {paso < 3 ? (
              <BtnMayor onClick={() => ir(paso + 1)} icono={ArrowRightIcon}>
                Siguiente
              </BtnMayor>
            ) : (
              <BtnMayor variante="gold" onClick={publicar} cargando={enviando} icono={SendIcon}>
                {enviando ? "Enviando…" : "Enviar a revisión"}
              </BtnMayor>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Vista previa">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
          Vista previa en vivo
        </p>
        <div className="pointer-events-none" aria-hidden="true">
          <ProyectoCard proyecto={vistaPrevia} mostrarEstado />
        </div>
        <p className="mt-3 text-xs text-muted">Así se verá tu proyecto en la vitrina cuando sea publicado.</p>
      </aside>
    </div>
  );
}
