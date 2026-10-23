import { BtnMayor } from "@/components/ui/botones";

/** 404 institucional. */
export default function NotFound() {
  return (
    <div className="bg-grid-light mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[clamp(5rem,14vw,9rem)] leading-none font-black tracking-[-0.05em] text-unimayor-900">
        4<span className="text-gold">0</span>4
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">Esta página no está en la agenda</h1>
      <p className="mt-2 max-w-md text-muted">Puede que el enlace haya cambiado o que el proyecto ya no esté publicado.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BtnMayor href="/">Ir al inicio</BtnMayor>
        <BtnMayor href="/proyectos" variante="secondary">
          Explorar la vitrina
        </BtnMayor>
      </div>
    </div>
  );
}
