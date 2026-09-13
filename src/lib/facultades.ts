export const FACULTADES = [
  { slug: "arte-diseno", nombre: "Arte y Diseño" },
  { slug: "ingenieria", nombre: "Ingeniería" },
  { slug: "sociales-admin", nombre: "Ciencias Sociales y de la Administración" },
  { slug: "educacion", nombre: "Educación" },
] as const;

export type FacultadSlug = (typeof FACULTADES)[number]["slug"];
