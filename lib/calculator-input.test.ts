/**
 * Pruebas unitarias del parseo de entrada de la calculadora.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importante: importan las funciones REALES de ./calculator-input SIN la
 * extension .ts (para no romper el type-check de Next), igual que grades.test.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  hasIncoherentWeightSum,
  normalizeNumericInput,
  parseRows,
  sumWeights,
} from "./calculator-input";

test("normalizeNumericInput recorta espacios y cambia coma por punto", () => {
  assert.equal(normalizeNumericInput("  5,5 "), "5.5");
  assert.equal(normalizeNumericInput("30"), "30");
  assert.equal(normalizeNumericInput(""), "");
});

test("parseRows ignora filas completamente vacias sin marcar parcial", () => {
  const { items, hasPartial } = parseRows([
    { grade: "", weight: "" },
    { grade: "5.5", weight: "40" },
  ]);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], { grade: 5.5, weight: 40 });
  assert.equal(hasPartial, false);
});

test("parseRows normaliza la coma decimal chilena", () => {
  const { items } = parseRows([{ grade: "6,3", weight: "25" }]);
  assert.deepEqual(items[0], { grade: 6.3, weight: 25 });
});

test("parseRows marca hasPartial cuando falta un campo de la fila", () => {
  // Nota sin ponderacion: fila a medias.
  const { items, hasPartial } = parseRows([
    { grade: "5.0", weight: "" },
    { grade: "4.0", weight: "50" },
  ]);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], { grade: 4.0, weight: 50 });
  assert.equal(hasPartial, true);
});

test("parseRows marca hasPartial cuando un valor no es numerico", () => {
  const { items, hasPartial } = parseRows([
    { grade: "abc", weight: "30" },
    { grade: "5.0", weight: "30" },
  ]);
  assert.equal(items.length, 1);
  assert.equal(hasPartial, true);
});

test("sumWeights suma las ponderaciones de las evaluaciones", () => {
  const total = sumWeights([
    { grade: 5.0, weight: 40 },
    { grade: 6.0, weight: 30 },
    { grade: 4.0, weight: 30 },
  ]);
  assert.equal(total, 100);
});

test("hasIncoherentWeightSum NO advierte cuando suma ~100%", () => {
  // 60% rendido + 40% restante = 100%.
  assert.equal(hasIncoherentWeightSum(60, 40), false);
});

test("hasIncoherentWeightSum NO advierte cuando suma ~1 (fracciones)", () => {
  // 0.6 rendido + 0.4 restante = 1.0.
  assert.equal(hasIncoherentWeightSum(0.6, 0.4), false);
});

test("hasIncoherentWeightSum advierte cuando el total supera el 100%", () => {
  // Caso del review: 40/30/30 = 100% ya rendido MAS 40% restante = 140%.
  assert.equal(hasIncoherentWeightSum(100, 40), true);
});

test("hasIncoherentWeightSum advierte cuando el total queda muy corto", () => {
  // 30% rendido + 20% restante = 50%: curso incompleto.
  assert.equal(hasIncoherentWeightSum(30, 20), true);
});

test("hasIncoherentWeightSum no advierte con entradas no positivas", () => {
  assert.equal(hasIncoherentWeightSum(0, 40), false);
  assert.equal(hasIncoherentWeightSum(60, 0), false);
  assert.equal(hasIncoherentWeightSum(Number.NaN, 40), false);
});
