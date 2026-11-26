import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encodeSyncState, decodeSyncState, mergeCompletedByDay } from "./grilla-sync";
import {
  isGrillaPinConfigured,
  verifyGrillaPin,
  createGrillaSessionToken,
  verifyGrillaSessionToken,
} from "./grilla-auth";

describe("grilla cross-device sync codec", () => {
  it("codifica y decodifica tareas completadas por dia en token compacto", () => {
    const input = {
      "mie-25": { "mie-1230-video": true, "mie-1300-story": true, "mie-1730-video": false },
      "jue-26": { "jue-0900-car": true },
    };
    const token = encodeSyncState(input, 1795650000);
    assert.ok(token.startsWith("v1."));

    const decoded = decodeSyncState(`#s=${token}`);
    assert.equal(decoded.ok, true);
    if (!decoded.ok) return;
    assert.deepEqual(decoded.payload.d["mie-25"], ["mie-1230-video", "mie-1300-story"]);
    assert.deepEqual(decoded.payload.d["jue-26"], ["jue-0900-car"]);
    assert.equal(decoded.completedByDay["mie-25"]["mie-1230-video"], true);
    assert.equal(decoded.completedByDay["mie-25"]["mie-1730-video"], undefined);
  });

  it("rechaza tokens malformados o con version desconocida", () => {
    assert.equal(decodeSyncState("").ok, false);
    assert.equal(decodeSyncState("v2.abc").ok, false);
    assert.equal(decodeSyncState("v1.no-es-base64-valido!!!").ok, false);
  });

  it("mergeCompletedByDay suma tareas remotas sin borrar avances locales", () => {
    const local = { "mie-25": { "mie-1230-video": true } };
    const remote = {
      "mie-25": { "mie-1230-video": true, "mie-1730-video": true },
      "jue-26": { "jue-1230-video": true },
    };
    const { merged, addedCount } = mergeCompletedByDay(local, remote);
    assert.equal(addedCount, 2);
    assert.equal(merged["mie-25"]["mie-1230-video"], true);
    assert.equal(merged["mie-25"]["mie-1730-video"], true);
    assert.equal(merged["jue-26"]["jue-1230-video"], true);
  });
});

describe("grilla server PIN auth", () => {
  it("detecta cuando GRILLA_PIN esta configurado vs vacio", () => {
    assert.equal(isGrillaPinConfigured(undefined), false);
    assert.equal(isGrillaPinConfigured("   "), false);
    assert.equal(isGrillaPinConfigured("2026"), true);
  });

  it("verifica PIN exacto y rechaza incorrecto", () => {
    assert.equal(verifyGrillaPin("2511", "2511"), true);
    assert.equal(verifyGrillaPin(" 2511 ", "2511"), true);
    assert.equal(verifyGrillaPin("9999", "2511"), false);
    assert.equal(verifyGrillaPin("", "2511"), false);
  });

  it("firma y valida cookie de sesion, caduca tras TTL y falla si cambia el PIN", () => {
    const now = 1_795_650_000_000;
    const token = createGrillaSessionToken("2511", "secret-salt", now, 60);
    assert.equal(verifyGrillaSessionToken(token, "2511", "secret-salt", now + 30_000), true);
    assert.equal(verifyGrillaSessionToken(token, "2511", "secret-salt", now + 61_000), false);
    assert.equal(verifyGrillaSessionToken(token, "0000", "secret-salt", now + 10_000), false);
    assert.equal(verifyGrillaSessionToken(`${token}x`, "2511", "secret-salt", now + 10_000), false);
  });
});

import { getSantiagoNow, diffDaysFromIso } from "./grilla-sync";

describe("grilla Santiago clock and countdown helpers", () => {
  it("formatea fecha ISO y minutos en zona horaria America/Santiago", () => {
    const utcSample = new Date("2026-11-26T01:30:00Z"); // 22:30 CLT del 25-Nov
    const clt = getSantiagoNow(utcSample);
    assert.equal(clt.isoDate, "2026-11-25");
    assert.equal(clt.timeStr, "22:30");
    assert.equal(clt.minutes, 22 * 60 + 30);
  });

  it("calcula dias restantes sin valores negativos", () => {
    assert.equal(diffDaysFromIso("2026-11-25", "2026-11-30"), 5);
    assert.equal(diffDaysFromIso("2026-12-02", "2026-11-30"), 0);
  });
});
