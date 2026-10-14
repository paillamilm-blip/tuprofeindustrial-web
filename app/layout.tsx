import type { Metadata } from "next";
import { Sora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/*
 * TYPOGRAPHY — deliberate, non-Inter pairing (see rationale in app/globals.css):
 *  - Sora (display): geometric, slightly futuristic face for headings + wordmark.
 *    Signals "modern + innovative" without resorting to Inter/Geist defaults.
 *  - IBM Plex Sans (body): engineered, scientific-heritage sans; highly legible
 *    at 16px/1.5 and a natural companion to Sora for the engineering story.
 *  - IBM Plex Mono: numeric/calculator contexts, reinforcing the technical tone.
 * All three are loaded with display: "swap" to avoid blocking render.
 */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title:
    "Tu Profe Industrial | Clases de matemática, física e ingeniería en Chile",
  description:
    "Ingeniero Industrial, Docente e Innovador con IA. Clases online de matemática, física e ingeniería desde 1° medio hasta universidad: personalizadas, intensivo PAES y nivelación. Agenda por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
