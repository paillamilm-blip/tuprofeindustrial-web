/**
 * Logica pura del Diagnostico interactivo PAES / Ingenieria.
 *
 * Un test corto (5-6 preguntas) que, a partir de las respuestas del alumno,
 * recomienda uno de los servicios y arma un resumen y un mensaje de WhatsApp
 * precargado. Todo es puro y sin efectos secundarios (sin React ni DOM) para
 * poder testearlo de forma aislada; la UI (components/diagnostico.tsx) consume
 * estas funciones.
 *
 * Marca: el acompanamiento lo entrega un Ingeniero y Docente Innovador del
 * area Industrial, de ahi el tono de las recomendaciones.
 */

/** Identificador de cada servicio recomendable. */
export type PlanId =
  | "clases-personalizadas"
  | "intensivo-paes"
  | "nivelacion-ingenieria"
  | "asesoria";

/** Identificador de cada pregunta del diagnostico. */
export type QuestionId =
  | "nivel"
  | "objetivo"
  | "materia"
  | "plazo"
  | "modalidad";

/** Una opcion seleccionable dentro de una pregunta. */
export interface QuestionOption {
  /** Valor interno estable (no se traduce). */
  value: string;
  /** Texto visible para el alumno (espanol de Chile). */
  label: string;
}

/** Una pregunta del diagnostico con sus opciones. */
export interface Question {
  id: QuestionId;
  /** Enunciado visible. */
  prompt: string;
  /** Ayuda breve opcional. */
  helper?: string;
  options: QuestionOption[];
}

/**
 * Respuestas del alumno: mapa de id de pregunta -> value elegido.
 * Puede estar incompleto mientras avanza el wizard.
 */
export type DiagnosticoAnswers = Partial<Record<QuestionId, string>>;

/** Resultado del diagnostico: plan recomendado + textos listos para mostrar. */
export interface Recommendation {
  plan: PlanId;
  /** Titulo corto del plan recomendado (espanol). */
  title: string;
  /** Explicacion de por que se recomienda, en una o dos frases. */
  rationale: string;
  /** Resumen de las respuestas en una linea, util para la UI y el mensaje. */
  summary: string;
}

/**
 * Preguntas del diagnostico, en orden. Son 5 pasos: nivel actual, objetivo,
 * materia que mas cuesta, plazo y modalidad preferida.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: "nivel",
    prompt: "¿En que etapa estas hoy?",
    helper: "Elige la que mejor te describe ahora mismo.",
    options: [
      { value: "media", label: "Enseñanza media (1° a 4° medio)" },
      { value: "egresado-paes", label: "Egresado/a preparando la PAES" },
      { value: "universitario", label: "Estudiante universitario/a" },
      { value: "profesional", label: "Profesional, emprendedor/a o empresa" },
    ],
  },
  {
    id: "objetivo",
    prompt: "¿Cual es tu objetivo principal?",
    helper: "Lo que mas te importa lograr con el acompanamiento.",
    options: [
      { value: "subir-notas", label: "Subir mis notas del colegio" },
      { value: "puntaje-paes", label: "Subir mi puntaje en la PAES" },
      {
        value: "aprobar-ramos",
        label: "Aprobar ramos de la carrera (Cálculo, Física, etc.)",
      },
      {
        value: "proyecto",
        label: "Impulsar un proyecto, negocio o idea de innovación",
      },
    ],
  },
  {
    id: "materia",
    prompt: "¿Que area se te hace mas cuesta arriba?",
    helper: "Donde sientes que necesitas mas apoyo.",
    options: [
      { value: "matematica", label: "Matemáticas" },
      { value: "fisica", label: "Física" },
      { value: "ciencias", label: "Química u otras ciencias" },
      { value: "gestion", label: "Gestión, procesos o emprendimiento" },
    ],
  },
  {
    id: "plazo",
    prompt: "¿Con cuanto tiempo cuentas?",
    helper: "Nos ayuda a calibrar la intensidad del plan.",
    options: [
      { value: "urgente", label: "Menos de un mes (es urgente)" },
      { value: "semestre", label: "Un semestre aproximadamente" },
      { value: "flexible", label: "Sin apuro, quiero avanzar sostenido" },
    ],
  },
  {
    id: "modalidad",
    prompt: "¿Como prefieres trabajar?",
    helper: "Puedes cambiarlo mas adelante segun te acomode.",
    options: [
      { value: "online", label: "Clases online" },
      { value: "presencial", label: "Presencial" },
      { value: "mixta", label: "Mixta (online y presencial)" },
    ],
  },
] as const;

/** Numero total de pasos del diagnostico. */
export const TOTAL_STEPS = QUESTIONS.length;

