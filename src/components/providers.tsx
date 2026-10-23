"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ProveedorToast } from "@/components/ui/toast";

/**
 * Proveedores de cliente: motion respeta prefers-reduced-motion del sistema
 * en todos los componentes animados; toasts globales.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ProveedorToast>{children}</ProveedorToast>
    </MotionConfig>
  );
}
