import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiHttpError, apiPost, mensajeDeError } from "@/lib/api";

/**
 * El usuario nunca ve excepciones técnicas ("Unexpected token '<'…",
 * "Failed to fetch", mensajes de 500): solo textos curados en español.
 */
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function silenciarConsola() {
  vi.spyOn(console, "error").mockImplementation(() => {});
}

async function errorDe(promesa: Promise<unknown>) {
  try {
    await promesa;
  } catch (e) {
    return e as ApiHttpError;
  }
  throw new Error("se esperaba un error");
}

describe("errores de la API para el usuario", () => {
  it("una respuesta HTML (404/500) no filtra el error de parseo JSON", async () => {
    silenciarConsola();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<!DOCTYPE html><html></html>", { status: 404 })));
    const e = await errorDe(apiPost("/api/auth/login", {}));
    expect(e).toBeInstanceOf(ApiHttpError);
    expect(e.message).not.toMatch(/Unexpected token|DOCTYPE|JSON/);
    expect(e.message).toMatch(/No encontramos/);
  });

  it("un fallo de red se traduce", async () => {
    silenciarConsola();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    const e = await errorDe(apiPost("/api/auth/login", {}));
    expect(e.message).not.toMatch(/Failed to fetch/);
    expect(e.message).toMatch(/conexión/);
  });

  it("los 5xx muestran un mensaje genérico aunque el servidor envíe detalles", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ data: null, error: { message: "Falta STRIPE_SECRET_KEY en .env" } }), { status: 503 })
    ));
    const e = await errorDe(apiPost("/api/checkout", {}));
    expect(e.message).not.toMatch(/STRIPE/);
  });

  it("los errores curados (4xx) llegan tal cual y 'Datos inválidos' muestra el motivo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ data: null, error: { message: "Correo o contraseña incorrectos" } }), { status: 401 })
    ));
    expect((await errorDe(apiPost("/api/auth/login", {}))).message).toBe("Correo o contraseña incorrectos");

    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: null,
          error: { message: "Datos inválidos", details: [{ path: ["email"], message: "Solo se permiten correos @unimayor.edu.co" }] },
        }),
        { status: 400 }
      )
    ));
    expect((await errorDe(apiPost("/api/usuarios/registro", {}))).message).toBe("Solo se permiten correos @unimayor.edu.co");
  });

  it("mensajeDeError oculta excepciones que no son de la API", () => {
    silenciarConsola();
    expect(mensajeDeError(new TypeError("Cannot read properties of undefined"), "Algo falló")).toBe("Algo falló");
    expect(mensajeDeError(new ApiHttpError("Mensaje curado", 400))).toBe("Mensaje curado");
  });
});
