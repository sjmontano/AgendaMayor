import { PublicarForm } from "@/components/proyectos/publicar-form";

/** Página /proyectos/nuevo — HU-06. Requiere sesión (el API responde 401 si no). */
export default function NuevoProyectoPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#195a90] uppercase">Vitrina</p>
      <h1 className="mt-1 text-4xl font-extrabold text-[#004884]">Publicar proyecto</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Tu proyecto quedará en revisión hasta que un docente lo avale.
      </p>
      <div className="mt-6">
        <PublicarForm />
      </div>
    </div>
  );
}
