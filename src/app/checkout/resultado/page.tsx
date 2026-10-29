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
 * Pantalla de vuelta de Stripe. El webhook es la fuente de verdad; esta vista
 * consulta el estado y se refresca sola hasta que la orden queda PAGADA.
 */
export default async function ResultadoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string; token?: string }>;
}) {
  const { orden: codigo, token } = await searchParams;
  if (!codigo) notFound();

  const usuario = await usuarioActual();
  const orden = await obtenerOrdenParaVer(codigo, token ?? null, usuario).catch(() => notFound());

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
