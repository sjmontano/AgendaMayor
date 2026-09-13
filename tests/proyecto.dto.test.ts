import { describe, it, expect } from "vitest";
import {
  ProyectoCreateSchema,
  ProyectoQuerySchema,
} from "@/modelo/proyectos/proyecto.dto";

describe("proyecto.dto", () => {
  it("rechaza título de más de 100 caracteres", () => {
    const r = ProyectoCreateSchema.safeParse({
      titulo: "x".repeat(101),
      descripcion: "d",
      facultad: "Ingeniería",
      programa: "Informática",
      tipo: "COMUNIDAD",
    });
    expect(r.success).toBe(false);
  });

  it("acepta proyecto COMUNIDAD válido", () => {
    const r = ProyectoCreateSchema.safeParse({
      titulo: "Mi proyecto",
      descripcion: "Descripción",
      facultad: "Ingeniería",
      programa: "Informática",
      tipo: "COMUNIDAD",
    });
    expect(r.success).toBe(true);
  });

  it("rechaza page=0 en la query", () => {
    const r = ProyectoQuerySchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });
});
