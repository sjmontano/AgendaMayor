import { cn, iniciales } from "@/lib/utils";

const tamanos = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-14 text-lg",
  xl: "size-24 text-3xl",
};

export function Avatar({
  nombre,
  apellido,
  src,
  tamano = "md",
  className,
}: {
  nombre?: string | null;
  apellido?: string | null;
  src?: string | null;
  tamano?: keyof typeof tamanos;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${nombre ?? ""} ${apellido ?? ""}`.trim() || "Avatar"}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white", tamanos[tamano], className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-unimayor-900 to-unimayor-nav font-extrabold text-white ring-2 ring-white",
        tamanos[tamano],
        className
      )}
    >
      {iniciales(nombre, apellido)}
    </span>
  );
}