/** Titulos cortos de cada plan, reutilizables por la UI. */
export const PLAN_TITLES: Record<PlanId, string> = {
  "clases-personalizadas": "Clases personalizadas",
  "intensivo-paes": "Intensivo PAES",
  "nivelacion-ingenieria": "Nivelación para Ingeniería",
  asesoria: "Asesoría e Innovación",
};

/** Devuelve la pregunta correspondiente a un indice de paso (0-based). */
export function questionAt(step: number): Question | undefined {
  return QUESTIONS[step];
}

/** Devuelve la etiqueta visible de una opcion elegida, o el value si no existe. */
function optionLabel(questionId: QuestionId, value: string | undefined): string {
  if (!value) return "sin responder";
  const question = QUESTIONS.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.value === value);
  return option?.label ?? value;
}

/** Indica si todas las preguntas tienen respuesta. */
export function isComplete(answers: DiagnosticoAnswers): boolean {
  return QUESTIONS.every((q) => Boolean(answers[q.id]));
}

/**
 * Construye un resumen en una linea de las respuestas, en espanol.
 * Solo incluye las preguntas efectivamente respondidas.
 */
export function summarizeAnswers(answers: DiagnosticoAnswers): string {
  const parts: string[] = [];
  for (const q of QUESTIONS) {
    const value = answers[q.id];
    if (value) {
      parts.push(optionLabel(q.id, value));
    }
  }
  return parts.join(" · ");
}

/**
 * Recomienda un plan a partir de las respuestas. Funcion pura y determinista.
 *
 * Reglas (en orden de prioridad):
 *  1. Proyecto / empresa / profesional  -> asesoria
 *  2. Universitario o aprobar ramos      -> nivelacion-ingenieria
 *  3. Objetivo PAES o egresado PAES       -> intensivo-paes
 *  4. Resto (escolar general)             -> clases-personalizadas (fallback)
 *
 * El fallback cubre tambien el caso de respuestas incompletas: siempre
 * devuelve un plan valido para que la UI nunca quede sin recomendacion.
 */
export function recommendPlan(answers: DiagnosticoAnswers): Recommendation {
  const { nivel, objetivo } = answers;

  let plan: PlanId;
  let rationale: string;

  if (objetivo === "proyecto" || nivel === "profesional") {
    plan = "asesoria";
    rationale =
      "Buscas impulsar un proyecto o negocio, asi que te conviene una " +
      "Asesoría con un Ingeniero Industrial que ordene procesos, numeros y " +
      "la hoja de ruta de tu idea.";
  } else if (nivel === "universitario" || objetivo === "aprobar-ramos") {
    plan = "nivelacion-ingenieria";
    rationale =
      "Estas en la universidad y necesitas aprobar ramos exigentes. La " +
      "Nivelación para Ingeniería ataca Cálculo, Física y los fundamentos " +
      "que mas se cobran.";
  } else if (objetivo === "puntaje-paes" || nivel === "egresado-paes") {
    plan = "intensivo-paes";
    rationale =
      "Tu meta es subir el puntaje PAES, por lo que el Intensivo PAES te da " +
      "practica dirigida, ensayos y metodo para rendir mejor el día de la prueba.";
  } else {
    plan = "clases-personalizadas";
    rationale =
      "Para avanzar en el colegio a tu ritmo, las Clases personalizadas se " +
      "ajustan a tus notas, tus tiempos y la materia que mas se te complica.";
  }

  return {
    plan,
    title: PLAN_TITLES[plan],
    rationale,
    summary: summarizeAnswers(answers),
  };
}

/**
 * Arma el mensaje de WhatsApp precargado con el resultado del diagnostico.
 * Incluye el plan recomendado y un resumen de las respuestas clave para que
 * la conversacion parta con contexto.
 */
export function buildDiagnosticoMessage(
  answers: DiagnosticoAnswers,
  recommendation: Recommendation
): string {
  const lines = [
    "Hola! Hice el diagnostico en la web de TuProfeIndustrial.",
    `Plan recomendado: ${recommendation.title}.`,
  ];

  const detalle = summarizeAnswers(answers);
  if (detalle) {
    lines.push(`Mi perfil: ${detalle}.`);
  }

  lines.push("Quiero mas informacion sobre este plan.");
  return lines.join(" ");
}
