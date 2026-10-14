import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { ClosingCta } from "@/components/sections/closing-cta";
import { SiteFooter } from "@/components/sections/site-footer";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const STICKY_MESSAGE =
  "Hola! Vengo de la web de Tu Profe Industrial y quiero más información sobre las clases.";

/**
 * Composition root de la landing. Cada sección vive en components/sections/
 * para mantener este archivo legible y el orden de la página explícito.
 *
 * Orden pensado para conversión: valor inmediato (hero + calculadora) →
 * oferta y confianza (servicios, quién soy, resultados) → objeciones (FAQ) →
 * cierre (CTA final + footer). El CTA sticky de WhatsApp acompaña en mobile.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex flex-col pb-24 md:pb-0">
        <Hero />
        <CalculatorSection />
        <Services />
        <About />
        <Testimonials />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />

      {/* CTA fijo en mobile para maximizar conversión (una sola vez). */}
      <WhatsAppCta sticky message={STICKY_MESSAGE} label="Hablar por WhatsApp" />
    </>
  );
}
