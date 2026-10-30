import { MarcoAuth } from "@/components/auth/marco-auth";
import { RegistroForm } from "@/components/auth/registro-form";

export default function RegistroPage() {
  return (
    <MarcoAuth titulo="Crear cuenta">
      <RegistroForm />
    </MarcoAuth>
  );
}
