import { describe, expect, it } from "vitest";
import { codigoPublico, hashToken, tokenSeguro } from "@/lib/codigos";
import { aCentavos } from "@/lib/utils";
import { EventoCreateSchema, EventoUpdateSchema } from "@/modelo/eventos/evento.dto";
import { obtenerTransicionEvento } from "@/modelo/eventos/evento.state";
import { CheckoutSchema } from "@/modelo/taquilla/taquilla.dto";
import { ordenParaCliente } from "@/lib/orden-cliente";
import type { OrdenDetalleRow } from "@/modelo/taquilla/taquilla.repository";

describe("códigos y montos de la taquilla", () => {
  it("genera códigos públicos con prefijo y 12 hex", () => {
    const codigo = codigoPublico("AME");
    expect(codigo).toMatch(/^AME-[0-9A-F]{12}$/);
    expect(codigoPublico("AM")).not.toBe(codigoPublico("AM"));
  });

  it("genera tokens secretos y guarda solo su hash", () => {
    const token = tokenSeguro();
    expect(token.length).toBeGreaterThanOrEqual(30);
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });

  it("convierte pesos colombianos a la unidad mínima de Stripe", () => {
    expect(aCentavos(0)).toBe(0);
    expect(aCentavos(50_000)).toBe(5_000_000);
    expect(aCentavos(12_345.4)).toBe(1_234_540);
  });
});

describe("DTO de eventos", () => {
  const base = {
    titulo: "Conversatorio",
    descripcion: "Una charla abierta sobre innovación.",
    tipo: "COMUNIDAD",
    fechaInicio: "2026-11-10T18:00:00-05:00",
    fechaFin: "2026-11-10T20:00:00-05:00",
    lugar: "Auditorio",
  };

  it("aplica los valores por defecto solo al crear", () => {
    const creado = EventoCreateSchema.parse(base);
    expect(creado.esVirtual).toBe(false);
    expect(creado.maxPorCompra).toBe(6);
    expect(creado.tiposEntrada).toEqual([]);
  });

  it("un PATCH de cancelación no cambia campos con defaults", () => {
    const cambios = EventoUpdateSchema.parse({ estado: "CANCELADO" });
    expect(cambios).toEqual({ estado: "CANCELADO" });
    expect("esVirtual" in cambios).toBe(false);
    expect("maxPorCompra" in cambios).toBe(false);
  });

  it("rechaza intentos de editar las entradas después de crear el evento", () => {
    const intento = EventoUpdateSchema.safeParse({
      tiposEntrada: [{ nombre: "VIP", precioCop: 10_000, cantidad: 5 }],
    });
    expect(intento.success).toBe(false);
  });
});

describe("máquina de estados de eventos", () => {
  it("permite al organizador cancelar un evento publicado", () => {
    expect(obtenerTransicionEvento("PUBLICADO", "CANCELADO", "ESTUDIANTE")).not.toBeNull();
  });

  it("no permite publicar un evento ya cancelado", () => {
    expect(obtenerTransicionEvento("CANCELADO", "PUBLICADO", "ADMIN")).toBeNull();
  });

  it("solo docentes y admin publican eventos en revisión", () => {
    expect(obtenerTransicionEvento("EN_REVISION", "PUBLICADO", "ESTUDIANTE")).toBeNull();
    expect(obtenerTransicionEvento("EN_REVISION", "PUBLICADO", "DOCENTE")).not.toBeNull();
  });
});

describe("DTO de checkout", () => {
  const base = {
    eventoId: 1,
    tipoEntradaId: 2,
    cantidad: 2,
    nombre: "Ana Pérez",
    correo: "ana@unimayor.edu.co",
    aceptaDatos: true,
  };

  it("acepta una compra válida y normaliza campos opcionales vacíos", () => {
    const datos = CheckoutSchema.parse({ ...base, documento: "", telefono: "" });
    expect(datos.documento).toBeUndefined();
    expect(datos.telefono).toBeUndefined();
  });

  it("exige aceptar el tratamiento de datos", () => {
    expect(CheckoutSchema.safeParse({ ...base, aceptaDatos: false }).success).toBe(false);
  });

  it("limita la cantidad por transacción", () => {
    expect(CheckoutSchema.safeParse({ ...base, cantidad: 21 }).success).toBe(false);
    expect(CheckoutSchema.safeParse({ ...base, cantidad: 20 }).success).toBe(true);
  });
});

describe("vista pública de una orden", () => {
  function orden(estado: string): OrdenDetalleRow {
    return {
      id_orden: 1,
      codigo: "AM-123",
      evento_id: 1,
      comprador_id: null,
      nombre_comprador: "Ana Pérez",
      correo_comprador: "ana@unimayor.edu.co",
      documento: null,
      telefono: null,
      total_centavos: 5_000_000,
      moneda: "COP",
      estado,
      stripe_session_id: "cs_test_123",
      stripe_payment_intent_id: "pi_test_123",
      metodo_pago: "card",
      expira_en: "2026-11-10T18:40:00.000Z",
      pagada_en: null,
      reembolsada_en: null,
      creada_en: "2026-11-10T18:00:00.000Z",
      actualizada_en: "2026-11-10T18:00:00.000Z",
      evento: {
        id_evento: 1,
        titulo: "Conversatorio",
        descripcion: "Charla",
        tipo: "COMUNIDAD",
        fecha_inicio: "2026-11-20T18:00:00.000Z",
        fecha_fin: "2026-11-20T20:00:00.000Z",
        lugar: "Auditorio",
        es_virtual: false,
        imagen: null,
        facultad: null,
        estado: "PUBLICADO",
        permite_entradas: true,
        url_acceso_privado: "https://unimayor.edu.co/acceso-privado",
        autor: { id_usuario: 1, username: "ana", nombre: "Ana", apellido: "Pérez" },
      },
      items: [],
      entradas: [],
    };
  }

  it("oculta los identificadores de Stripe y el enlace privado antes de pagar", () => {
    const vista = ordenParaCliente(orden("PENDIENTE"));
    expect("stripe_session_id" in vista).toBe(false);
    expect("stripe_payment_intent_id" in vista).toBe(false);
    expect(vista.evento.url_acceso_privado).toBeNull();
  });

  it("revela el enlace privado cuando la orden está pagada", () => {
    const vista = ordenParaCliente(orden("PAGADA"));
    expect(vista.evento.url_acceso_privado).toBe("https://unimayor.edu.co/acceso-privado");
  });
});
