import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EstadoPago } from "@/components/eventos/estado-pago";
import { obtenerOrdenParaVer } from "@/modelo/taquilla/taquilla.service";
import { usuarioActual } from "@/lib/sesion-vista";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

/**
 * Pantalla de vuelta de la pasarela (Stripe, Wompi o Bold). El webhook o la
 * conciliación confirman el pago; esta vista se refresca sola hasta PAGADA.
 */
export default async function ResultadoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string; token?: string; id?: string }>;
}) {
  const { orden: codigo, token, id: transaccionId } = await searchParams;
  if (!codigo) notFound();

  const usuario = await usuarioActual();
  // Wompi agrega ?id=<transacción> al volver: sirve para conciliar al instante.
  const orden = await obtenerOrdenParaVer(codigo, token ?? null, usuario, transaccionId ?? null).catch(() => notFound());

  return (
    <div className="min-h-[60vh] bg-unimayor-tint px-4 py-12 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <EstadoPago
          codigo={orden.codigo}
          token={token ?? null}
          estadoInicial={orden.estado}
          eventoId={orden.evento_id}
          tituloEvento={orden.evento.titulo}
          totalCentavos={orden.total_centavos}
          correo={orden.correo_comprador}
        />
      </div>
    </div>
  );
}
