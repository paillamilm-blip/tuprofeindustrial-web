export type CompletedByDayMap = Record<string, Record<string, boolean>>;

export interface SyncPayload {
  v: 1;
  t: number;
  d: Record<string, string[]>;
}

export type DecodeSyncResult =
  | { ok: true; payload: SyncPayload; completedByDay: CompletedByDayMap }
  | { ok: false; error: string };

const MAX_SYNC_RAW_LENGTH = 8192;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Convierte el mapa { dia: { accionId: boolean } } en un token compacto para URL (#s=...). */
export function encodeSyncState(
  completedByDay: CompletedByDayMap,
  nowSec = Math.floor(Date.now() / 1000)
): string {
  const compactDays: Record<string, string[]> = {};
  for (const [dayKey, tasks] of Object.entries(completedByDay)) {
    const doneIds = Object.entries(tasks)
      .filter(([, done]) => Boolean(done))
      .map(([id]) => id)
      .sort();
    if (doneIds.length > 0) {
      compactDays[dayKey] = doneIds;
    }
  }
  const payload: SyncPayload = {
    v: 1,
    t: Math.floor(nowSec),
    d: compactDays,
  };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
  return `v1.${toBase64Url(jsonBytes)}`;
}

/** Extrae y valida un token de sincronización desde un hash (`#s=...`), query (`?sync=...`) o texto crudo. */
export function decodeSyncState(rawInput: string): DecodeSyncResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, error: "Enlace de sincronización vacío." };
  }
  if (trimmed.length > MAX_SYNC_RAW_LENGTH) {
    return { ok: false, error: "Token de sincronización excede el tamaño seguro." };
  }

  let token = trimmed;
  if (token.startsWith("#")) token = token.slice(1);
  if (token.includes("s=")) {
    const match = token.match(/(?:^|[?&#])s=([^&#]+)/);
    if (match?.[1]) token = decodeURIComponent(match[1]);
  } else if (token.includes("sync=")) {
    const match = token.match(/(?:^|[?&#])sync=([^&#]+)/);
    if (match?.[1]) token = decodeURIComponent(match[1]);
  }

  if (!token.startsWith("v1.")) {
    return { ok: false, error: "Formato de sincronización no reconocido." };
  }

  try {
    const body = token.slice(3);
    const bytes = fromBase64Url(body);
    const jsonText = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonText) as Partial<SyncPayload>;

    if (
      parsed.v !== 1 ||
      typeof parsed.t !== "number" ||
      !Number.isFinite(parsed.t) ||
      typeof parsed.d !== "object" ||
      parsed.d === null ||
      Array.isArray(parsed.d)
    ) {
      return { ok: false, error: "Estructura de sincronización inválida." };
    }

    const completedByDay: CompletedByDayMap = {};
    const sanitizedDays: Record<string, string[]> = {};

    for (const [dayKey, ids] of Object.entries(parsed.d)) {
      if (!Array.isArray(ids)) {
        return { ok: false, error: `Día "${dayKey}" con formato inválido.` };
      }
      const cleanIds = ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 120);
      if (cleanIds.length > 0) {
        sanitizedDays[dayKey] = Array.from(new Set(cleanIds)).sort();
        completedByDay[dayKey] = Object.fromEntries(sanitizedDays[dayKey].map((id) => [id, true]));
      }
    }

    return {
      ok: true,
      payload: {
        v: 1,
        t: parsed.t,
        d: sanitizedDays,
      },
      completedByDay,
    };
  } catch {
    return { ok: false, error: "No se pudo leer el enlace de sincronización." };
  }
}

/** Une el progreso remoto con el local conservando tareas ya marcadas (modo suma segura). */
export function mergeCompletedByDay(
  localMap: CompletedByDayMap,
  incomingMap: CompletedByDayMap
): { merged: CompletedByDayMap; addedCount: number } {
  const merged: CompletedByDayMap = {};
  let addedCount = 0;

  for (const [dayKey, tasks] of Object.entries(localMap)) {
    merged[dayKey] = { ...tasks };
  }

  for (const [dayKey, incomingTasks] of Object.entries(incomingMap)) {
    if (!merged[dayKey]) merged[dayKey] = {};
    for (const [actionId, done] of Object.entries(incomingTasks)) {
      if (done && !merged[dayKey][actionId]) {
        merged[dayKey][actionId] = true;
        addedCount += 1;
      }
    }
  }

  return { merged, addedCount };
}

export interface SyncedWeekDayStatus {
  iso: string;
  label: string;
  status: "completado" | "activo" | "calibrado" | "pendiente_render";
  summary: string;
  assetCount: number;
  notes?: string;
}

export interface SyncedGrillaData {
  syncedAt: string;
  syncSource: string;
  registroEntries: number;
  completedBaseline: CompletedByDayMap;
  prunedPastVideos: string[];
  activeVideoCount: number;
  activeVideoSizeMb: number;
  weekendReadiness: SyncedWeekDayStatus[];
}

export function getSantiagoNow(now: Date = new Date()): {
  isoDate: string;
  minutes: number;
  timeStr: string;
} {
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return {
    isoDate: dateFmt,
    minutes: hh * 60 + mm,
    timeStr: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
  };
}

export function diffDaysFromIso(fromIso: string, targetIso: string): number {
  const fromMs = Date.parse(`${fromIso}T00:00:00Z`);
  const targetMs = Date.parse(`${targetIso}T00:00:00Z`);
  return Math.max(0, Math.round((targetMs - fromMs) / 86400000));
}
