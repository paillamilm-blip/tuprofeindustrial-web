/**
 * Pruebas unitarias de la logica de la calculadora de notas.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importante: estas pruebas llaman a las funciones REALES de ./grades,
 * de modo que fallarian si la matematica se rompiera.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_GRADE,
  MIN_GRADE,
  PASSING_GRADE,
  passes,
  requiredGrade,
  weightedAverage,
} from "./grades";

test("weightedAverage calcula el promedio ponderado correctamente", () => {
  // (5.0*30 + 6.0*30 + 4.0*40) / 100 = (150 + 180 + 160) / 100 = 4.9
  const avg = weightedAverage([
    { grade: 5.0, weight: 30 },
    { grade: 6.0, weight: 30 },
    { grade: 4.0, weight: 40 },
  ]);
  assert.equal(avg, 4.9);
});

test("weightedAverage funciona con ponderaciones como fracciones", () => {
  // (7.0*0.5 + 1.0*0.5) = 4.0
  const avg = weightedAverage([
    { grade: 7.0, weight: 0.5 },
    { grade: 1.0, weight: 0.5 },
  ]);
  assert.equal(avg, 4.0);
});

test("weightedAverage lanza error si una nota esta fuera de rango", () => {
  assert.throws(() =>
    weightedAverage([{ grade: 8.0, weight: 50 }])
  );
  assert.throws(() =>
    weightedAverage([{ grade: 0.5, weight: 50 }])
  );
});

test("weightedAverage lanza error con lista vacia", () => {
  assert.throws(() => weightedAverage([]));
});

test("passes maneja el limite exacto de 4.0 (aprueba)", () => {
  assert.equal(passes(4.0), true);
  assert.equal(passes(4.0, PASSING_GRADE), true);
});

test("passes maneja el limite justo bajo 4.0 (reprueba)", () => {
  assert.equal(passes(3.9), false);
});

test("requiredGrade calcula la nota necesaria para aprobar", () => {
  // Rendido: 3.0 con 60%. Resta 40%. Objetivo 4.0.
  // required = (4.0*100 - 3.0*60) / 40 = (400 - 180) / 40 = 5.5
  const r = requiredGrade({
    currentItems: [{ grade: 3.0, weight: 60 }],
    remainingWeight: 40,
    target: 4.0,
  });
  assert.equal(r.required, 5.5);
  assert.equal(r.requiredClamped, 5.5);
  assert.equal(r.impossible, false);
  assert.equal(r.secured, false);
});

test("requiredGrade usa 4.0 como objetivo por defecto", () => {
  const r = requiredGrade({
    currentItems: [{ grade: 3.0, weight: 60 }],
    remainingWeight: 40,
  });
  assert.equal(r.required, 5.5);
});

test("requiredGrade marca el caso imposible (needed > 7.0)", () => {
  // Rendido: 2.0 con 70%. Resta 30%. Objetivo 5.0.
  // required = (5.0*100 - 2.0*70) / 30 = (500 - 140) / 30 = 12.0 -> imposible
  const r = requiredGrade({
    currentItems: [{ grade: 2.0, weight: 70 }],
    remainingWeight: 30,
    target: 5.0,
  });
  assert.equal(r.impossible, true);
  assert.ok(r.required > MAX_GRADE);
  assert.equal(r.requiredClamped, MAX_GRADE);
});

test("requiredGrade marca el caso ya asegurado (needed <= 1.0)", () => {
  // Rendido: 6.5 con 80%. Resta 20%. Objetivo 4.0.
  // required = (4.0*100 - 6.5*80) / 20 = (400 - 520) / 20 = -6.0 -> asegurado
  const r = requiredGrade({
    currentItems: [{ grade: 6.5, weight: 80 }],
    remainingWeight: 20,
    target: 4.0,
  });
  assert.equal(r.secured, true);
  assert.ok(r.required <= MIN_GRADE);
  assert.equal(r.requiredClamped, MIN_GRADE);
});

test("requiredGrade lanza error con entradas invalidas", () => {
  assert.throws(() =>
    requiredGrade({ currentItems: [], remainingWeight: 40 })
  );
  assert.throws(() =>
    requiredGrade({
      currentItems: [{ grade: 4.0, weight: 50 }],
      remainingWeight: 0,
    })
  );
  assert.throws(() =>
    requiredGrade({
      currentItems: [{ grade: 4.0, weight: 50 }],
      remainingWeight: 50,
      target: 9.0,
    })
  );
});
