/**
 * Pruebas unitarias del constructor de enlaces de WhatsApp.
 * Se ejecutan con `node --test` a traves de tsx (ver script npm "test").
 *
 * Importan las funciones REALES de ./whatsapp SIN la extension .ts, igual que
 * el resto de las pruebas del proyecto.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
  isPlaceholderPhone,
  PLACEHOLDER_PHONE,
} from "./whatsapp";

test("buildWhatsAppUrl arma el enlace wa.me con el mensaje codificado", () => {
  const url = buildWhatsAppUrl("Hola profe", "56912345678");
  assert.equal(url, "https://wa.me/56912345678?text=Hola%20profe");
});

test("buildWhatsAppUrl sanea el telefono dejando solo digitos", () => {
  const url = buildWhatsAppUrl("Hola", "+56 9 1234 5678");
  assert.equal(url, "https://wa.me/56912345678?text=Hola");
});

test("buildWhatsAppUrl usa el mensaje por defecto si no se pasa uno", () => {
  const url = buildWhatsAppUrl(undefined, "56912345678");
  assert.ok(
    url.endsWith(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)),
    "el enlace debe terminar con el mensaje por defecto codificado"
  );
});

test("buildWhatsAppUrl codifica caracteres especiales y acentos del mensaje", () => {
  const url = buildWhatsAppUrl("¿Cuánto cuesta? 50% dcto", "56912345678");
  // encodeURIComponent cubre ¿ ¡ espacios, signos de pregunta, % y tildes.
  assert.equal(url, `https://wa.me/56912345678?text=${encodeURIComponent("¿Cuánto cuesta? 50% dcto")}`);
  assert.ok(!url.includes(" "), "no deben quedar espacios sin codificar");
});

test("isPlaceholderPhone detecta el numero PLACEHOLDER (crudo o con simbolos)", () => {
  assert.equal(isPlaceholderPhone(PLACEHOLDER_PHONE), true);
  assert.equal(isPlaceholderPhone("+56 9 0000 0000"), true);
  assert.equal(isPlaceholderPhone("56912345678"), false);
});
