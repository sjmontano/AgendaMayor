"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h2 className="text-2xl font-bold text-[#004884]">No pudimos cargar la vitrina</h2>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 border-2 border-[#004884] px-6 py-3 text-xs font-bold tracking-widest text-[#004884] uppercase hover:bg-[#004884] hover:text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
