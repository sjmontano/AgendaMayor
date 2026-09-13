import { SkeletonGrid } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-10 w-64 animate-pulse rounded bg-zinc-200" />
      <div className="mt-8">
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
