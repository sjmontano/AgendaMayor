import { createHash, createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { firmaIntegridadWompi, verificarEventoWompi, wompi } from "@/lib/integraciones/pasarelas/wompi";
import { bold, verificarFirmaBold } from "@/lib/integraciones/pasarelas/bold";

/**
 * Pasarelas Wompi y Bold: firmas (integridad, eventos, webhook) y mapeo de
 * estados. Las llamadas HTTP se simulan con fetch mockeado.
 */
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Wompi", () => {
  it("firma de integridad = SHA256(referencia + monto + moneda [+ expiración] + secreto)", () => {
    const esperado = createHash("sha256").update("AM-1" + "2000000" + "COP" + "test_integrity_x").digest("hex");
    expect(firmaIntegridadWompi("AM-1", 2000000, "COP", "test_integrity_x")).toBe(esperado);

    const conFecha = createHash("sha256")
      .update("AM-1" + "2000000" + "COP" + "2026-11-01T00:00:00.000Z" + "test_integrity_x")
      .digest("hex");
    expect(firmaIntegridadWompi("AM-1", 2000000, "COP", "test_integrity_x", "2026-11-01T00:00:00.000Z")).toBe(conFecha);
  });

  it("acepta un evento con checksum correcto y rechaza uno alterado", () => {
    vi.stubEnv("WOMPI_EVENTS_SECRET", "test_events_secreto");
    const data = { transaction: { id: "1234-1610641025-49201", status: "APPROVED", amount_in_cents: 2000000, reference: "AM-1" } };
    const timestamp = 1730000000;
    const checksum = createHash("sha256")
      .update("1234-1610641025-49201" + "APPROVED" + "2000000" + timestamp + "test_events_secreto")
      .digest("hex");
    const evento = {
      event: "transaction.updated",
      data,
      signature: { properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"], checksum },
      timestamp,
      environment: "test",
    };
    expect(verificarEventoWompi(JSON.stringify(evento), null).event).toBe("transaction.updated");

    const alterado = { ...evento, data: { transaction: { ...data.transaction, amount_in_cents: 100 } } };
    expect(() => verificarEventoWompi(JSON.stringify(alterado), null)).toThrow(/inválida/);
  });

  it("consultarPago mapea APPROVED / DECLINED y exige que la referencia coincida", async () => {
    vi.stubEnv("WOMPI_PUBLIC_KEY", "pub_test_x");
    vi.stubEnv("WOMPI_INTEGRITY_SECRET", "test_integrity_x");
    const respuesta = (status: string, reference = "AM-1") =>
      new Response(JSON.stringify({ data: { id: "tx-1", status, reference, amount_in_cents: 2000000, payment_method_type: "PSE" } }));

    vi.stubGlobal("fetch", vi.fn(async () => respuesta("APPROVED")));
    expect(await wompi.consultarPago({ codigo: "AM-1", pasarela_referencia: "tx-1" })).toEqual({
      estado: "APROBADO",
      transaccionId: "tx-1",
      metodo: "PSE",
    });

    vi.stubGlobal("fetch", vi.fn(async () => respuesta("DECLINED")));
    expect((await wompi.consultarPago({ codigo: "AM-1", pasarela_referencia: "tx-1" })).estado).toBe("RECHAZADO");

    // Una transacción de otra orden nunca confirma esta orden.
    vi.stubGlobal("fetch", vi.fn(async () => respuesta("APPROVED", "AM-OTRA")));
    expect((await wompi.consultarPago({ codigo: "AM-1", pasarela_referencia: "tx-1" })).estado).toBe("PENDIENTE");
  });
});

describe("Bold", () => {
  it("verifica x-bold-signature = hex(HMAC-SHA256(secreto, base64(cuerpo))); en pruebas el secreto es vacío", () => {
    vi.stubEnv("BOLD_ENTORNO", "pruebas");
    const cuerpo = JSON.stringify({ id: "evt-1", type: "SALE_APPROVED" });
    const firma = createHmac("sha256", "").update(Buffer.from(cuerpo).toString("base64")).digest("hex");
    expect(() => verificarFirmaBold(cuerpo, firma)).not.toThrow();
    expect(() => verificarFirmaBold(cuerpo, "00".repeat(32))).toThrow(/inválida/);
    expect(() => verificarFirmaBold(cuerpo, null)).toThrow(/sin firma/);
  });

  it("en producción usa la llave secreta", () => {
    vi.stubEnv("BOLD_ENTORNO", "produccion");
    vi.stubEnv("BOLD_SECRET_KEY", "secreta");
    const cuerpo = "{}";
    const firma = createHmac("sha256", "secreta").update(Buffer.from(cuerpo).toString("base64")).digest("hex");
    expect(() => verificarFirmaBold(cuerpo, firma)).not.toThrow();
  });

  it("consultarPago mapea los estados del link", async () => {
    vi.stubEnv("BOLD_API_KEY", "llave");
    const casos: [string, string][] = [
      ["PAID", "APROBADO"],
      ["REJECTED", "RECHAZADO"],
      ["EXPIRED", "EXPIRADO"],
      ["ACTIVE", "PENDIENTE"],
      ["PROCESSING", "PENDIENTE"],
    ];
    for (const [status, estado] of casos) {
      vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status, transaction_id: "t1", payment_method: "PSE" }))));
      expect((await bold.consultarPago({ codigo: "AM-1", pasarela_referencia: "LNK_1" })).estado).toBe(estado);
    }
  });

  it("crea el link en pesos (sin centavos) y omite callback_url si no es https", async () => {
    vi.stubEnv("BOLD_API_KEY", "llave");
    const espia = vi.fn(async () => new Response(JSON.stringify({ payload: { payment_link: "LNK_1", url: "https://checkout.bold.co/payment/LNK_1" }, errors: [] })));
    vi.stubGlobal("fetch", espia);
    const orden = { codigo: "AM-1", total_centavos: 4000000, correo_comprador: "a@b.co", evento: { titulo: "Concierto" } };
    const pago = await bold.crearPago({
      orden: orden as never,
      baseUrl: "http://localhost:3000",
      token: "t",
      urlRetorno: "http://localhost:3000/checkout/resultado",
      urlCancelar: "http://localhost:3000",
      minutos: 30,
    });
    expect(pago).toEqual({ url: "https://checkout.bold.co/payment/LNK_1", referencia: "LNK_1" });
    const cuerpo = JSON.parse((espia.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(cuerpo.amount.total_amount).toBe(40000);
    expect(cuerpo.reference).toBe("AM-1");
    expect(cuerpo.callback_url).toBeUndefined();
  });
});
