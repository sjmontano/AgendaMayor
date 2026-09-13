/**
 * Design tokens — Agenda Mayor.
 * Fuente: unimayor.edu.co (estilos medidos) + patrones de Opera Prima.
 * Regla: usar estos tokens, nunca hex sueltos en componentes.
 */

export const colors = {
  /* ── Institucionales UNIMAYOR ── */
  unimayor900: '#004884', // títulos, focus, CTA primario
  unimayor700: '#195a90', // enlaces, acentos
  unimayor600: '#19589f', // bordes institucionales
  unimayorNav: '#3366cc', // fondo navbar principal
  unimayorTint: '#f8fbfd', // fondos alternos de sección

  /* ── Neutros ── */
  white: '#FFFFFF',
  ink: '#333030', // texto primario
  line: '#E4E4E7', // bordes, separadores

  /* ── Funcionales ── */
  error: '#DC2626',
  success: '#16A34A',
}

export const font = {
  sans: 'Nunito Sans',
}

export const layout = {
  maxWidth: 'max-w-6xl',
  sectionPadding: 'px-6 py-16 lg:py-24',
  contentPadding: 'clamp(1.5rem, 5vw, 4rem)',
  sectionGap: '64px',
}

export const btn = {
  base: 'inline-flex items-center justify-center gap-2 border-2 text-xs font-bold tracking-widest uppercase transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:cursor-not-allowed',
  primary: `inline-flex items-center justify-center gap-2 border-2 text-xs font-bold tracking-widest uppercase transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:cursor-not-allowed bg-[#004884] border-[#004884] text-white shadow-[4px_4px_0_#333030] hover:bg-transparent hover:text-[#004884] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:bg-zinc-200 disabled:border-zinc-200 disabled:text-zinc-400 disabled:shadow-none`,
  secondary: `inline-flex items-center justify-center gap-2 border-2 text-xs font-bold tracking-widest uppercase transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:cursor-not-allowed border-[#004884] text-[#004884] hover:bg-[#004884] hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#333030] disabled:border-zinc-200 disabled:text-zinc-400 disabled:shadow-none disabled:hover:bg-transparent`,
  ghost: `inline-flex items-center justify-center gap-2 border-2 text-xs font-bold tracking-widest uppercase transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:cursor-not-allowed border-transparent text-[#333030] hover:bg-zinc-100 disabled:text-zinc-400`,
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-sm',
}

export const card = {
  base: 'border-2 border-[#E4E4E7] bg-white rounded-[10px] transition-all duration-200',
  hover: 'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#004884]',
  evento:
    'group bg-white ring-2 ring-transparent rounded-[10px] transition-all duration-200 hover:shadow-[4px_4px_0_#004884] hover:ring-[#004884]',
  proyecto:
    'group flex flex-col border-2 border-[#E4E4E7] bg-white rounded-[10px] p-6 transition-all duration-200 hover:bg-[#f8fbfd]',
}

export const badge = {
  base: 'inline-flex items-center px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full',
  facultad: 'bg-[#f8fbfd] text-[#004884] border border-[#004884]/30',
  tipoOficial: 'bg-[#004884] text-white',
  tipoEafi: 'bg-[#195a90] text-white',
  tipoComunidad: 'bg-white text-[#333030] border-2 border-[#E4E4E7]',
  estadoPublicado: 'bg-[#16A34A] text-white',
  estadoRevision: 'bg-amber-100 text-amber-800 border border-amber-300',
  estadoRechazado: 'bg-[#DC2626] text-white',
}

export const input = {
  base: 'w-full border-2 bg-white px-4 py-3 text-sm font-medium text-[#333030] outline-none transition-all placeholder:text-zinc-400 rounded-[10px]',
  border: 'border-[#E4E4E7]',
  focus: 'focus:border-[#004884] focus:shadow-[3px_3px_0_#004884]',
  error: 'border-[#DC2626] shadow-[3px_3px_0_#DC2626]',
}

export const eyebrow = {
  base: 'text-[0.75rem] font-bold tracking-[0.2em] uppercase text-[#195a90]',
  onDark: 'text-[0.75rem] font-bold tracking-[0.2em] uppercase text-white/80',
}

export const motion = {
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  easing: 'ease-[cubic-bezier(0.2,0,0,1)]',
}
