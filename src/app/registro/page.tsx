import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegistroForm } from "@/components/auth/registro-form";
import { MarcoAuth } from "@/components/auth/marco-auth";
import { usuarioActual } from "@/lib/sesion-vista";

export const metadata: Metadata = { title: "Crear cuenta" };

/** Página /registro — HU-01. Con sesión activa redirige al panel. */
export default async function RegistroPage() {
  if (await usuarioActual()) redirect("/panel");
  return (
    <MarcoAuth
      eyebrow="Únete a la vitrina"
      titulo="Crea tu cuenta"
      descripcion="Toma menos de un minuto. Solo necesitas tu correo @unimayor.edu.co."
    >
      <RegistroForm />
    </MarcoAuth>
  );
}
