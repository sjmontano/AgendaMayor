import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { IngresoForm } from "@/components/auth/ingreso-form";
import { MarcoAuth } from "@/components/auth/marco-auth";
import { usuarioActual } from "@/lib/sesion-vista";

export const metadata: Metadata = { title: "Iniciar sesión" };

/** Página /ingresar — HU-02. Con sesión activa redirige al panel. */
export default async function IngresarPage() {
  if (await usuarioActual()) redirect("/panel");
  return (
    <MarcoAuth
      eyebrow="Cuenta UNIMAYOR"
      titulo="Bienvenido de nuevo"
      descripcion="Ingresa con tu correo institucional para publicar y seguir tus proyectos."
    >
      <Suspense>
        <IngresoForm />
      </Suspense>
    </MarcoAuth>
  );
}
