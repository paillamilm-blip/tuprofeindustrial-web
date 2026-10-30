/**
 * Logica pura de la Ruta de aprendizaje visual.
 *
 * Define los hitos ordenados desde "1ro medio" hasta el "último año de
 * Ingeniería" y una funcion que, dados un punto de partida y una meta, calcula
 * el tramo a resaltar. Refuerza la idea de marca "Aprender es para todos":
 * siempre hay una ruta desde donde estas hasta donde quieres llegar.
 *
 * Funciones puras, sin React ni DOM, para poder testearlas de forma aislada.
 */

/** Un hito de la ruta de aprendizaje. */
export interface Milestone {
  /** Identificador interno estable. */
  id: string;
  /** Etiqueta visible (espanol de Chile). */
  label: string;
  /** Descripcion breve de la etapa. */
  description: string;
}

/**
 * Hitos ordenados de la ruta. El orden del arreglo define la progresion: cada
 * elemento viene despues del anterior. Van desde 1ro medio hasta el último año
 * de Ingeniería.
 */
export const MILESTONES: readonly Milestone[] = [
  {
    id: "1-medio",
    label: "1ro medio",
    description: "Bases de Matemáticas y ciencias para partir con confianza.",
  },
  {
    id: "2-medio",
    label: "2do medio",
    description: "Álgebra, geometría y hábito de estudio.",
  },
  {
    id: "3-medio",
    label: "3ro medio",
    description: "Profundización y primeros ensayos tipo PAES.",
  },
  {
    id: "4-medio",
    label: "4to medio",
    description: "Preparación PAES y decisión de carrera.",
  },
  {
    id: "paes",
    label: "Rendir la PAES",
    description: "Intensivo final, ensayos y estrategia para el día de la prueba.",
  },
  {
    id: "ing-1",
    label: "1er año de Ingeniería",
    description: "Nivelación en Cálculo, Álgebra y Física universitaria.",
  },
  {
    id: "ing-2",
    label: "2do año de Ingeniería",
    description: "Ecuaciones, mecánica y ramos de especialidad.",
  },
  {
    id: "ing-final",
    label: "Último año de Ingeniería",
    description: "Título, proyectos aplicados y salto al mundo profesional.",
  },
] as const;

/** Resultado de calcular una ruta entre dos hitos. */
export interface RouteResult {
  /** Ids de los hitos dentro del tramo (inclusivo), en orden. */
  segment: string[];
  /** true si start o goal no existen en MILESTONES. */
  unknown: boolean;
  /** true si la meta esta antes del punto de partida. */
  invalid: boolean;
}

/** Devuelve el indice de un hito por id, o -1 si no existe. */
export function milestoneIndex(id: string): number {
  return MILESTONES.findIndex((m) => m.id === id);
}

/** Devuelve el hito por id, o undefined si no existe. */
export function getMilestone(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Calcula el tramo (inclusivo) entre el hito de partida y la meta.
 *
 * - Si algun id no existe, devuelve unknown=true y segment vacio.
 * - Si la meta esta antes de la partida, devuelve invalid=true y segment vacio.
 * - Si start === goal, el tramo contiene solo ese hito.
 * - En el caso valido, devuelve todos los ids desde start hasta goal.
 */
export function buildRoute(startId: string, goalId: string): RouteResult {
  const startIdx = milestoneIndex(startId);
  const goalIdx = milestoneIndex(goalId);

  if (startIdx === -1 || goalIdx === -1) {
    return { segment: [], unknown: true, invalid: false };
  }

  if (goalIdx < startIdx) {
    return { segment: [], unknown: false, invalid: true };
  }

  const segment = MILESTONES.slice(startIdx, goalIdx + 1).map((m) => m.id);
  return { segment, unknown: false, invalid: false };
}
