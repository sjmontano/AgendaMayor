/**
 * Skeletons y loaders — patrón traído de Opera Prima, adaptado a UNIMAYOR.
 * Uso: mostrar mientras Server Components / fetch resuelven.
 */

export function SkeletonCard() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-32 w-full animate-pulse rounded-[10px] bg-zinc-200" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-zinc-200"
          style={{ width: `${55 + i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonHero() {
  return (
    <section className="w-full bg-[#004884]" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-12 lg:pb-16">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="h-3 w-28 animate-pulse rounded bg-white/40" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-white/40" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/40" />
          </div>
          <div className="hidden size-40 shrink-0 animate-pulse rounded-[10px] bg-white/30 sm:block" />
        </div>
      </div>
    </section>
  )
}

export function SkeletonBadge() {
  return <div className="inline-block h-6 w-20 animate-pulse rounded-full bg-zinc-200" aria-hidden="true" />
}

export function LoadingButton({ label = 'Cargando' }: { label?: string }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex cursor-not-allowed items-center gap-2 border-2 border-zinc-200 bg-zinc-100 px-6 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase"
    >
      <span className="size-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" aria-hidden="true" />
      {label}
    </button>
  )
}
