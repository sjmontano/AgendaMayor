import { describe, it, expect } from "vitest";
import { obtenerTransicion } from "@/modelo/proyectos/proyecto.state";

describe("proyecto.state — obtenerTransicion", () => {
  it("EN_REVISION → PUBLICADO permitido para DOCENTE", () => {
    expect(obtenerTransicion("EN_REVISION", "PUBLICADO", "DOCENTE")).not.toBeNull();
  });

  it("EN_REVISION → PUBLICADO denegado para ESTUDIANTE", () => {
    expect(obtenerTransicion("EN_REVISION", "PUBLICADO", "ESTUDIANTE")).toBeNull();
  });

  it("BORRADOR → PUBLICADO denegado (salta revisión)", () => {
    expect(obtenerTransicion("BORRADOR", "PUBLICADO", "ADMIN")).toBeNull();
  });

  it("RECHAZADO → EN_REVISION permitido para ESTUDIANTE (reenvío)", () => {
    expect(obtenerTransicion("RECHAZADO", "EN_REVISION", "ESTUDIANTE")).not.toBeNull();
  });

  it("ELIMINADO no permite ninguna transición", () => {
    expect(obtenerTransicion("ELIMINADO", "PUBLICADO", "ADMIN")).toBeNull();
    expect(obtenerTransicion("ELIMINADO", "BORRADOR", "ADMIN")).toBeNull();
  });
});
