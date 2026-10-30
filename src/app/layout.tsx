import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { usuarioActualOpcional } from "@/lib/auth";
import { contarNoLeidas } from "@/modelo/notificaciones/notificacion.repository";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActualOpcional();
  const noLeidas = usuario ? await contarNoLeidas(usuario.id_usuario) : 0;

  return (
    <html lang="es" className={nunitoSans.variable}>
      <body>
        <div className="franja-gov">
          <div className="contenedor">
            <strong>GOV.CO</strong> · Institución Universitaria Colegio Mayor del Cauca
          </div>
        </div>
        <Navbar
          usuario={usuario ? { username: usuario.username, rol: usuario.nombre_rol } : null}
          noLeidas={noLeidas}
        />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
