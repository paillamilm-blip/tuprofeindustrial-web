/**
 * Logica de la calculadora de notas para la escala chilena (1.0 a 7.0).
 *
 * Funciones puras, sin dependencias de React ni del DOM, para poder testearlas
 * de forma aislada. Toda la UI (components/grade-calculator.tsx) consume estas
 * funciones; la fuente de verdad de la matematica vive aqui.
 */

/** Nota minima de la escala chilena. */
export const MIN_GRADE = 1.0;
/** Nota maxima de la escala chilena. */
export const MAX_GRADE = 7.0;
/** Nota minima de aprobacion por defecto. */
export const PASSING_GRADE = 4.0;

/** Una evaluacion con su nota y su ponderacion (peso). */
export interface GradeItem {
  /** Nota en la escala 1.0 - 7.0. */
  grade: number;
  /**
   * Ponderacion de la evaluacion. Puede expresarse como porcentaje (ej. 30)
   * o como fraccion (ej. 0.3); solo se usa de forma relativa, por lo que no
   * es necesario que la suma sea exactamente 100 o 1.
   */
  weight: number;
}

/** Redondea a 2 decimales de forma estable. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Limita un valor al rango de la escala [1.0, 7.0]. */
export function clampGrade(value: number): number {
  return Math.min(MAX_GRADE, Math.max(MIN_GRADE, value));
}

/** Indica si una nota esta dentro del rango valido de la escala chilena. */
export function isValidGrade(grade: number): boolean {
  return Number.isFinite(grade) && grade >= MIN_GRADE && grade <= MAX_GRADE;
}

/** Indica si una ponderacion es valida (numero finito y positivo). */
export function isValidWeight(weight: number): boolean {
  return Number.isFinite(weight) && weight > 0;
}

/**
 * Calcula el promedio ponderado de una lista de evaluaciones.
 *
 * @throws Error si la lista esta vacia, si alguna nota esta fuera de rango,
 * si alguna ponderacion no es positiva o si la suma de ponderaciones es 0.
 */
export function weightedAverage(items: GradeItem[]): number {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Debes ingresar al menos una nota con su ponderacion.");
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of items) {
    if (!isValidGrade(item.grade)) {
      throw new Error(
        `La nota ${item.grade} esta fuera de la escala 1.0 - 7.0.`
      );
    }
    if (!isValidWeight(item.weight)) {
      throw new Error("Las ponderaciones deben ser numeros mayores que 0.");
    }
    totalWeight += item.weight;
    weightedSum += item.grade * item.weight;
  }

  if (totalWeight <= 0) {
    throw new Error("La suma de las ponderaciones debe ser mayor que 0.");
  }

  return round2(weightedSum / totalWeight);
}

/** Indica si una nota (o promedio) aprueba segun la nota minima dada. */
export function passes(
  grade: number,
  passingGrade: number = PASSING_GRADE
): boolean {
  return grade >= passingGrade;
}

/** Resultado del calculo de "que nota necesito". */
export interface RequiredGradeResult {
  /**
   * Nota requerida real (sin limitar) en la evaluacion restante para alcanzar
   * la meta. Puede ser mayor a 7.0 (imposible) o menor/igual a 1.0 (ya
   * asegurada). Redondeada a 2 decimales.
   */
  required: number;
  /** Nota requerida limitada al rango [1.0, 7.0], util para mostrar. */
  requiredClamped: number;
  /** true si la meta no se puede alcanzar (required > 7.0). */
  impossible: boolean;
  /** true si la meta ya esta asegurada aun sacando la nota minima (required <= 1.0). */
  secured: boolean;
}

/** Parametros para calcular la nota requerida en una evaluacion restante. */
export interface RequiredGradeInput {
  /** Evaluaciones ya rendidas, con sus notas y ponderaciones. */
  currentItems: GradeItem[];
  /**
   * Ponderacion de la evaluacion restante, en la MISMA unidad que las
   * ponderaciones de currentItems (porcentaje o fraccion).
   */
  remainingWeight: number;
  /** Nota final objetivo. Por defecto 4.0 (aprobacion). */
  target?: number;
}

/**
 * Calcula la nota que se necesita en la evaluacion restante para alcanzar la
 * nota final objetivo, dadas las evaluaciones ya rendidas.
 *
 * La formula considera que el promedio final es la suma ponderada de todas las
 * evaluaciones (rendidas + restante) dividida por la suma total de
 * ponderaciones:
 *
 *   objetivo = (sumaPonderadaActual + notaRequerida * pesoRestante) / pesoTotal
 *
 * Despejando notaRequerida.
 *
 * @throws Error si currentItems esta vacio, si hay notas/ponderaciones
 * invalidas, si remainingWeight no es positivo o si el objetivo esta fuera de
 * la escala.
 */
export function requiredGrade(input: RequiredGradeInput): RequiredGradeResult {
  const { currentItems, remainingWeight, target = PASSING_GRADE } = input;

  if (!Array.isArray(currentItems) || currentItems.length === 0) {
    throw new Error("Debes ingresar al menos una nota ya rendida.");
  }
  if (!isValidWeight(remainingWeight)) {
    throw new Error("La ponderacion restante debe ser un numero mayor que 0.");
  }
  if (!isValidGrade(target)) {
    throw new Error("La nota objetivo debe estar entre 1.0 y 7.0.");
  }

  let currentWeight = 0;
  let currentWeightedSum = 0;

  for (const item of currentItems) {
    if (!isValidGrade(item.grade)) {
      throw new Error(
        `La nota ${item.grade} esta fuera de la escala 1.0 - 7.0.`
      );
    }
    if (!isValidWeight(item.weight)) {
      throw new Error("Las ponderaciones deben ser numeros mayores que 0.");
    }
    currentWeight += item.weight;
    currentWeightedSum += item.grade * item.weight;
  }

  const totalWeight = currentWeight + remainingWeight;
  const required = (target * totalWeight - currentWeightedSum) / remainingWeight;
  const rounded = round2(required);

  return {
    required: rounded,
    requiredClamped: round2(clampGrade(rounded)),
    impossible: rounded > MAX_GRADE,
    secured: rounded <= MIN_GRADE,
  };
}
