import { GradeCalculator } from "@/components/grade-calculator";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const BENEFITS = [
  {
    title: "Clases que se entienden",
    text: "Explicaciones simples, al grano y con ejemplos reales. Sin relleno.",
  },
  {
    title: "Enfocado en tus pruebas",
    text: "Preparamos exactamente lo que te van a tomar para que subas tus notas.",
  },
  {
    title: "Horarios flexibles",
    text: "Clases online cuando te acomode. Coordinamos todo por WhatsApp.",
  },
  {
    title: "Primera consulta sin costo",
    text: "Cuentame tu caso por WhatsApp y vemos como te puedo ayudar.",
  },
];

const HERO_MESSAGE =
  "Hola! Vengo de la web de Tu Profe Industrial y quiero mejorar mis notas. Me puedes ayudar?";

const FINAL_MESSAGE =
  "Hola! Quiero empezar clases con Tu Profe Industrial. Que horarios tienes?";

export default function Home() {
  return (
    <>
      <main className="flex flex-col pb-24 md:pb-0">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sky-50 to-background">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-16 text-center sm:py-24">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700">
              Clases particulares online · Chile
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Sube tus notas sin estresarte
            </h1>
            <p className="max-w-xl text-base text-muted-foreground text-balance sm:text-lg">
              Calcula tu promedio y la nota que necesitas para aprobar en
              segundos. Y si te quedan dudas, un profe te ayuda al tiro por
              WhatsApp.
            </p>
            <WhatsAppCta
              message={HERO_MESSAGE}
              label="Quiero mejorar mis notas"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Respuesta rapida · Primera consulta sin costo
            </p>
          </div>
        </section>

        {/* Calculadora */}
        <section id="calculadora" className="px-5 py-12 sm:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Calculadora de notas chilena
              </h2>
              <p className="mt-2 text-muted-foreground text-balance">
                Escala de 1.0 a 7.0. Calcula tu promedio ponderado o descubre
                que nota necesitas para aprobar.
              </p>
            </div>
            <GradeCalculator />
          </div>
        </section>

        {/* Beneficios */}
        <section className="bg-muted/40 px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Por que estudiar conmigo
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li
                  key={b.title}
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs text-white"
                    >
                      ✓
                    </span>
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
            <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Listo para subir tus notas?
            </h2>
            <p className="max-w-lg text-muted-foreground text-balance">
              Escribeme por WhatsApp, cuentame en que ramo necesitas ayuda y
              armamos un plan juntos.
            </p>
            <WhatsAppCta
              message={FINAL_MESSAGE}
              label="Hablar con el profe ahora"
              className="text-lg"
            />
          </div>
        </section>

        <footer className="border-t px-5 py-8 text-center text-sm text-muted-foreground">
          <p>
            Tu Profe Industrial · Clases particulares online en Chile
          </p>
        </footer>
      </main>

      {/* CTA fijo en mobile para maximizar conversion */}
      <WhatsAppCta
        sticky
        message={HERO_MESSAGE}
        label="Hablar por WhatsApp"
      />
    </>
  );
}
