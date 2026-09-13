import Image from "next/image";

/**
 * Footer institucional — Vista (capa de Presentación).
 * Datos reales del portal UNIMAYOR.
 */
export function Footer() {
  return (
    <footer className="bg-[#004884] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div className="flex items-start">
          <Image
            src="/brand/logo_blanco.png"
            alt="Institución Universitaria Colegio Mayor del Cauca"
            width={135}
            height={135}
            style={{ height: "auto" }}
          />
        </div>
        <div className="space-y-2 pt-1 text-sm text-white/80">
          <p className="font-bold tracking-widest text-white uppercase">Contacto</p>
          <p>Claustro Encarnación Cra. 5 # 5 - 40, Popayán</p>
          <p>Conmutador: (602) 8274178 · Línea gratuita: 01-8000-931018</p>
          <p>institucional@unimayor.edu.co</p>
        </div>
        <div className="space-y-2 pt-1 text-sm text-white/80">
          <p className="font-bold tracking-widest text-white uppercase">Agenda Mayor</p>
          <p>Vitrina de proyectos y eventos estudiantiles.</p>
          <p>Lun–Vie 8:00 a.m. – 6:00 p.m.</p>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-white/80">
          SNIES 3104 · NIT 891.500.759-1 · IES pública sujeta a inspección y vigilancia del MEN
        </div>
      </div>
    </footer>
  );
}
