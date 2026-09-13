import { describe, it, expect, vi, afterEach } from "vitest";
import { apiGet } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiGet", () => {
  it("retorna data cuando error es null", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(JSON.stringify({ data: { ok: true }, error: null }))
    );
    expect(await apiGet("/api/salud")).toEqual({ ok: true });
  });

  it("lanza con el mensaje del API cuando hay error", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify({ data: null, error: { message: "No autenticado" } }),
          { status: 401 }
        )
    );
    await expect(apiGet("/api/perfil")).rejects.toThrow("No autenticado");
  });
});
