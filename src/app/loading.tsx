import { SkeletonHero, SkeletonGrid } from "@/components/ui/skeleton";

/** loading.tsx — skeleton de la home (convención Next). */
export default function Loading() {
  return (
    <>
      <SkeletonHero />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SkeletonGrid count={3} />
      </div>
    </>
  );
}
