"use client";

import { ErrorVista } from "@/components/layout/error-vista";

/** error.tsx — reintento ante fallo (convención Next). */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorVista titulo="Algo salió mal" reset={reset} />;
}
