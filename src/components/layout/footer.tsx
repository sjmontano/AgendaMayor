import Image from "next/image";
import Link from "next/link";

/**
 * Footer institucional — mismos datos del portal UNIMAYOR (medidos 2026-10-23),
 * layout más aireado, enlaces con hover dorado y franja GOV.CO.
 */
const PORTAL = "https://www.unimayor.edu.co";

const columnas = [
  {
    titulo: "Agenda Mayor",
    enlaces: [
      { href: "/proyectos", label: "Vitrina de proyectos" },
      { href: "/eventos", label: "Cartelera de eventos" },
      { href: "/proyectos/nuevo", label: "Publicar proyecto" },
      { href: "/registro", label: "Crear cuenta" },
    ],
  },
  {
    titulo: "Facultades",
    enlaces: [
      { href: `${PORTAL}/oferta-academica/facultad-de-arte-y-diseno`, label: "Arte y Diseño" },
      { href: `${PORTAL}/oferta-academica/facultad-de-educacion`, label: "Educación" },
      { href: `${PORTAL}/oferta-academica/facultad-de-ingenieria`, label: "Ingeniería" },
      {
        href: `${PORTAL}/oferta-academica/facultad-de-ciencias-sociales-y-de-la-administracion`,
        label: "Ciencias Sociales y de la Administración",
      },
    ],
  },
  {
    titulo: "Institucional",
    enlaces: [
      { href: `${PORTAL}/institucional/la-institucion`, label: "La Institución" },
      { href: `${PORTAL}/investigaciones`, label: "Investigaciones" },
      { href: `${PORTAL}/transparencia-y-acceso-a-la-informacion-publica`, label: "Transparencia" },
      { href: `${PORTAL}/atencion-y-servicio-al-ciudadano`, label: "Atención al ciudadano" },
      { href: "https://www.virtualunimayor.edu.co/", label: "UNIMAYOR Virtual" },
    ],
  },
];

const redes = [
  { href: "https://www.facebook.com/unimayor", label: "Facebook", d: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z" },
  { href: "https://www.instagram.com/unimayor/", label: "Instagram", d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5v.01" },
  { href: "https://x.com/unimayor", label: "X", d: "M4 4l16 16M20 4 4 20" },
  { href: "https://www.youtube.com/user/colmayorcauca", label: "YouTube", d: "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm7 1v6l5-3z" },
  { href: "https://www.tiktok.com/@unimayor_oficial", label: "TikTok", d: "M14 3v11a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 5" },
];

function esExterno(href: string) {
  return href.startsWith("http");
}

export function Footer() {
  return (
    <footer className="on-dark relative mt-auto overflow-hidden bg-unimayor-950 text-white">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-gold-hover to-gold" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-10 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Image
            src="/brand/logo_blanco.png"
            alt="Institución Universitaria Colegio Mayor del Cauca"
            width={150}
            height={150}
            className="h-auto w-36"
          />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            Agenda Mayor es la vitrina de proyectos, semilleros y eventos académicos de la comunidad UNIMAYOR.
            Informativa y gratuita.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Redes sociales de UNIMAYOR">
            {redes.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${r.label} de UNIMAYOR (abre en nueva ventana)`}
                  className="flex size-10 items-center justify-center rounded-box bg-white/8 ring-1 ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:text-unimayor-950 hover:ring-gold"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={r.d} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columnas.map((c) => (
            <nav key={c.titulo} aria-label={c.titulo}>
              <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">{c.titulo}</p>
              <ul className="mt-4 space-y-2.5">
                {c.enlaces.map((e) => (
                  <li key={e.href}>
                    {esExterno(e.href) ? (
                      <a
                        href={e.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/80 underline-offset-4 transition-colors hover:text-gold hover:underline"
                      >
                        {e.label}
                      </a>
                    ) : (
                      <Link href={e.href} className="text-sm text-white/80 underline-offset-4 transition-colors hover:text-gold hover:underline">
                        {e.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <address className="grid gap-6 rounded-tile bg-white/6 p-6 text-sm not-italic ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-bold text-white">Sede principal</p>
            <p className="mt-1 text-white/75">Claustro Encarnación, Cra. 5 # 5 - 40</p>
            <p className="text-white/75">Popayán, Colombia · CP 190003</p>
          </div>
          <div>
            <p className="font-bold text-white">Contacto</p>
            <p className="mt-1 text-white/75">Conmutador +57 (602) 8274178</p>
            <p className="text-white/75">Línea gratuita 01-8000-931018 ext 1</p>
          </div>
          <div>
            <p className="font-bold text-white">Correo</p>
            <a href="mailto:institucional@unimayor.edu.co" className="mt-1 block py-0.5 text-white/75 underline-offset-4 hover:text-gold hover:underline">
              institucional@unimayor.edu.co
            </a>
            <a href="mailto:notificacionjudicial@unimayor.edu.co" className="block py-0.5 text-white/75 underline-offset-4 hover:text-gold hover:underline">
              Notificaciones judiciales
            </a>
          </div>
          <div>
            <p className="font-bold text-white">Atención presencial</p>
            <p className="mt-1 text-white/75">Lunes a viernes</p>
            <p className="text-white/75">8:00 a.m. – 6:00 p.m.</p>
          </div>
        </address>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          IES pública sujeta a inspección y vigilancia del Ministerio de Educación · SNIES 3104 · NIT 891.500.759-1
        </p>
        <p>
          Línea anticorrupción 01-8000-931018 ext 2 ·{" "}
          <a href="mailto:controlinterno@unimayor.edu.co" className="underline-offset-4 hover:text-gold hover:underline">
            controlinterno@unimayor.edu.co
          </a>
        </p>
      </div>

      <div className="relative bg-unimayor-nav">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-[12px] font-bold sm:px-6">
          <a href="https://www.gov.co" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-unimayor-nav">GOV.CO</span>
            Portal del Estado colombiano
          </a>
          <a href="https://colombia.co/" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Marca País Colombia
          </a>
        </div>
      </div>
    </footer>
  );
}
