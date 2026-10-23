import { SkeletonHero, SkeletonGrid } from "@/components/ui/skeleton";

/** loading.tsx — skeleton genérico (convención Next). */
export default function Loading() {
  return (
    <>
      <SkeletonHero />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SkeletonGrid count={3} />
      </div>
    </>
  );
}
