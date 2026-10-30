"use client";

import { useRouter } from "next/navigation";
import { llamarApi } from "@/lib/api";

export function BotonCerrarSesion() {
  const router = useRouter();

  async function cerrar() {
    await llamarApi("/api/auth/logout", "POST");
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-borde btn-pequeno" onClick={cerrar}>
      Salir
    </button>
  );
}
