import { Hueso, SkeletonGrid } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b border-line bg-unimayor-tint" aria-hidden="true">
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-12 pb-8 sm:px-6">
          <Hueso className="h-3 w-24" />
          <Hueso className="h-10 w-80" />
          <Hueso className="mt-6 h-13 w-full rounded-tile" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Hueso key={i} className="h-9 w-32 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SkeletonGrid count={6} />
      </div>
    </>
  );
}
