import Link from "next/link";
import { Etiqueta } from "@/components/ui/etiqueta";
import { formatearFecha } from "@/lib/formato";

export interface ProyectoTarjeta {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  fotos: string[];
  facultad: string;
  programa: string;
  tipo: string;
  estado?: string;
  destacado?: boolean;
  fecha_registro: string;
  autor?: { username: string; nombre: string; apellido: string } | null;
}

interface Props {
  proyecto: ProyectoTarjeta;
  mostrarEstado?: boolean;
}

export function ProyectoCard({ proyecto, mostrarEstado = false }: Props) {
  const foto = proyecto.fotos[0];
  const autor = proyecto.autor ? `${proyecto.autor.nombre} ${proyecto.autor.apellido}` : proyecto.programa;

  return (
    <Link href={`/proyectos/${proyecto.id_proyecto}`} className="tarjeta">
      <div className="tarjeta-imagen">
        {foto ? <img src={foto} alt="" /> : proyecto.titulo.charAt(0).toUpperCase()}
      </div>
      <div className="tarjeta-cuerpo">
        <div className="acciones">
          <Etiqueta valor={proyecto.tipo} />
          {proyecto.destacado && <span className="etiqueta etiqueta--dorada">★ Destacado</span>}
          {mostrarEstado && proyecto.estado && <Etiqueta valor={proyecto.estado} />}
        </div>
        <h3>{proyecto.titulo}</h3>
        <p className="recortar">{proyecto.descripcion}</p>
        <div className="tarjeta-pie">
          <span>{autor}</span>
          <span>{formatearFecha(proyecto.fecha_registro)}</span>
        </div>
      </div>
    </Link>
  );
}
