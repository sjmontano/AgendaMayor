/** Muestra un estado o tipo como etiqueta de color (los colores están en globals.css). */
const TEXTOS: Record<string, string> = {
  EN_REVISION: "En revisión",
  PUBLICADO: "Publicado",
  RECHAZADO: "Rechazado",
  BORRADOR: "Borrador",
  PENDIENTE: "Pendiente de pago",
  PAGADA: "Pagada",
  RECHAZADA: "Pago rechazado",
  EXPIRADA: "Expirada",
  VALIDA: "Válida",
  USADA: "Usada",
  DISPONIBLE: "Disponible",
  OCUPADO: "Ocupado",
  INSTITUCIONAL: "Institucional",
  OFICIAL: "Oficial",
  COMUNIDAD: "Comunidad",
  EAFI: "EAFI",
};

export function Etiqueta({ valor }: { valor: string }) {
  return <span className={`etiqueta etiqueta--${valor}`}>{TEXTOS[valor] ?? valor}</span>;
}
