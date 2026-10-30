import { redirect } from "next/navigation";
import { MarcoAuth } from "@/components/auth/marco-auth";
import { IngresoForm } from "@/components/auth/ingreso-form";
import { usuarioActualOpcional } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function IngresarPage() {
  // Si ya inició sesión, no tiene sentido mostrar el formulario
  if (await usuarioActualOpcional()) redirect("/panel");

  return (
    <MarcoAuth titulo="Ingresar">
      <IngresoForm />
    </MarcoAuth>
  );
}
