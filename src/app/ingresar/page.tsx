import { IngresoForm } from "@/components/auth/ingreso-form";

/** Página /ingresar — HU-02. */
export default function IngresarPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Cuenta UNIMAYOR</p>
      <h1 className="mt-1 text-4xl font-extrabold text-[#004884]">Iniciar sesión</h1>
      <div className="mt-6">
        <IngresoForm />
      </div>
    </div>
  );
}
