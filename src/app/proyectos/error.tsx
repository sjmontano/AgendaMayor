"use client";

import { ErrorVista } from "@/components/layout/error-vista";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorVista titulo="No pudimos cargar la vitrina" reset={reset} />;
}
