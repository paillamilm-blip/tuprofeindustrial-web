/**
 * Pruebas unitarias de la logica del Diagnostico interactivo.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importante: llaman a las funciones REALES de ./diagnostico.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PLAN_TITLES,
  QUESTIONS,
  TOTAL_STEPS,
  buildDiagnosticoMessage,
  isComplete,
  recommendPlan,
  summarizeAnswers,
  type DiagnosticoAnswers,
} from "./diagnostico";

test("QUESTIONS define 5 pasos con opciones no vacias", () => {
  assert.equal(TOTAL_STEPS, 5);
  assert.equal(QUESTIONS.length, 5);
  for (const q of QUESTIONS) {
    assert.ok(q.options.length >= 2, `la pregunta ${q.id} debe tener opciones`);
  }
});

test("recommendPlan: objetivo PAES -> intensivo-paes", () => {
  const r = recommendPlan({ nivel: "egresado-paes", objetivo: "puntaje-paes" });
  assert.equal(r.plan, "intensivo-paes");
  assert.equal(r.title, "Intensivo PAES");
});

test("recommendPlan: universitario / aprobar ramos -> nivelacion-ingenieria", () => {
  const r1 = recommendPlan({ nivel: "universitario", objetivo: "aprobar-ramos" });
  assert.equal(r1.plan, "nivelacion-ingenieria");

  const r2 = recommendPlan({ nivel: "media", objetivo: "aprobar-ramos" });
  assert.equal(r2.plan, "nivelacion-ingenieria");
});

test("recommendPlan: adulto que retoma o recupera bases -> clases personalizadas", () => {
  const r1 = recommendPlan({ nivel: "profesional", objetivo: "bases" });
  assert.equal(r1.plan, "clases-personalizadas");

  const r2 = recommendPlan({ nivel: "media", objetivo: "bases" });
  assert.equal(r2.plan, "clases-personalizadas");
});

test("recommendPlan: escolar general -> clases-personalizadas (fallback)", () => {
  const r = recommendPlan({ nivel: "media", objetivo: "subir-notas" });
  assert.equal(r.plan, "clases-personalizadas");
});

test("recommendPlan: respuestas vacias caen al fallback valido", () => {
  const r = recommendPlan({});
  assert.equal(r.plan, "clases-personalizadas");
  assert.ok(r.rationale.length > 0);
});

test("recommendPlan: universidad gana a recuperar bases, nada de asesoria", () => {
  // nivel universitario pero objetivo de bases -> sigue la nivelacion
  const r = recommendPlan({ nivel: "universitario", objetivo: "bases" });
  assert.equal(r.plan, "nivelacion-ingenieria");

  // el plan de asesoria ya no existe: la landing vende solo clases
  assert.deepEqual(Object.keys(PLAN_TITLES).sort(), [
    "clases-personalizadas",
    "intensivo-paes",
    "nivelacion-ingenieria",
  ]);
  assert.equal(
    QUESTIONS.some((q) => q.options.some((o) => o.value === "proyecto")),
    false
  );
});

test("isComplete detecta respuestas completas e incompletas", () => {
  const incompleta: DiagnosticoAnswers = { nivel: "media" };
  assert.equal(isComplete(incompleta), false);

  const completa: DiagnosticoAnswers = {
    nivel: "media",
    objetivo: "subir-notas",
    materia: "matematica",
    plazo: "semestre",
    modalidad: "online",
  };
  assert.equal(isComplete(completa), true);
});

test("summarizeAnswers usa las etiquetas visibles de las opciones", () => {
  const resumen = summarizeAnswers({ nivel: "media", objetivo: "puntaje-paes" });
  assert.ok(resumen.includes("Enseñanza media"));
  assert.ok(resumen.includes("puntaje"));
});

test("buildDiagnosticoMessage incluye el plan recomendado y el perfil", () => {
  const answers: DiagnosticoAnswers = {
    nivel: "egresado-paes",
    objetivo: "puntaje-paes",
    materia: "matematica",
    plazo: "urgente",
    modalidad: "online",
  };
  const recommendation = recommendPlan(answers);
  const msg = buildDiagnosticoMessage(answers, recommendation);

  assert.ok(msg.includes("TuProfeIndustrial"));
  assert.ok(msg.includes("Intensivo PAES"));
  assert.ok(msg.includes("Matemáticas"));
});
