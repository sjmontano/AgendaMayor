import { SkeletonText } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="h-10 w-3/4 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6">
        <SkeletonText lines={6} />
      </div>
    </div>
  );
}
