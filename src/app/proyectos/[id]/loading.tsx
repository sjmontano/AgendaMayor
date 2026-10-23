import { Cargando, Hueso, SkeletonText } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Cargando texto="Cargando proyecto" />
      <div className="bg-unimayor-900" aria-hidden="true">
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-10 pb-14 sm:px-6">
          <div className="skeleton-dark h-4 w-40 rounded" />
          <div className="skeleton-dark h-12 w-3/4 rounded-lg" />
          <div className="skeleton-dark h-4 w-1/3 rounded" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Hueso className="aspect-[16/9] w-full rounded-tile" />
          <SkeletonText lines={6} />
        </div>
        <Hueso className="h-80 rounded-tile" />
      </div>
    </>
  );
}
