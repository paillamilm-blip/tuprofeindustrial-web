import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { CalculatorSection } from "@/components/sections/calculator-section";
import { DiagnosticoSection } from "@/components/sections/diagnostico-section";
import { Services } from "@/components/sections/services";
import { PaesSection } from "@/components/sections/paes-section";
import { SimulacroSection } from "@/components/sections/simulacro-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { ClosingCta } from "@/components/sections/closing-cta";
import { SiteFooter } from "@/components/sections/site-footer";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const STICKY_MESSAGE =
  "Hola! Vengo de la web de TuProfeIndustrial y quiero más información sobre las clases.";

/**
 * Composition root de la landing. Cada sección vive en components/sections/
 * para mantener este archivo legible y el orden de la página explícito.
 *
 * Orden pensado como embudo de conversión (primero las herramientas gratis,
 * luego los servicios, luego confianza y cierre):
 *  1. Hero: propuesta de valor y gancho inicial.
 *  2. Diagnóstico interactivo: herramienta estrella que, tras 5 preguntas,
 *     perfila al alumno y lo rutea al plan adecuado. Abre el bloque de
 *     herramientas gratuitas.
 *  3. Calculadora de notas: utilidad gratis que engancha mostrando valor
 *     inmediato.
 *  4. Simulador de meta PAES: refuerza deseo ("cuánto me falta").
 *  5. Simulacro M1 gratis: el imán que captura nombre y correo (Ley 21.719).
 *  6. Ruta de aprendizaje: cierra las herramientas gratis mostrando el camino.
 *  7. Servicios: la oferta de clases, ya calentada por las herramientas.
 *  8. Confianza y objeciones: Quién soy, Testimonios, Preguntas frecuentes.
 *  9. Cierre: CTA final + footer. El CTA sticky de WhatsApp acompaña en mobile.
 *
 *  La faceta de asesorías (proyectos digitales y PYME) está oculta a pedido
 *  del autor: components/sections/advisory.tsx sigue en el repo y se
 *  restablece volviendo a importar y montar <Advisory /> aquí.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex flex-col pb-24 md:pb-0">
        <Hero />
        <DiagnosticoSection />
        <CalculatorSection />
        <PaesSection />
        <SimulacroSection />
        <RoadmapSection />
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
