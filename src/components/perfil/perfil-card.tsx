/**
 * Tarjeta de perfil — Vista (capa de Presentación).
 */
export interface PerfilCardData {
  username: string;
  nombre: string;
  apellido: string;
  facultad: string | null;
  programa: string | null;
  semestre: number | null;
  semillero: string | null;
  bio: string | null;
  avatar: string | null;
}

export function PerfilCard({ perfil }: { perfil: PerfilCardData }) {
  const inicial = (perfil.nombre?.charAt(0) ?? "U").toUpperCase();
  return (
    <div className="flex flex-col gap-4 rounded-[10px] border-2 border-[#E4E4E7] bg-white p-6 sm:flex-row sm:items-center">
      {perfil.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={perfil.avatar} alt={`${perfil.nombre} ${perfil.apellido}`} className="size-24 shrink-0 rounded-full border-2 border-[#004884] object-cover" />
      ) : (
        <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#004884] text-4xl font-extrabold text-white" aria-hidden="true">
          {inicial}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-[#004884]">
          {perfil.nombre} {perfil.apellido}
        </h1>
        <p className="text-sm font-bold text-[#195a90]">@{perfil.username}</p>
        <p className="mt-1 text-sm">
          {[perfil.programa, perfil.semestre ? `Semestre ${perfil.semestre}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {perfil.facultad && <p className="text-sm text-zinc-600">{perfil.facultad}</p>}
        {perfil.semillero && <p className="text-sm text-zinc-600">Semillero {perfil.semillero}</p>}
        {perfil.bio && <p className="mt-2 text-sm leading-relaxed">{perfil.bio}</p>}
      </div>
    </div>
  );
}
