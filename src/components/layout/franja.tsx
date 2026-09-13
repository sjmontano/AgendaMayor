/**
 * Franja institucional superior — Vista (capa de Presentación).
 * Réplica la franja del portal UNIMAYOR: fondo #004884, texto institucional.
 */
export function Franja() {
  return (
    <div className="bg-[#004884] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5 text-[11px] font-semibold tracking-wide">
        <span>Institución Universitaria Colegio Mayor del Cauca · SNIES 3104</span>
        <a
          href="https://www.gov.co"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          gov.co
        </a>
      </div>
    </div>
  );
}
