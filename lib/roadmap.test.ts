/**
 * Pruebas unitarias de la logica de la Ruta de aprendizaje.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importan las funciones REALES de ./roadmap.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MILESTONES,
  buildRoute,
  getMilestone,
  milestoneIndex,
} from "./roadmap";

test("MILESTONES va de 1ro medio al último año de Ingeniería", () => {
  assert.equal(MILESTONES[0].id, "1-medio");
  assert.equal(MILESTONES[MILESTONES.length - 1].id, "ing-final");
  assert.ok(MILESTONES.length >= 6);
});

test("milestoneIndex y getMilestone resuelven ids conocidos", () => {
  assert.equal(milestoneIndex("paes") >= 0, true);
  assert.equal(getMilestone("paes")?.label, "Rendir la PAES");
  assert.equal(milestoneIndex("no-existe"), -1);
  assert.equal(getMilestone("no-existe"), undefined);
});

test("buildRoute devuelve el tramo inclusivo para start < goal", () => {
  const r = buildRoute("1-medio", "4-medio");
  assert.deepEqual(r.segment, ["1-medio", "2-medio", "3-medio", "4-medio"]);
  assert.equal(r.invalid, false);
  assert.equal(r.unknown, false);
});

test("buildRoute con start === goal devuelve un solo hito", () => {
  const r = buildRoute("paes", "paes");
  assert.deepEqual(r.segment, ["paes"]);
  assert.equal(r.invalid, false);
});

test("buildRoute marca invalid cuando la meta esta antes de la partida", () => {
  const r = buildRoute("ing-1", "1-medio");
  assert.equal(r.invalid, true);
  assert.deepEqual(r.segment, []);
});

test("buildRoute marca unknown cuando un id no existe", () => {
  const r1 = buildRoute("fantasma", "paes");
  assert.equal(r1.unknown, true);
  assert.deepEqual(r1.segment, []);

  const r2 = buildRoute("paes", "fantasma");
  assert.equal(r2.unknown, true);
});

test("buildRoute cubre todo el recorrido de media a Ingeniería", () => {
  const r = buildRoute("1-medio", "ing-final");
  assert.equal(r.segment.length, MILESTONES.length);
  assert.equal(r.segment[0], "1-medio");
  assert.equal(r.segment[r.segment.length - 1], "ing-final");
});
