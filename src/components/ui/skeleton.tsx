import { cn } from "@/lib/utils";

/**
 * Skeletons — shimmer institucional (.skeleton en globals.css).
 * Siempre aria-hidden; la región que carga anuncia el estado con aria-busy
 * o con el texto visualmente oculto de <Cargando />.
 */

export function Hueso({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden="true" />;
}

export function Cargando({ texto = "Cargando contenido" }: { texto?: string }) {
  return (
    <p className="sr-only" role="status">
      {texto}
    </p>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-tile border border-line bg-white" aria-hidden="true">
      <Hueso className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex gap-2">
          <Hueso className="h-5 w-20 rounded-full" />
          <Hueso className="h-5 w-16 rounded-full" />
        </div>
        <Hueso className="h-5 w-4/5" />
        <Hueso className="h-3.5 w-full" />
        <Hueso className="h-3.5 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Hueso className="size-7 rounded-full" />
          <Hueso className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      <Cargando />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

export function SkeletonText({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Hueso key={i} className="h-3.5" />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <section className="w-full bg-unimayor-900" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6">
        <div className="max-w-2xl space-y-4">
          <div className="skeleton-dark h-3 w-28 rounded" />
          <div className="skeleton-dark h-12 w-3/4 rounded-lg" />
          <div className="skeleton-dark h-4 w-1/2 rounded" />
        </div>
      </div>
    </section>
  );
}

export function SkeletonBadge() {
  return <Hueso className="inline-block h-6 w-20 rounded-full" />;
}

export function SkeletonLista({ filas = 4 }: { filas?: number }) {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: filas }, (_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Hueso className="size-10 rounded-box" />
          <div className="flex-1 space-y-2">
            <Hueso className="h-3.5 w-3/4" />
            <Hueso className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SkeletonBento() {
  return (
    <>
      <Cargando texto="Cargando tu panel" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        <Hueso className="h-52 rounded-tile sm:col-span-2" />
        <Hueso className="h-52 rounded-tile" />
        <Hueso className="h-52 rounded-tile" />
        <Hueso className="h-72 rounded-tile sm:col-span-2" />
        <Hueso className="h-72 rounded-tile sm:col-span-2" />
      </div>
    </>
  );
}
