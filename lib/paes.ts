/**
 * Logica pura del Simulador de meta PAES.
 *
 * Compara el puntaje actual del alumno con su puntaje objetivo, calcula cuanto
 * debe subir y recomienda el plan mas conveniente. Tambien arma el mensaje de
 * WhatsApp precargado con el resultado.
 *
 * Funciones puras, sin React ni DOM, para poder testearlas de forma aislada.
 */

/**
 * Rango configurable de la escala PAES.
 *
 * SUPUESTO: se asume la escala vigente de la Prueba de Acceso a la Educacion
 * Superior (PAES) en Chile, que va de 100 a 1000 puntos. Si el organismo
 * cambiara el rango en el futuro, basta con ajustar estas dos constantes: toda
 * la validacion y las recomendaciones dependen de ellas.
 */
export const PAES_MIN = 100;
/** Puntaje maximo asumido de la escala PAES (ver supuesto en PAES_MIN). */
export const PAES_MAX = 1000;

/**
 * Umbral (en puntos) a partir del cual la brecha se considera grande y conviene
 * un Intensivo PAES en lugar de refuerzo puntual.
 */
export const LARGE_GAP_THRESHOLD = 80;

/** Identificador del plan recomendado por el simulador. */
export type PaesRecommendationId =
  | "intensivo-paes"
  | "clases-personalizadas"
  | "mantener";

/** Entrada del simulador: puntaje actual y objetivo. */
export interface PaesInput {
  current: number;
  goal: number;
}

/** Resultado del simulador de meta PAES. */
export interface PaesResult {
  current: number;
  goal: number;
  /** Diferencia goal - current (puede ser 0 o negativa). */
  delta: number;
  /** Plan recomendado segun la brecha. */
  recommendation: PaesRecommendationId;
  /** Titulo visible del plan recomendado. */
  recommendationTitle: string;
  /** Explicacion breve de la recomendacion, en espanol. */
  message: string;
  /** true si current o goal estan fuera del rango [PAES_MIN, PAES_MAX]. */
  outOfRange: boolean;
  /** true si la meta es menor o igual al puntaje actual. */
  goalNotAbove: boolean;
}

/** Titulos visibles de cada recomendacion. */
export const PAES_RECOMMENDATION_TITLES: Record<PaesRecommendationId, string> = {
  "intensivo-paes": "Intensivo PAES",
  "clases-personalizadas": "Clases personalizadas de refuerzo",
  mantener: "Mantener y afinar",
};

/** Indica si un puntaje es un numero finito dentro del rango valido. */
export function isValidScore(score: number): boolean {
  return Number.isFinite(score) && score >= PAES_MIN && score <= PAES_MAX;
}

/**
 * Simula la meta PAES. Funcion pura y determinista.
 *
 * Reglas:
 *  - Si algun puntaje esta fuera de [PAES_MIN, PAES_MAX] -> outOfRange=true y
 *    se recomienda refuerzo con un mensaje que pide corregir el rango.
 *  - Si goal <= current -> goalNotAbove=true: ya cumple la meta, se felicita y
 *    se recomienda mantener.
 *  - Si la brecha (delta) es grande (>= LARGE_GAP_THRESHOLD) -> Intensivo PAES.
 *  - Si la brecha es chica -> clases personalizadas de refuerzo.
 */
export function simulatePaesGoal(input: PaesInput): PaesResult {
  const current = Number(input.current);
  const goal = Number(input.goal);

  const outOfRange = !isValidScore(current) || !isValidScore(goal);
  const delta = Math.round(goal - current);
  const goalNotAbove = goal <= current;

  let recommendation: PaesRecommendationId;
  let message: string;

  if (outOfRange) {
    recommendation = "clases-personalizadas";
    message =
      `Los puntajes deben estar entre ${PAES_MIN} y ${PAES_MAX}. ` +
      "Corrige los valores para calcular tu meta.";
  } else if (goalNotAbove) {
    recommendation = "mantener";
    message =
      "Felicitaciones: ya estas en tu meta o por sobre ella. Lo importante " +
      "ahora es mantener el nivel y afinar los detalles para no retroceder.";
  } else if (delta >= LARGE_GAP_THRESHOLD) {
    recommendation = "intensivo-paes";
    message =
      `Necesitas subir ${delta} puntos, una brecha exigente. El Intensivo ` +
      "PAES te da un plan dirigido, ensayos y metodo para cerrarla a tiempo.";
  } else {
    recommendation = "clases-personalizadas";
    message =
      `Te faltan ${delta} puntos, una brecha alcanzable. Con clases ` +
      "personalizadas de refuerzo apuntamos justo a los contenidos que te " +
      "estan restando puntaje.";
  }

  return {
    current,
    goal,
    delta,
    recommendation,
    recommendationTitle: PAES_RECOMMENDATION_TITLES[recommendation],
    message,
    outOfRange,
    goalNotAbove,
  };
}

/**
 * Arma el mensaje de WhatsApp precargado con el resultado del simulador PAES.
 * Incluye puntaje actual, meta, brecha y el plan recomendado.
 */
export function buildPaesMessage(result: PaesResult): string {
  if (result.outOfRange) {
    return (
      "Hola! Quiero simular mi meta PAES en la web de TuProfeIndustrial y " +
      "necesito ayuda para definir mis puntajes."
    );
  }

  const lines = [
    "Hola! Simule mi meta PAES en la web de TuProfeIndustrial.",
    `Puntaje actual: ${result.current}. Meta: ${result.goal}.`,
  ];

  if (result.goalNotAbove) {
    lines.push(
      "Ya estoy en mi meta y quiero mantener el nivel con tu acompanamiento."
    );
  } else {
    lines.push(
      `Debo subir ${result.delta} puntos. Plan recomendado: ${result.recommendationTitle}.`
    );
    lines.push("Quiero mas informacion para empezar.");
  }

  return lines.join(" ");
}
