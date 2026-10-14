/**
 * Logica pura de parseo de la entrada de la calculadora de notas.
 *
 * Se mantiene separada de la UI (components/grade-calculator.tsx) para poder
 * testearla de forma aislada, sin React ni DOM. La UI solo entrega strings
 * crudos (lo que el alumno escribio) y recibe de vuelta GradeItem[] validos
 * mas banderas que permiten avisar de entradas incompletas o incoherentes.
 */
import { MAX_GRADE, MIN_GRADE, type GradeItem } from "./grades";

/** Fila cruda tal como viene de los inputs (valores como string). */
export interface RawRow {
  grade: string;
  weight: string;
}

/** Resultado de parsear las filas de la calculadora. */
export interface ParsedRows {
  /** Evaluaciones completas y numericas listas para la logica de notas. */
  items: GradeItem[];
  /**
   * true si alguna fila quedo a medias: un campo lleno y el otro vacio, o un
   * valor que no es numerico. Permite avisar al alumno que ignoramos algo.
   */
  hasPartial: boolean;
}

/**
 * Normaliza un valor de input chileno a numero: recorta espacios y cambia la
 * coma decimal por punto. Devuelve el string vacio tal cual.
 */
export function normalizeNumericInput(value: string): string {
  return value.trim().replace(",", ".");
}

/**
 * Convierte las filas crudas en GradeItem[], ignorando filas completamente
 * vacias y marcando hasPartial cuando una fila quedo incompleta o no numerica.
 */
export function parseRows(rows: RawRow[]): ParsedRows {
  const items: GradeItem[] = [];
  let hasPartial = false;

  for (const row of rows) {
    const gradeRaw = normalizeNumericInput(row.grade);
    const weightRaw = normalizeNumericInput(row.weight);

    if (gradeRaw === "" && weightRaw === "") {
      continue;
    }
    if (gradeRaw === "" || weightRaw === "") {
      hasPartial = true;
      continue;
    }

    const grade = Number(gradeRaw);
    const weight = Number(weightRaw);
    if (Number.isNaN(grade) || Number.isNaN(weight)) {
      hasPartial = true;
      continue;
    }
    items.push({ grade, weight });
  }

  return { items, hasPartial };
}

/**
 * Suma las ponderaciones de una lista de evaluaciones.
 */
export function sumWeights(items: GradeItem[]): number {
  return items.reduce((acc, item) => acc + item.weight, 0);
}

/**
 * Revisa si las ponderaciones rendidas mas la restante forman un curso
 * coherente para el modo "que nota necesito".
 *
 * El calculo de la nota requerida asume que las evaluaciones rendidas mas la
 * restante cubren el 100% del ramo. Si el alumno expresa las ponderaciones en
 * porcentaje (lo normal), deberian sumar ~100; si las expresa como fraccion,
 * ~1. Cuando la suma no se acerca a ninguno de esos dos totales, lo mas
 * probable es que haya un error de ingreso (ej. 40/30/30 ya rendido = 100% MAS
 * un 40% restante = 140%), que produce una nota requerida silenciosamente
 * equivocada.
 *
 * Esta funcion NO lanza error: devuelve true solo cuando conviene mostrar una
 * advertencia no bloqueante. La toleracia es amplia a proposito para no
 * molestar en casos razonables.
 *
 * @param currentWeight suma de ponderaciones ya rendidas
 * @param remainingWeight ponderacion de la evaluacion restante
 */
export function hasIncoherentWeightSum(
  currentWeight: number,
  remainingWeight: number
): boolean {
  if (
    !Number.isFinite(currentWeight) ||
    !Number.isFinite(remainingWeight) ||
    currentWeight <= 0 ||
    remainingWeight <= 0
  ) {
    return false;
  }

  const total = currentWeight + remainingWeight;

  // Dos convenciones aceptadas: porcentaje (total ~100) o fraccion (total ~1).
  const closeToPercent = Math.abs(total - 100) <= 1; // tolerancia 1 punto
  const closeToFraction = Math.abs(total - 1) <= 0.01; // tolerancia 0.01

  return !closeToPercent && !closeToFraction;
}

export { MAX_GRADE, MIN_GRADE };
