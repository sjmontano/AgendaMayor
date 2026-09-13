import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * Test de arquitectura: verifica la regla de capas por análisis estático.
 * - Vistas (components/**) nunca importan el Modelo (@/modelo).
 * - Services nunca mencionan supabase (solo el Repository accede a datos).
 */
function archivosTs(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...archivosTs(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const SRC = join(__dirname, "..", "src");

const sinComentarios = (codigo: string) =>
  codigo
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");

describe("arquitectura por capas", () => {
  it("components/** no importa @/modelo", () => {
    const violaciones = archivosTs(join(SRC, "components")).filter((f) =>
      sinComentarios(readFileSync(f, "utf8")).includes("@/modelo")
    );
    expect(violaciones).toEqual([]);
  });

  it("*.service.ts no importa supabase (ignora comentarios)", () => {
    const violaciones = archivosTs(join(SRC, "modelo"))
      .filter((f) => f.endsWith(".service.ts"))
      .filter((f) => /supabase/i.test(sinComentarios(readFileSync(f, "utf8"))));
    expect(violaciones).toEqual([]);
  });
});
