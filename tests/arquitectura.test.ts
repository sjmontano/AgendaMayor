import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * Test de arquitectura: verifica la regla de capas por análisis estático.
 * - Vistas (components/**) nunca importan el Modelo (@/modelo).
 * - Solo los *.repository.ts usan Prisma (patrón Repository).
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

  it("solo los *.repository.ts usan la conexión a la BD (@/lib/db)", () => {
    const violaciones = archivosTs(SRC)
      .filter((f) => !f.endsWith(".repository.ts"))
      .filter((f) => sinComentarios(readFileSync(f, "utf8")).includes("@/lib/db"));
    expect(violaciones).toEqual([]);
  });
});
