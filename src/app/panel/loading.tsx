import { SkeletonBento } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-unimayor-tint">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <SkeletonBento />
      </div>
    </div>
  );
}
