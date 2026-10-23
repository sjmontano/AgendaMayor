import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Franja } from "@/components/layout/franja";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { usuarioActual } from "@/lib/sesion-vista";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Agenda Mayor — Vitrina de proyectos y eventos UNIMAYOR",
    template: "%s · Agenda Mayor UNIMAYOR",
  },
  description:
    "Plataforma de divulgación de la Institución Universitaria Colegio Mayor del Cauca: proyectos estudiantiles, eventos y perfiles.",
};

export const viewport: Viewport = {
  themeColor: "#004884",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();
  const sesion = usuario
    ? {
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_rol: usuario.nombre_rol,
      }
    : null;

  return (
    <html lang="es" className={nunitoSans.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only z-[200] rounded-box bg-gold px-4 py-2 font-bold text-unimayor-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Saltar al contenido
        </a>
        <Providers>
          <Franja />
          <Navbar sesion={sesion} />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
