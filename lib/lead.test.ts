/**
 * Pruebas unitarias de la logica del formulario de captura del Simulacro M1.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importan las funciones REALES de ./lead.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  NAME_MIN_LENGTH,
  SIMULACRO_PDF_PATH,
  buildLeadWhatsAppMessage,
  buildMailerLitePayload,
  hasLeadErrors,
  isMailerLiteConfigured,
  leadFailureMessage,
  looksLikeBot,
  normalizeEmail,
  validateLeadInput,
} from "./lead";

const VALID = {
  name: "Ana Torres",
  email: "ana.torres@gmail.com",
  consent: true,
};

test("SIMULACRO_PDF_PATH apunta al PDF servido desde public/", () => {
  assert.equal(SIMULACRO_PDF_PATH, "/simulacro-paes-m1.pdf");
});

test("normalizeEmail recorta espacios y pasa a minusculas", () => {
  assert.equal(normalizeEmail("  Ana.Torres@GMAIL.com "), "ana.torres@gmail.com");
});

test("validateLeadInput acepta una entrada completa", () => {
  const errors = validateLeadInput(VALID);
  assert.equal(hasLeadErrors(errors), false);
});

test("validateLeadInput exige nombre con un minimo de largo", () => {
  assert.ok(validateLeadInput({ ...VALID, name: "" }).name);
  assert.ok(validateLeadInput({ ...VALID, name: " A " }).name);
  assert.equal(validateLeadInput({ ...VALID, name: "A".repeat(NAME_MIN_LENGTH) }).name, undefined);
});

test("validateLeadInput rechaza correos mal formados", () => {
  for (const email of ["", "  ", "ana", "ana@", "ana@gmail", "@gmail.com", "ana@gmail.", "ana gmail.com"]) {
    assert.ok(validateLeadInput({ ...VALID, email }).email, `deberia rechazar: "${email}"`);
  }
});

test("validateLeadInput acepta correos con subdominio y puntos", () => {
  for (const email of ["ana@gmail.com", "ana@colegio.cl", "ana.torres@usm.cl", "a+b@sub.dominio.co"]) {
    assert.equal(validateLeadInput({ ...VALID, email }).email, undefined, `deberia aceptar: "${email}"`);
  }
});

test("validateLeadInput sin consentimiento bloquea el alta (Ley 21.719)", () => {
  const errors = validateLeadInput({ ...VALID, consent: false });
  assert.ok(errors.consent);
  assert.equal(hasLeadErrors(errors), true);
});

test("looksLikeBot detecta el honeypot lleno", () => {
  assert.equal(looksLikeBot(VALID), false);
  assert.equal(looksLikeBot({ ...VALID, website: "" }), false);
  assert.equal(looksLikeBot({ ...VALID, website: "  " }), false);
  assert.equal(looksLikeBot({ ...VALID, website: "http://spam.example" }), true);
});

test("buildMailerLitePayload separa nombre y apellido", () => {
  const payload = buildMailerLitePayload(VALID, undefined);
  assert.deepEqual(payload.email, "ana.torres@gmail.com");
  assert.equal(payload.fields.name, "Ana");
  assert.equal(payload.fields.last_name, "Torres");
  assert.equal(payload.groups, undefined);
});

test("buildMailerLitePayload: nombre de una palabra no inventa apellido", () => {
  const payload = buildMailerLitePayload({ ...VALID, name: "Matías" }, undefined);
  assert.equal(payload.fields.name, "Matías");
  assert.equal("last_name" in payload.fields, false);
});

test("buildMailerLitePayload agrega el grupo cuando existe", () => {
  const payload = buildMailerLitePayload(VALID, "4243829086487936");
  assert.deepEqual(payload.groups, ["4243829086487936"]);
});

test("isMailerLiteConfigured exige un token no vacio", () => {
  assert.equal(isMailerLiteConfigured(undefined), false);
  assert.equal(isMailerLiteConfigured("   "), false);
  assert.equal(isMailerLiteConfigured("ml-token"), true);
});

test("leadFailureMessage explica cada fallo sin fingir un alta", () => {
  const noAuth = leadFailureMessage(401);
  const badEmail = leadFailureMessage(422);
  const limited = leadFailureMessage(429);
  const other = leadFailureMessage(500);

  assert.ok(noAuth.toLowerCase().includes("no quedó registrado"));
  assert.ok(badEmail.toLowerCase().includes("revísalo"));
  assert.ok(limited.toLowerCase().includes("espera"));
  assert.ok(other.toLowerCase().includes("no pudimos"));

  for (const msg of [noAuth, badEmail, limited, other]) {
    assert.ok(msg.length > 20);
    assert.equal(/token|bearer|stack/i.test(msg), false, "no debe filtrar detalles internos");
  }
});

test("buildLeadWhatsAppMessage saluda por nombre y explica el motivo", () => {
  const conNombre = buildLeadWhatsAppMessage("Ana Torres");
  assert.ok(conNombre.includes("Soy Ana Torres"));
  assert.ok(conNombre.includes("simulacro M1"));

  const sinNombre = buildLeadWhatsAppMessage("   ");
  assert.equal(sinNombre.includes("Soy"), false);

  const noConfigurado = buildLeadWhatsAppMessage("Ana", "no-configurado");
  assert.ok(noConfigurado.includes("todavía no está conectado"));
});

test("buildLeadWhatsAppMessage en alta exitosa no habla de fallos", () => {
  const msg = buildLeadWhatsAppMessage("Ana Torres", "registrado");
  assert.ok(msg.includes("Descargué el simulacro M1"));
  assert.ok(msg.includes("revises los errores"));
  assert.equal(msg.includes("formulario"), false);
  assert.equal(msg.includes("correo"), false);
});
