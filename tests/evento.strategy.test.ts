import { describe, it, expect, vi } from "vitest";
import type { UsuarioAuth } from "@/lib/auth";

// El repository se reemplaza por un falso: este test solo prueba las reglas (Strategy)
vi.mock("@/modelo/eventos/evento.repository", () => ({
  crear: vi.fn(async (datos) => datos),
}));

const { crear } = await import("@/modelo/eventos/evento.service");

function usuario(rol: UsuarioAuth["nombre_rol"], facultad: string | null = "Ingeniería"): UsuarioAuth {
  return { id_usuario: 1, username: "u", nombre: "N", apellido: "A", correo: "u@unimayor.edu.co", rol: 1, nombre_rol: rol, facultad };
}

const base = {
  titulo: "Evento",
  descripcion: "Desc",
  fechaInicio: "2026-11-10T10:00:00-05:00",
  fechaFin: "2026-11-10T12:00:00-05:00",
  lugar: "Auditorio",
  esVirtual: false,
  tiposEntrada: [],
  maxPorCompra: 6,
};

describe("Strategy de creación de eventos por tipo", () => {
  it("OFICIAL: solo ADMIN", async () => {
    await expect(crear({ ...base, tipo: "OFICIAL" }, usuario("DOCENTE"))).rejects.toThrow("Solo ADMIN");
    await expect(crear({ ...base, tipo: "OFICIAL" }, usuario("ADMIN"))).resolves.toBeTruthy();
  });

  it("EAFI: docente de su propia facultad, con edición", async () => {
    const eafi = { ...base, tipo: "EAFI" as const, facultad: "Ingeniería", edicion: "EAFI 2026-2" };
    await expect(crear(eafi, usuario("ESTUDIANTE"))).rejects.toThrow("Solo DOCENTE");
    await expect(crear(eafi, usuario("DOCENTE", "Educación"))).rejects.toThrow("propia facultad");
    await expect(crear(eafi, usuario("DOCENTE"))).resolves.toBeTruthy();
  });

  it("COMUNIDAD: cualquier usuario", async () => {
    await expect(crear({ ...base, tipo: "COMUNIDAD" }, usuario("ESTUDIANTE"))).resolves.toBeTruthy();
  });
});
