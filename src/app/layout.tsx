import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Franja } from "@/components/layout/franja";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { apiGet, headersConSesion } from "@/lib/api";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agenda Mayor — Vitrina de proyectos y eventos UNIMAYOR",
  description:
    "Plataforma de divulgación de la Institución Universitaria Colegio Mayor del Cauca: proyectos estudiantiles, eventos y perfiles.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const sesion = await apiGet<{ username: string }>("/api/perfil", {
    headers: await headersConSesion(),
  })
    .then((u) => ({ username: u.username }))
    .catch(() => null);

  return (
    <html lang="es" className={nunitoSans.variable}>
      <body className="flex min-h-screen flex-col">
        <Franja />
        <Navbar sesion={sesion} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
