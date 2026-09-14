export const FACULTADES = [
  { slug: "arte-diseno", nombre: "Arte y Diseño" },
  { slug: "ingenieria", nombre: "Ingeniería" },
  { slug: "sociales-admin", nombre: "Ciencias Sociales y de la Administración" },
  { slug: "educacion", nombre: "Educación" },
] as const;

export type FacultadSlug = (typeof FACULTADES)[number]["slug"];

export const facultadProgramas: Record<FacultadSlug, string[]> = {
  "arte-diseno": ["Diseño Visual", "Arquitectura", "Comunicación Social"],
  "ingenieria": ["Ingeniería Informática", "Ingeniería Civil", "Tecnología en Desarrollo de Software"],
  "sociales-admin": ["Administración de Empresas", "Derecho", "Contaduría Pública"],
  "educacion": ["Educación Primaria", "Educación Secundaria en Ciencias", "Educación Artística"],
};
