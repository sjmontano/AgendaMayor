"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";
import { CheckIcon } from "@/components/icons/check";
import { PlusIcon } from "@/components/icons/plus";
import { BtnMayor } from "@/components/ui/botones";
import { Campo, CampoArea, CampoSelect } from "@/components/ui/campo";
import { useToast } from "@/components/ui/toast";
import { ApiHttpError, apiPost } from "@/lib/api";
import { FACULTADES } from "@/lib/facultades";
import { cn } from "@/lib/utils";

type Rol = "ESTUDIANTE" | "DOCENTE" | "ADMIN";

interface Props {
  usuario: {
    nombre: string;
    apellido: string;
    facultad: string | null;
    nombre_rol: Rol;
  };
}

const TIPOS_POR_ROL: Record<Rol, Array<"OFICIAL" | "EAFI" | "COMUNIDAD">> = {
  ESTUDIANTE: ["COMUNIDAD"],
  DOCENTE: ["EAFI", "COMUNIDAD"],
  ADMIN: ["OFICIAL", "EAFI", "COMUNIDAD"],
};

function fechaLocalBogota(dias: number, hora: string) {
  const fecha = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
  return `${ymd}T${hora}`;
}

function aIsoBogota(valor: string) {
  const base = valor.length === 16 ? `${valor}:00` : valor;
  return new Date(`${base}-05:00`).toISOString();
}

/**
 * Formulario de creación de evento. Los estudiantes crean eventos de
 * COMUNIDAD; docentes EAFI de su facultad; ADMIN cualquiera. La taquilla es
 * opcional y se configura en el mismo paso.
 */
