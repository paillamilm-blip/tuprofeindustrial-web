import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/sections/reveal";

/**
 * FAQ — acordeón accesible (primitivo shadcn sobre @radix-ui/react-accordion).
 * Radix maneja el aria (aria-expanded, aria-controls, roles) y la operación por
 * teclado. Respuestas en español profesional, honestas con el estado actual
 * (precios a consultar, agenda por WhatsApp).
 */
const FAQS = [
  {
    q: "¿Las clases son a domicilio o online?",
    a: "Ambas cosas. Doy clases a domicilio en Santiago y alrededores, y online desde cualquier parte de Chile con buena conexión. En las online usamos videollamada y pizarra digital para que todo quede claro y, si quieres, con material de apoyo que puedes repasar después.",
  },
  {
    q: "¿Cuánto cuestan las clases?",
    a: "El valor se coordina según el servicio (clase personalizada, intensivo PAES o nivelación de ingeniería), el nivel y la frecuencia que necesites. Escríbeme por WhatsApp, cuéntame tu caso y te paso los valores al tiro, sin compromiso.",
  },
  {
    q: "¿Qué horarios tienes disponibles?",
    a: "Trabajo con horarios flexibles, incluyendo tardes y fines de semana según disponibilidad. Coordinamos el día y la hora por WhatsApp para que calcen con tu rutina de estudio.",
  },
  {
    q: "¿Cómo agendo mi primera clase?",
    a: "Es simple: me escribes por WhatsApp, me cuentas qué materia y nivel necesitas, y definimos un plan. La primera coordinación es sin costo para asegurarnos de que te puedo ayudar de verdad.",
  },
  {
    q: "¿Qué materias y niveles cubres?",
    a: "Enseño Matemáticas, Física e ingeniería, desde 1° medio hasta el último año de ingeniería universitaria. Esto incluye escolares, preparación preuniversitaria (PAES) y nivelación de ramos universitarios.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Resuelve tus dudas antes de empezar
          </h2>
        </Reveal>

        <Reveal delayMs={80} className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-pretty">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
