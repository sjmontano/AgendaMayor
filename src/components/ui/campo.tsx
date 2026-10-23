"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { EyeIcon } from "@/components/icons/eye";
import { EyeOffIcon } from "@/components/icons/eye-off";
import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Campos de formulario. Label siempre visible, ayuda y error asociados
 * por aria-describedby, aria-invalid en error. El error entra animado.
 */
interface Envoltura {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string | null;
  opcional?: boolean;
  contador?: { actual: number; max: number };
  className?: string;
}

function Marco({
  id,
  etiqueta,
  ayuda,
  error,
  opcional,
  contador,
  className,
  children,
}: Envoltura & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={input.label}>
          {etiqueta}
          {opcional && <span className="ml-1 font-semibold text-muted">(opcional)</span>}
        </label>
        {contador && (
          <span
            className={cn(
              "text-xs tabular-nums",
              contador.actual > contador.max * 0.9 ? "font-bold text-warning" : "text-muted"
            )}
            aria-live="polite"
          >
            {contador.actual}/{contador.max}
          </span>
        )}
      </div>
      {children}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className={input.ayuda}>
          {ayuda}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className={input.mensajeError}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function describedBy(id: string, ayuda?: ReactNode, error?: string | null) {
  return [error ? `${id}-error` : null, ayuda && !error ? `${id}-ayuda` : null].filter(Boolean).join(" ") || undefined;
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  opcional,
  contador,
  className,
  icono,
  ...props
}: Envoltura & InputHTMLAttributes<HTMLInputElement> & { icono?: ReactNode }) {
  const id = useId();
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} contador={contador} className={className}>
      <div className="relative">
        {icono && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true">
            {icono}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          {...props}
          className={cn(input.base, icono && "pl-11", error && input.error)}
        />
      </div>
    </Marco>
  );
}

export function CampoArea({
  etiqueta,
  ayuda,
  error,
  opcional,
  contador,
  className,
  ...props
}: Envoltura & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} contador={contador} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        {...props}
        className={cn(input.base, "min-h-36 resize-y leading-relaxed", error && input.error)}
      />
    </Marco>
  );
}

export function CampoSelect({
  etiqueta,
  ayuda,
  error,
  opcional,
  className,
  children,
  ...props
}: Envoltura & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          {...props}
          className={cn(input.base, "cursor-pointer appearance-none pr-10", error && input.error)}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Marco>
  );
}

/** Contraseña con mostrar/ocultar y medidor de fortaleza opcional. */
export function CampoClave({
  etiqueta,
  ayuda,
  error,
  className,
  medidor = false,
  ...props
}: Envoltura & InputHTMLAttributes<HTMLInputElement> & { medidor?: boolean }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [valor, setValor] = useState("");
  const nivel = fortaleza(valor);
  const etiquetas = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];
  const colores = ["bg-error", "bg-error", "bg-warning", "bg-success", "bg-success"];

  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          {...props}
          onChange={(e) => {
            setValor(e.target.value);
            props.onChange?.(e);
          }}
          className={cn(input.base, "pr-12", error && input.error)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-unimayor-100 hover:text-unimayor-900"
        >
          {visible ? <EyeOffIcon size={18} aria-hidden="true" /> : <EyeIcon size={18} aria-hidden="true" />}
        </button>
      </div>
      {medidor && valor.length > 0 && (
        <div className="mt-1 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i < nivel ? colores[nivel] : "bg-line"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-muted">{etiquetas[nivel]}</span>
        </div>
      )}
    </Marco>
  );
}

function fortaleza(v: string) {
  let n = 0;
  if (v.length >= 8) n++;
  if (v.length >= 12) n++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) n++;
  return Math.min(n, 4);
}