export function EventoForm({ usuario }: Props) {
  const router = useRouter();
  const toast = useToast();
  const tiposPermitidos = TIPOS_POR_ROL[usuario.nombre_rol];

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"OFICIAL" | "EAFI" | "COMUNIDAD">(tiposPermitidos[0]);
  const [facultad, setFacultad] = useState(usuario.facultad ?? "");
  const [edicion, setEdicion] = useState("");
  const [lugar, setLugar] = useState("");
  const [esVirtual, setEsVirtual] = useState(false);
  const [urlVirtual, setUrlVirtual] = useState("");
  const [imagen, setImagen] = useState("");
  const [fechaInicio, setFechaInicio] = useState(() => fechaLocalBogota(1, "18:00"));
  const [fechaFin, setFechaFin] = useState(() => fechaLocalBogota(1, "20:00"));

  const [venderEntradas, setVenderEntradas] = useState(false);
  const [nombreEntrada, setNombreEntrada] = useState("Entrada general");
  const [precioCop, setPrecioCop] = useState("0");
  const [cantidad, setCantidad] = useState("100");
  const [aforo, setAforo] = useState("");
  const [maxPorCompra, setMaxPorCompra] = useState("6");
  const [ventaInicio, setVentaInicio] = useState("");
  const [ventaFin, setVentaFin] = useState("");
  const [politicaDevolucion, setPoliticaDevolucion] = useState("");
  const [urlAccesoPrivado, setUrlAccesoPrivado] = useState("");

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function cambiarTipo(nuevo: typeof tipo) {
    setTipo(nuevo);
    if (nuevo !== "EAFI") {
      setEdicion("");
    } else if (!facultad && usuario.facultad) {
      setFacultad(usuario.facultad);
    }
  }

  const precio = Number(precioCop || 0);
  const esPago = venderEntradas && precio > 0;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nuevos: Record<string, string> = {};

    if (titulo.trim().length < 3) nuevos.titulo = "Escribe un título de al menos 3 caracteres.";
    if (descripcion.trim().length < 20) nuevos.descripcion = "Describe el evento en al menos 20 caracteres.";
    if (!fechaInicio) nuevos.fechaInicio = "Indica cuándo empieza el evento.";
    if (!fechaFin) nuevos.fechaFin = "Indica cuándo termina el evento.";
    if (fechaInicio && fechaFin) {
      const inicio = aIsoBogota(fechaInicio);
      const fin = aIsoBogota(fechaFin);
      if (new Date(fin) <= new Date(inicio)) nuevos.fechaFin = "La fecha final debe ser posterior a la inicial.";
    }
    if (!esVirtual && !lugar.trim()) nuevos.lugar = "Indica el lugar del evento.";
    if (esVirtual && !urlVirtual.trim() && !urlAccesoPrivado.trim()) {
      nuevos.urlVirtual = "Agrega el enlace de acceso (público o privado para compradores).";
    }
    if (tipo === "EAFI" && !facultad) nuevos.facultad = "EAFI exige una facultad.";
    if (tipo === "EAFI" && !edicion.trim()) nuevos.edicion = "EAFI exige una edición (ej. EAFI 2026-1).";

    if (venderEntradas) {
      if (!nombreEntrada.trim()) nuevos.nombreEntrada = "Ponle un nombre a la entrada.";
      if (!Number.isFinite(precio) || precio < 0) {
        nuevos.precioCop = "El precio no puede ser negativo.";
      } else if (precio > 999_999) {
        nuevos.precioCop = "El precio máximo por entrada es 999.999 COP.";
      }
      const cupo = Number(cantidad || 0);
      if (!Number.isInteger(cupo) || cupo < 1) nuevos.cantidad = "Define al menos una entrada.";
      if (aforo && Number(aforo) < 1) nuevos.aforo = "El aforo debe ser mayor que cero.";
      if (aforo && cupo > Number(aforo)) nuevos.cantidad = "El cupo de entradas supera el aforo.";
      const max = Number(maxPorCompra || 0);
      if (!Number.isInteger(max) || max < 1 || max > 20) nuevos.maxPorCompra = "Máximo entre 1 y 20.";
      if (ventaInicio && ventaFin && new Date(aIsoBogota(ventaFin)) <= new Date(aIsoBogota(ventaInicio))) {
        nuevos.ventaFin = "La venta debe terminar después de empezar.";
      }
      if (ventaFin && fechaFin && new Date(aIsoBogota(ventaFin)) > new Date(aIsoBogota(fechaFin))) {
        nuevos.ventaFin = "La venta no puede terminar después del evento.";
      }
    }

    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      setError("Revisa los campos marcados antes de publicar.");
      return;
    }

    setCargando(true);
    try {
      const evento = await apiPost<{ id_evento: number }>("/api/eventos", {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        fechaInicio: aIsoBogota(fechaInicio),
        fechaFin: aIsoBogota(fechaFin),
        lugar: esVirtual ? lugar.trim() || "Virtual" : lugar.trim(),
        esVirtual,
        urlVirtual: urlVirtual.trim() || undefined,
        facultad: facultad || undefined,
        edicion: edicion.trim() || undefined,
        imagen: imagen.trim() || undefined,
        tiposEntrada: venderEntradas
          ? [
              {
                nombre: nombreEntrada.trim(),
                precioCop: Math.round(precio),
                cantidad: Math.round(Number(cantidad)),
              },
            ]
          : [],
        aforo: aforo ? Math.round(Number(aforo)) : undefined,
        maxPorCompra: Math.round(Number(maxPorCompra)),
        ventaInicio: ventaInicio ? aIsoBogota(ventaInicio) : undefined,
        ventaFin: ventaFin ? aIsoBogota(ventaFin) : undefined,
        politicaDevolucion: politicaDevolucion.trim() || undefined,
        urlAccesoPrivado: urlAccesoPrivado.trim() || undefined,
      });
      toast.exito("Evento publicado", "Ya aparece en la cartelera y su taquilla está lista.");
      router.push(`/eventos/${evento.id_evento}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err.message
          : "No pudimos publicar el evento. Revisa tu conexión e inténtalo de nuevo."
      );
      setCargando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-tile border border-line bg-white p-5 shadow-soft sm:p-7">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-unimayor-900 text-white">
              <CalendarDaysIcon size={16} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">Paso 1</p>
              <h2 className="text-lg font-extrabold text-unimayor-900">Información del evento</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Campo
              etiqueta="Título"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
              contador={{ actual: titulo.length, max: 200 }}
              error={errores.titulo}
              required
            />
            <CampoArea
              etiqueta="Descripción"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              ayuda="Qué se hará, a quién va dirigido y qué debe llevar el asistente."
              contador={{ actual: descripcion.length, max: 2000 }}
              error={errores.descripcion}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoSelect
                etiqueta="Tipo de evento"
                name="tipo"
                value={tipo}
                onChange={(e) => cambiarTipo(e.target.value as typeof tipo)}
                ayuda={
                  usuario.nombre_rol === "ESTUDIANTE"
                    ? "Los estudiantes publican eventos de comunidad."
                    : usuario.nombre_rol === "DOCENTE"
                      ? "EAFI requiere facultad y edición."
                      : "ADMIN puede publicar eventos oficiales."
                }
              >
                {tiposPermitidos.map((t) => (
                  <option key={t} value={t}>
                    {t === "OFICIAL" ? "Oficial" : t === "EAFI" ? "EAFI" : "Comunidad"}
                  </option>
                ))}
              </CampoSelect>
              <CampoSelect
                etiqueta="Facultad"
                name="facultad"
                value={facultad}
                onChange={(e) => setFacultad(e.target.value)}
                opcional={tipo !== "EAFI"}
                error={errores.facultad}
              >
                <option value="">Toda la institución</option>
                {FACULTADES.map((f) => (
                  <option key={f.slug} value={f.nombre}>
                    {f.nombre}
                  </option>
                ))}
              </CampoSelect>
            </div>
            {tipo === "EAFI" && (
              <Campo
                etiqueta="Edición EAFI"
                name="edicion"
                value={edicion}
                onChange={(e) => setEdicion(e.target.value)}
                placeholder="Ej. EAFI 2026-1"
                maxLength={50}
                error={errores.edicion}
                required
              />
            )}
          </div>
        </section>

        <section className="rounded-tile border border-line bg-white p-5 shadow-soft sm:p-7">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-unimayor-900 text-white">
              <PlusIcon size={16} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">Paso 2</p>
              <h2 className="text-lg font-extrabold text-unimayor-900">Fecha, lugar y portada</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                etiqueta="Inicio"
                type="datetime-local"
                name="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                error={errores.fechaInicio}
                required
              />
              <Campo
                etiqueta="Fin"
                type="datetime-local"
                name="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                error={errores.fechaFin}
                required
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-box border border-line p-4 transition-colors hover:border-unimayor-900/35">
              <input
                type="checkbox"
                checked={esVirtual}
                onChange={(e) => setEsVirtual(e.target.checked)}
                className="mt-0.5 size-4 accent-unimayor-900"
              />
              <span>
                <span className="block font-bold text-ink">Evento virtual</span>
                <span className="block text-xs text-muted">Se realizará por videollamada o transmisión.</span>
              </span>
            </label>

            <Campo
              etiqueta={esVirtual ? "Lugar o plataforma" : "Lugar"}
              name="lugar"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder={esVirtual ? "Zoom, YouTube, Microsoft Teams…" : "Auditorio, bloque, dirección…"}
              maxLength={100}
              error={errores.lugar}
              required={!esVirtual}
            />

            {esVirtual && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  etiqueta="Enlace público"
                  type="url"
                  name="urlVirtual"
                  value={urlVirtual}
                  onChange={(e) => setUrlVirtual(e.target.value)}
                  placeholder="https://…"
                  ayuda="Visible para todos. Déjalo vacío si el acceso es solo para compradores."
                  error={errores.urlVirtual}
                />
                <Campo
                  etiqueta="Enlace privado para compradores"
                  type="url"
                  name="urlAccesoPrivado"
                  value={urlAccesoPrivado}
                  onChange={(e) => setUrlAccesoPrivado(e.target.value)}
                  placeholder="https://…"
                  ayuda="Solo se muestra en la página de entradas pagadas."
                />
              </div>
            )}

            <Campo
              etiqueta="Imagen de portada"
              type="url"
              name="imagen"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://…/portada.jpg"
              ayuda="Opcional. Usa una imagen horizontal de buena calidad."
            />
          </div>
        </section>

        <section className="rounded-tile border border-line bg-white p-5 shadow-soft sm:p-7">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gold text-unimayor-950">
              <CheckIcon size={16} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">Paso 3</p>
              <h2 className="text-lg font-extrabold text-unimayor-900">Taquilla (opcional)</h2>
            </div>
          </div>

          <label
            className={cn(
              "mt-5 flex cursor-pointer items-start gap-3 rounded-box border p-4 transition-colors",
              venderEntradas ? "border-unimayor-900 bg-unimayor-tint" : "border-line hover:border-unimayor-900/35"
            )}
          >
            <input
              type="checkbox"
              checked={venderEntradas}
              onChange={(e) => setVenderEntradas(e.target.checked)}
              className="mt-0.5 size-4 accent-unimayor-900"
            />
            <span>
              <span className="block font-bold text-ink">Vender entradas con Stripe</span>
              <span className="block text-xs text-muted">
                Crea una entrada general, define cupo y precio. También puedes usar precio 0 para reservar gratis.
              </span>
            </span>
          </label>

          {venderEntradas && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  etiqueta="Nombre de la entrada"
                  name="nombreEntrada"
                  value={nombreEntrada}
                  onChange={(e) => setNombreEntrada(e.target.value)}
                  maxLength={80}
                  error={errores.nombreEntrada}
                />
                <Campo
                  etiqueta="Precio por entrada (COP)"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999_999}
                  step={1000}
                  name="precioCop"
                  value={precioCop}
                  onChange={(e) => setPrecioCop(e.target.value)}
                  ayuda="0 = entrada gratuita."
                  error={errores.precioCop}
                />
                <Campo
                  etiqueta="Cupo total"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  name="cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  error={errores.cantidad}
                />
                <Campo
                  etiqueta="Aforo del evento"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  name="aforo"
                  value={aforo}
                  onChange={(e) => setAforo(e.target.value)}
                  ayuda="Opcional. Si se omite, se usa el cupo de entradas."
                  error={errores.aforo}
                />
                <Campo
                  etiqueta="Máximo por compra"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  name="maxPorCompra"
                  value={maxPorCompra}
                  onChange={(e) => setMaxPorCompra(e.target.value)}
                  error={errores.maxPorCompra}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  etiqueta="Venta desde"
                  type="datetime-local"
                  name="ventaInicio"
                  value={ventaInicio}
                  onChange={(e) => setVentaInicio(e.target.value)}
                  ayuda="Opcional. Si se omite, la venta abre de inmediato."
                />
                <Campo
                  etiqueta="Venta hasta"
                  type="datetime-local"
                  name="ventaFin"
                  value={ventaFin}
                  onChange={(e) => setVentaFin(e.target.value)}
                  ayuda="Opcional. No puede pasar del fin del evento."
                  error={errores.ventaFin}
                />
              </div>

              <CampoArea
                etiqueta="Política de devoluciones"
                name="politicaDevolucion"
                value={politicaDevolucion}
                onChange={(e) => setPoliticaDevolucion(e.target.value)}
                maxLength={500}
                contador={{ actual: politicaDevolucion.length, max: 500 }}
                ayuda="Si la dejas vacía, se usa una política institucional por defecto para eventos pagos."
              />
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="rounded-tile border border-error/30 bg-error-soft px-4 py-3 text-sm font-bold text-error">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <BtnMayor type="submit" variante="gold" tamano="lg" cargando={cargando} icono={ArrowRightIcon}>
            {esPago ? "Publicar y abrir taquilla" : "Publicar evento"}
          </BtnMayor>
          <BtnMayor href="/eventos" variante="ghost" tamano="lg">
            Cancelar
          </BtnMayor>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-tile border border-line bg-white p-5 shadow-soft">
          <p className="text-[11px] font-bold tracking-[0.16em] text-unimayor-700 uppercase">Vista rápida</p>
          <h2 className="mt-1 text-lg leading-snug font-extrabold text-unimayor-900">
            {titulo.trim() || "Tu evento"}
          </h2>
          <p className="mt-2 line-clamp-4 text-sm text-muted">
            {descripcion.trim() || "La descripción aparecerá aquí para que los asistentes sepan de qué se trata."}
          </p>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Tipo</dt>
              <dd className="font-bold text-ink">{tipo}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Fecha</dt>
              <dd className="font-bold text-ink">
                {fechaInicio ? fechaInicio.replace("T", " · ") : "Por definir"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Lugar</dt>
              <dd className="max-w-[60%] text-right font-bold text-ink">
                {esVirtual ? "Virtual" : lugar.trim() || "Por definir"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Taquilla</dt>
              <dd className="font-bold text-ink">
                {venderEntradas ? (esPago ? "Con pago" : "Gratis") : "Sin entradas"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-tile border border-unimayor-900/15 bg-unimayor-tint p-5 text-xs leading-relaxed text-muted">
          <p className="font-extrabold text-unimayor-900">Buenas prácticas</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Publica con al menos una semana de anticipación.</li>
            <li>Confirma el lugar y el horario antes de abrir la taquilla.</li>
            <li>Para eventos virtuales pagos, usa el enlace privado.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
