import { createHmac, timingSafeEqual } from "node:crypto";

export const GRILLA_SESSION_COOKIE = "tpi_grilla_session";
export const GRILLA_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días

/** Indica si el entorno definió un PIN no vacío para proteger /grilla. */
export function isGrillaPinConfigured(pinEnv: string | undefined): boolean {
  return Boolean(pinEnv && pinEnv.trim().length > 0);
}

/** Compara el PIN ingresado con el PIN esperado en tiempo constante (sin filtrar largo). */
export function verifyGrillaPin(inputPin: string, expectedPin: string): boolean {
  const cleanInput = inputPin.trim();
  const cleanExpected = expectedPin.trim();
  if (!cleanExpected || !cleanInput) return false;

  const inputDigest = createHmac("sha256", "tpi-pin-compare").update(cleanInput).digest();
  const expectedDigest = createHmac("sha256", "tpi-pin-compare").update(cleanExpected).digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

function signPayload(payloadB64: string, pin: string, extraSecret = ""): string {
  const secretKey = `${pin.trim()}::${extraSecret || "tpi-grilla-cookie-v1"}`;
  return createHmac("sha256", secretKey).update(payloadB64).digest("base64url");
}

/** Firma un token de sesión stateless para guardar en cookie HttpOnly. */
export function createGrillaSessionToken(
  pin: string,
  extraSecret = "",
  nowMs = Date.now(),
  ttlSeconds = GRILLA_SESSION_TTL_SECONDS
): string {
  const exp = Math.floor(nowMs / 1000) + ttlSeconds;
  const payloadB64 = Buffer.from(JSON.stringify({ v: 1, exp }), "utf8").toString("base64url");
  const sig = signPayload(payloadB64, pin, extraSecret);
  return `${payloadB64}.${sig}`;
}

/** Valida firma HMAC y expiración de la cookie de sesión de /grilla. */
export function verifyGrillaSessionToken(
  token: string | undefined,
  pin: string,
  extraSecret = "",
  nowMs = Date.now()
): boolean {
  if (!token || !pin.trim()) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return false;

  const expectedSig = signPayload(payloadB64, pin, extraSecret);
  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      v?: number;
      exp?: number;
    };
    if (parsed.v !== 1 || typeof parsed.exp !== "number") return false;
    return parsed.exp > Math.floor(nowMs / 1000);
  } catch {
    return false;
  }
}
