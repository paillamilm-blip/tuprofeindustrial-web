/**
 * Pruebas unitarias de la logica del Simulador de meta PAES.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importan las funciones REALES de ./paes.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LARGE_GAP_THRESHOLD,
  PAES_MAX,
  PAES_MIN,
  buildPaesMessage,
  isValidScore,
  simulatePaesGoal,
} from "./paes";

test("PAES_MIN y PAES_MAX definen la escala 100-1000", () => {
  assert.equal(PAES_MIN, 100);
  assert.equal(PAES_MAX, 1000);
});

test("isValidScore respeta los limites del rango", () => {
  assert.equal(isValidScore(PAES_MIN), true);
  assert.equal(isValidScore(PAES_MAX), true);
  assert.equal(isValidScore(PAES_MIN - 1), false);
  assert.equal(isValidScore(PAES_MAX + 1), false);
  assert.equal(isValidScore(Number.NaN), false);
});

test("simulatePaesGoal calcula el delta correctamente", () => {
  const r = simulatePaesGoal({ current: 500, goal: 650 });
  assert.equal(r.delta, 150);
  assert.equal(r.outOfRange, false);
  assert.equal(r.goalNotAbove, false);
});

test("simulatePaesGoal: brecha grande -> intensivo-paes", () => {
  const r = simulatePaesGoal({ current: 500, goal: 500 + LARGE_GAP_THRESHOLD });
  assert.equal(r.recommendation, "intensivo-paes");
  assert.equal(r.recommendationTitle, "Intensivo PAES");
});

test("simulatePaesGoal: brecha chica -> clases personalizadas", () => {
  const r = simulatePaesGoal({ current: 600, goal: 640 });
  assert.equal(r.recommendation, "clases-personalizadas");
  assert.ok(r.message.includes("40"));
});

test("simulatePaesGoal: meta igual o bajo el actual -> mantener", () => {
  const igual = simulatePaesGoal({ current: 700, goal: 700 });
  assert.equal(igual.goalNotAbove, true);
  assert.equal(igual.recommendation, "mantener");

  const menor = simulatePaesGoal({ current: 700, goal: 650 });
  assert.equal(menor.goalNotAbove, true);
  assert.equal(menor.recommendation, "mantener");
  assert.equal(menor.delta, -50);
});

test("simulatePaesGoal: fuera de rango -> outOfRange", () => {
  const bajo = simulatePaesGoal({ current: 50, goal: 600 });
  assert.equal(bajo.outOfRange, true);

  const alto = simulatePaesGoal({ current: 600, goal: 1200 });
  assert.equal(alto.outOfRange, true);
  assert.ok(alto.message.includes("100"));
  assert.ok(alto.message.includes("1000"));
});

test("buildPaesMessage incluye puntajes, delta y plan recomendado", () => {
  const r = simulatePaesGoal({ current: 500, goal: 650 });
  const msg = buildPaesMessage(r);
  assert.ok(msg.includes("Tu Profe Industrial"));
  assert.ok(msg.includes("500"));
  assert.ok(msg.includes("650"));
  assert.ok(msg.includes("150"));
  assert.ok(msg.includes("Intensivo PAES"));
});

test("buildPaesMessage para meta ya cumplida menciona mantener el nivel", () => {
  const r = simulatePaesGoal({ current: 800, goal: 750 });
  const msg = buildPaesMessage(r);
  assert.ok(msg.includes("mantener"));
});

test("buildPaesMessage fuera de rango pide ayuda sin inventar numeros", () => {
  const r = simulatePaesGoal({ current: 10, goal: 20 });
  const msg = buildPaesMessage(r);
  assert.ok(msg.includes("Tu Profe Industrial"));
});
