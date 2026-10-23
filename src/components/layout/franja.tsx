/**
 * Franja institucional superior — identifica la subpágina como parte de UNIMAYOR.
 * Fondo profundo, enlaces al portal y a GOV.CO.
 */
export function Franja() {
  return (
    <div className="on-dark bg-unimayor-950 text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-4 text-[12px] font-semibold sm:px-6">
        <a
          href="https://www.gov.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded opacity-90 transition-opacity hover:opacity-100"
          aria-label="GOV.CO, portal del Estado colombiano (abre en nueva ventana)"
        >
          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-unimayor-nav">GOV.CO</span>
          <span className="hidden sm:inline">Institución Universitaria Colegio Mayor del Cauca</span>
          <span className="sm:hidden">UNIMAYOR</span>
        </a>
        <nav aria-label="Enlaces institucionales" className="flex items-center gap-4">
          <a
            href="https://www.unimayor.edu.co/transparencia-y-acceso-a-la-informacion-publica"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-white/80 underline-offset-4 transition-colors hover:text-gold hover:underline md:inline"
          >
            Transparencia
          </a>
          <a
            href="https://www.unimayor.edu.co/atencion-y-servicio-al-ciudadano"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-white/80 underline-offset-4 transition-colors hover:text-gold hover:underline md:inline"
          >
            Atención al ciudadano
          </a>
          <a
            href="https://www.unimayor.edu.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            Portal UNIMAYOR
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </nav>
      </div>
    </div>
  );
}
