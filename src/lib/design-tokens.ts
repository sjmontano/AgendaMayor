/**
 * Design tokens — Agenda Mayor.
 * Fuente: unimayor.edu.co (estilos medidos) + dirección creativa de DESIGN.md.
 * Regla: los componentes usan las clases semánticas de aquí o las utilidades
 * del @theme (bg-unimayor-900, text-gold…), nunca hex sueltos.
 * Los hex de `colors` existen solo para contextos sin CSS (SVG inline, canvas).
 */

export const colors = {
  /* ── Institucionales UNIMAYOR ── */
  unimayor950: '#082e45', // fondos profundos, footer
  unimayor900: '#004884', // títulos, focus, CTA primario
  unimayor800: '#003b73', // hover de CTA
  unimayor700: '#195a90', // enlaces, acentos
  unimayor600: '#19589f', // bordes institucionales
  unimayorNav: '#3366cc', // azul de navegación del portal
  unimayor100: '#e6eef6', // superficies suaves
  unimayorTint: '#f8fbfd', // fondos alternos de sección

  /* ── Acento ── */
  gold: '#f2a900', // barra de títulos del portal
  goldHover: '#ffab00',

  /* ── Neutros ── */
  white: '#FFFFFF',
  ink: '#333030', // texto primario
  muted: '#52677a', // texto secundario (medido en el portal, 5.6:1 sobre blanco)
  line: '#E4E4E7', // bordes, separadores

  /* ── Funcionales ── */
  error: '#B91C1C',
  success: '#15803D',
  warning: '#B45309',
}

export const font = {
  sans: 'Nunito Sans',
}

export const layout = {
  maxWidth: 'max-w-6xl',
  container: 'mx-auto w-full max-w-6xl px-4 sm:px-6',
  sectionPadding: 'py-16 lg:py-24',
}

export const badge = {
  base: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase',
  facultad: 'bg-unimayor-100 text-unimayor-900',
  tipoOficial: 'bg-unimayor-900 text-white',
  tipoInstitucional: 'bg-unimayor-900 text-white',
  tipoEafi: 'bg-gold text-unimayor-950',
  tipoComunidad: 'bg-white text-ink ring-1 ring-line ring-inset',
  estadoPublicado: 'bg-success-soft text-success',
  estadoRevision: 'bg-warning-soft text-warning',
  estadoRechazado: 'bg-error-soft text-error',
  estadoBorrador: 'bg-line-soft text-muted',
  portal: 'bg-unimayor-nav/10 text-unimayor-700',
}

export const badgeTipo: Record<string, string> = {
  OFICIAL: badge.tipoOficial,
  INSTITUCIONAL: badge.tipoInstitucional,
  EAFI: badge.tipoEafi,
  COMUNIDAD: badge.tipoComunidad,
}

export const badgeEstado: Record<string, string> = {
  PUBLICADO: badge.estadoPublicado,
  EN_REVISION: badge.estadoRevision,
  RECHAZADO: badge.estadoRechazado,
  BORRADOR: badge.estadoBorrador,
  CANCELADO: badge.estadoRechazado,
  FINALIZADO: badge.estadoBorrador,
  AGOTADO: badge.estadoRevision,
}

export const etiquetaEstado: Record<string, string> = {
  PUBLICADO: 'Publicado',
  EN_REVISION: 'En revisión',
  RECHAZADO: 'Rechazado',
  BORRADOR: 'Borrador',
  ELIMINADO: 'Eliminado',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado',
  AGOTADO: 'Agotado',
}

export const badgeOrden: Record<string, string> = {
  PENDIENTE: badge.estadoRevision,
  PAGADA: badge.estadoPublicado,
  FALLIDA: badge.estadoRechazado,
  EXPIRADA: badge.estadoBorrador,
  CANCELADA: badge.estadoRechazado,
  REEMBOLSADA: badge.tipoEafi,
}

export const etiquetaOrden: Record<string, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGADA: 'Pagada',
  FALLIDA: 'Pago fallido',
  EXPIRADA: 'Expirada',
  CANCELADA: 'Cancelada',
  REEMBOLSADA: 'Reembolsada',
}

export const badgeEntrada: Record<string, string> = {
  VALIDA: badge.estadoPublicado,
  USADA: badge.tipoEafi,
  ANULADA: badge.estadoRechazado,
}

export const etiquetaEntrada: Record<string, string> = {
  VALIDA: 'Válida',
  USADA: 'Usada',
  ANULADA: 'Anulada',
}

export const etiquetaTipo: Record<string, string> = {
  INSTITUCIONAL: 'Institucional',
  EAFI: 'EAFI',
  COMUNIDAD: 'Comunidad',
  OFICIAL: 'Oficial',
}

export const input = {
  base: 'w-full rounded-box border-2 border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 hover:border-unimayor-100 focus:border-unimayor-900 focus:shadow-[0_0_0_4px_rgb(0_72_132/0.12)] disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted',
  error: 'border-error focus:border-error focus:shadow-[0_0_0_4px_rgb(220_38_38/0.12)]',
  label: 'text-[13px] font-bold text-ink',
  ayuda: 'text-xs text-muted',
  mensajeError: 'text-xs font-semibold text-error',
}

export const eyebrow = {
  base: 'text-[0.75rem] font-bold tracking-[0.2em] uppercase text-unimayor-700',
  onDark: 'text-[0.75rem] font-bold tracking-[0.2em] uppercase text-gold',
}

export const motion = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
  /** cubic-bezier(0.16, 1, 0.3, 1) — salida enfática para entradas */
  easeEmphasis: [0.16, 1, 0.3, 1] as const,
  easeStandard: [0.2, 0, 0, 1] as const,
  spring: { type: 'spring', damping: 26, stiffness: 260 } as const,
  springSoft: { type: 'spring', damping: 24, stiffness: 140 } as const,
  /** stagger por ítem en grids (DESIGN.md §7: ~80ms, máx ~400ms) */
  stagger: 0.08,
}
