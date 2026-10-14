import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { DiagnosticoSection } from "@/components/sections/diagnostico-section";
import { Services } from "@/components/sections/services";
import { PaesSection } from "@/components/sections/paes-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { Advisory } from "@/components/sections/advisory";
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
 * Orden pensado para conversión:
 *  1. Valor inmediato: Hero + Calculadora enganchan con una utilidad gratis.
 *  2. Diagnóstico interactivo: herramienta estrella que, tras 5 preguntas,
 *     recomienda el servicio correcto y lo deja listo para WhatsApp. Va justo
 *     antes de Servicios para "rutear" al alumno al plan adecuado.
 *  3. Servicios: la oferta de clases ya segmentada por el diagnóstico.
 *  4. Simulador de meta PAES y Ruta de aprendizaje: herramientas de apoyo que
 *     refuerzan deseo ("cuánto me falta", "cuál es mi camino") tras ver la
 *     oferta.
 *  5. Asesorías e Innovación: la faceta Innovador (proyectos digitales y PYME),
 *     separada de las clases para no confundir públicos.
 *  6. Confianza y objeciones: Quién soy, Resultados, FAQ.
 *  7. Cierre: CTA final + footer. El CTA sticky de WhatsApp acompaña en mobile.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex flex-col pb-24 md:pb-0">
        <Hero />
        <CalculatorSection />
        <DiagnosticoSection />
        <Services />
        <PaesSection />
        <RoadmapSection />
        <Advisory />
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
