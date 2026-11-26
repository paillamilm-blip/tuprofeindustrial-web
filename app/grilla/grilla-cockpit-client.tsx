"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  ChevronRight,
  Download,
  MessageCircle,
  FileText,
  RefreshCw,
  Share2,
  Lock,
  X,
  Calendar,
  Bell,
  BellRing,
  Users,
  Clock,
  Layers,
  Film,
} from "lucide-react";
import type { ActionItem, DayKey, DaySchedule } from "./grilla-data";
import {
  decodeSyncState,
  diffDaysFromIso,
  encodeSyncState,
  getSantiagoNow,
  mergeCompletedByDay,
  type CompletedByDayMap,
  type SyncedGrillaData,
} from "@/lib/grilla-sync";
import { lockGrillaAction } from "./actions";

export interface QuoteItem {
  readonly key: string;
  readonly name: string;
  readonly price: string;
  readonly sub: string;
  readonly featured: boolean;
  readonly purple: boolean;
  readonly message: string;
}

export interface ConvocatoriaItem {
  readonly nombre: string;
  readonly entidad: string;
  readonly fechaIso: string;
  readonly fechaLabel: string;
  readonly monto: string;
  readonly estado: "alerta" | "proceso" | "listo";
  readonly accion: string;
}

export interface QuickAppItem {
  readonly label: string;
  readonly url: string;
}

interface GrillaCockpitClientProps {
  daysData: Record<DayKey, DaySchedule>;
  quickApps: readonly QuickAppItem[];
  quotesWa: readonly QuoteItem[];
  convocatoriasBase: readonly ConvocatoriaItem[];
  superprofUrl: string;
  formularioMaestroPdf: string;
  simulacroM1Pdf: string;
  syncedData: SyncedGrillaData;
  isPinProtected: boolean;
}

const DAY_KEYS: DayKey[] = ["mie25", "jue26"];
const SERVER_TIME_KEY = "2026-11-26|0725|07:25";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tpi-tracking-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tpi-tracking-update", callback);
  };
}

function getDayStorageSnapshot(day: DayKey, baselineJson: string): string {
  try {
    const val = localStorage.getItem(`tpi_tracking_${day}`);
    if (val !== null) return val;
  } catch {
    // Fallback
  }
  return baselineJson;
}

function subscribeClock(callback: () => void) {
  const id = setInterval(callback, 30000);
  return () => clearInterval(id);
}

function getClockSnapshot(): string {
  const now = getSantiagoNow();
  return `${now.isoDate}|${now.minutes}|${now.timeStr}`;
}

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback abajo
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function readAllCompletedFromStorage(
  baseline: CompletedByDayMap
): CompletedByDayMap {
  const out: CompletedByDayMap = {};
  for (const key of DAY_KEYS) {
    const fallback = baseline[key] ?? {};
    try {
      const raw = localStorage.getItem(`tpi_tracking_${key}`);
      out[key] = raw ? (JSON.parse(raw) as Record<string, boolean>) : { ...fallback };
    } catch {
      out[key] = { ...fallback };
    }
  }
  return out;
}

function writeAllCompletedToStorage(map: CompletedByDayMap): void {
  for (const [dayKey, tasks] of Object.entries(map)) {
    try {
      localStorage.setItem(`tpi_tracking_${dayKey}`, JSON.stringify(tasks));
    } catch {
      // Ignorar si storage lleno
    }
  }
  window.dispatchEvent(new Event("tpi-tracking-update"));
}

export interface VideoBlock {
  id: string;
  timeSlot: string;
  title: string;
  topic: string;
  mainAction: ActionItem;
  associatedActions: ActionItem[];
  allActions: ActionItem[];
  carousel?: DaySchedule["carousels"][number];
  stories: DaySchedule["stories"];
  videoAsset?: DaySchedule["videos"][number];
}

export function GrillaCockpitClient({
  daysData,
  quotesWa,
  formularioMaestroPdf,
  syncedData,
  isPinProtected,
}: GrillaCockpitClientProps) {
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modales ligeros y pestañas operativas de mando
  const [viewMode, setViewMode] = useState<"diario" | "semanal">("diario");
  const [inspectBlockId, setInspectBlockId] = useState<string | null>(null);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [manualSyncInput, setManualSyncInput] = useState("");
  const [pushEnabled, setPushEnabled] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission === "granted";
    }
    return false;
  });
  const [leadCount, setLeadCount] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tpi_leads_today");
        return stored ? Number(stored) : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  // Registrar Service Worker para notificaciones push
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const addLead = (delta: number) => {
    const next = Math.max(0, leadCount + delta);
    setLeadCount(next);
    try {
      localStorage.setItem("tpi_leads_today", String(next));
    } catch {}
    showToast(delta > 0 ? `🎯 Alumno registrado (+1) Total: ${next}` : `Restado: ${next}`);
  };

  const requestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("⚠️ Tu navegador no soporta notificaciones");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushEnabled(perm === "granted");
      if (perm === "granted") {
        showToast("🔔 Alertas activadas a las 12:15, 17:15 y 21:00");
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SCHEDULE_NOTIFICATION",
            title: "⏰ Turno 12:30 listo para publicar",
            body: "Revisa la grilla móvil para copiar el texto y subir tu video.",
            delayMs: 1000,
          });
        }
      } else {
        showToast("⚠️ Permiso de notificaciones denegado");
      }
    } catch {
      showToast("⚠️ Error al pedir permisos");
    }
  };

  const clockKey = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    () => SERVER_TIME_KEY
  );
  const [isoDate, minsStr, timeStr] = clockKey.split("|");
  const santiagoNow = {
    isoDate,
    minutes: Number(minsStr),
    timeStr,
  };

  const selectedDay: DayKey =
    dayOverride ?? (santiagoNow.isoDate >= "2026-11-26" ? "jue26" : "mie25");

  const baselineJson = useMemo(
    () => JSON.stringify(syncedData.completedBaseline[selectedDay] ?? {}),
    [syncedData.completedBaseline, selectedDay]
  );

  const rawCompletedJson = useSyncExternalStore(
    subscribeStorage,
    () => getDayStorageSnapshot(selectedDay, baselineJson),
    () => baselineJson
  );

  const completedMap = useMemo<Record<string, boolean>>(() => {
    try {
      return JSON.parse(rawCompletedJson) as Record<string, boolean>;
    } catch {
      return {};
    }
  }, [rawCompletedJson]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // Auto-sync desde #s=
  useEffect(() => {
    let importedCount = 0;
    let shouldNotifyHash = false;
    const localMap = readAllCompletedFromStorage(syncedData.completedBaseline);
    let workingMap = localMap;

    try {
      const lastMacSync = localStorage.getItem("tpi_last_mac_sync");
      if (lastMacSync !== syncedData.syncedAt) {
        const res = mergeCompletedByDay(workingMap, syncedData.completedBaseline);
        workingMap = res.merged;
        importedCount += res.addedCount;
        localStorage.setItem("tpi_last_mac_sync", syncedData.syncedAt);
        writeAllCompletedToStorage(workingMap);
      }
    } catch {
      // Ignorar
    }

    const rawUrlToken = window.location.hash || window.location.search;
    if (rawUrlToken && (rawUrlToken.includes("s=") || rawUrlToken.includes("sync="))) {
      const decoded = decodeSyncState(rawUrlToken);
      if (decoded.ok) {
        const res = mergeCompletedByDay(workingMap, decoded.completedByDay);
        workingMap = res.merged;
        importedCount += res.addedCount;
        shouldNotifyHash = true;
        writeAllCompletedToStorage(workingMap);
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    if (shouldNotifyHash || importedCount > 0) {
      const timer = setTimeout(() => {
        showToast(
          importedCount > 0
            ? `🔄 Sincronizadas +${importedCount} acciones`
            : "🔄 Grilla al día"
        );
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [syncedData.syncedAt, syncedData.completedBaseline]);

  const toggleTask = (taskId: string) => {
    const nextState = !completedMap[taskId];
    const nextMap = { ...completedMap, [taskId]: nextState };
    try {
      localStorage.setItem(`tpi_tracking_${selectedDay}`, JSON.stringify(nextMap));
      window.dispatchEvent(new Event("tpi-tracking-update"));
      showToast(nextState ? "🟢 Marcado como LISTO" : "↺ Devuelto a pendiente");
    } catch {
      // Ignorar
    }
  };

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyTextSafe(text);
    setCopiedKey(key);
    showToast(ok ? "📋 ¡Copiado!" : "⚠️ Selecciona el texto");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const buildCurrentSyncUrl = (): string => {
    const allMap = readAllCompletedFromStorage(syncedData.completedBaseline);
    const token = encodeSyncState(allMap);
    const origin =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "https://tuprofeindustrial-web.vercel.app/grilla";
    return `${origin}#s=${token}`;
  };

  const handleCopySyncLink = async () => {
    const url = buildCurrentSyncUrl();
    const ok = await copyTextSafe(url);
    showToast(ok ? "📤 Link #s= copiado" : "⚠️ Error");
  };

  const handleImportManualSync = () => {
    const decoded = decodeSyncState(manualSyncInput);
    if (!decoded.ok) {
      showToast(`⚠️ ${decoded.error}`);
      return;
    }
    const localMap = readAllCompletedFromStorage(syncedData.completedBaseline);
    const { merged, addedCount } = mergeCompletedByDay(localMap, decoded.completedByDay);
    writeAllCompletedToStorage(merged);
    setManualSyncInput("");
    setShowSyncModal(false);
    showToast(`🔄 +${addedCount} tareas actualizadas`);
  };

  const currentDayData = daysData[selectedDay];
  const dayTasks = currentDayData.actions;

  const isTaskUrgent = (task: ActionItem): boolean => {
    if (completedMap[task.id]) return false;
    if (currentDayData.isoDate < santiagoNow.isoDate) return true;
    if (currentDayData.isoDate > santiagoNow.isoDate) return false;
    return task.minutesFromMidnight <= santiagoNow.minutes + 45;
  };

  // Agrupación en 3 Bloques Maestros (12:30, 17:30, 21:15)
  const videoBlocks = useMemo<VideoBlock[]>(() => {
    const videoActions = dayTasks.filter((a) => a.category === "video");

    return videoActions.map((vAction) => {
      let timeSlot = "12:30";
      if (vAction.time.includes("17") || vAction.time.includes("18")) timeSlot = "17:30";
      if (vAction.time.includes("20") || vAction.time.includes("21")) timeSlot = "21:15";

      const associated = dayTasks.filter((a) => {
        if (a.id === vAction.id) return false;
        if (timeSlot === "12:30") return a.minutesFromMidnight <= 14 * 60;
        if (timeSlot === "17:30")
          return a.minutesFromMidnight > 14 * 60 && a.minutesFromMidnight < 20 * 60;
        return a.minutesFromMidnight >= 20 * 60;
      });

      const carousel = currentDayData.carousels.find(
        (c) => c.id.includes(timeSlot.replace(":", "")) || (timeSlot === "12:30" && c.id.includes("1230"))
      );

      const stories = currentDayData.stories.filter(
        (st) =>
          st.id.includes(timeSlot.replace(":", "")) ||
          (timeSlot === "12:30" && st.id.includes("1230")) ||
          (timeSlot === "17:30" && st.id.includes("1730")) ||
          (timeSlot === "21:15" && st.id.includes("2115"))
      );

      const videoAsset = currentDayData.videos.find((v) => v.time === vAction.time);

      return {
        id: vAction.id,
        timeSlot,
        title: vAction.title,
        topic: vAction.detail,
        mainAction: vAction,
        associatedActions: associated,
        allActions: [vAction, ...associated],
        carousel,
        stories,
        videoAsset,
      };
    });
  }, [dayTasks, currentDayData]);

  const completedCount = dayTasks.filter((t) => completedMap[t.id]).length;
  const alertaTasks = dayTasks.filter((t) => !completedMap[t.id] && isTaskUrgent(t));
  const procesoTasks = dayTasks.filter((t) => !completedMap[t.id] && !isTaskUrgent(t));
  const progressPercent = Math.round((completedCount / dayTasks.length) * 100);
  const isAllDone = completedCount === dayTasks.length;
  const paesDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2026-11-30");

  const inspectedBlock = useMemo(() => {
    return videoBlocks.find((b) => b.id === inspectBlockId) ?? null;
  }, [videoBlocks, inspectBlockId]);

  // Medición de tiempo operativo hacia el próximo turno
  const nextPendingBlock = useMemo(() => {
    return videoBlocks.find((b) => !completedMap[b.mainAction.id]) ?? null;
  }, [videoBlocks, completedMap]);

  const timeDiffMins = nextPendingBlock
    ? nextPendingBlock.mainAction.minutesFromMidnight - santiagoNow.minutes
    : null;

  const WEEK_PLAN = [
    {
      day: "Lunes 23 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topics: ["12:30 Simplificar", "17:30 1m² a cm²", "21:15 i² = -1"],
      key: null,
    },
    {
      day: "Martes 24 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topics: ["12:30 Olvido del ±", "17:30 Vértice parábola", "21:15 Secreto π"],
      key: null,
    },
    {
      day: "Miércoles 25 Nov",
      status: "🟢 Operativo (3/3)",
      badgeColor: "bg-emerald-600 text-white",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topics: ["12:30 Discriminante", "17:30 Arista 3D", "21:15 Dividir por 0"],
      key: "mie25" as DayKey,
    },
    {
      day: "Jueves 26 Nov",
      status: "🔴 Turno de Hoy",
      badgeColor: "bg-red-600 text-white animate-pulse",
      cardBg: "bg-red-50 border-red-400 text-red-950 ring-2 ring-red-200",
      topics: ["12:30 Parábola y Recta", "17:30 Truco Viète", "21:15 Euler + Formulario"],
      key: "jue26" as DayKey,
    },
    {
      day: "Viernes 27 Nov",
      status: "🟡 Guiones Listos",
      badgeColor: "bg-amber-500 text-slate-950",
      cardBg: "bg-amber-50 border-amber-300 text-amber-950",
      topics: ["12:30 Inecuaciones (signo)", "17:30 Ganancia máx (vértice)", "21:15 Fractales (Koch)"],
      key: null,
    },
    {
      day: "Sábado 28 Nov",
      status: "🟡 Programado",
      badgeColor: "bg-slate-700 text-white",
      cardBg: "bg-slate-50 border-slate-300 text-slate-900",
      topics: ["12:30 Intersección ejes", "17:30 Inversa función", "21:15 Hilbert"],
      key: null,
    },
    {
      day: "Domingo 29 Nov",
      status: "🟡 Víspera PAES",
      badgeColor: "bg-purple-600 text-white",
      cardBg: "bg-purple-50 border-purple-300 text-purple-950",
      topics: ["12:30 10 Puntos Clave", "17:30 Calma y Ritmo", "21:15 Mensaje Éxito"],
      key: null,
    },
    {
      day: "Lunes 30 Nov",
      status: "🎓 ¡DÍA 1 PAES M1!",
      badgeColor: "bg-blue-600 text-white font-black",
      cardBg: "bg-blue-50 border-blue-300 text-blue-950",
      topics: ["08:00 Desayuno y Calma", "14:00 Ánimo prueba", "18:00 Feedback inicial"],
      key: null,
    },
  ];

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-hidden antialiased select-none p-2.5 sm:p-3">
      {/* 1. CABECERA: IDENTIFICACIÓN, RELOJ Y SWITCH DE MANDO */}
      <header className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-tight text-slate-900 leading-none truncate">
                Mando de Operaciones · @tuprofeindustrial
              </h1>
              <span className="text-[10px] font-mono font-bold text-slate-500 leading-none">
                {santiagoNow.timeStr} CLT · PAES: {paesDaysLeft}d
              </span>
            </div>
          </div>

          {/* BOTONES PUSH, SYNC Y LOCK */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={requestPushPermission}
              title={pushEnabled ? "Notificaciones push activas" : "Activar recordatorios push"}
              className={`cursor-pointer touch-manipulation min-h-[30px] px-2 py-0.5 rounded-lg border text-xs font-black flex items-center gap-1 transition ${
                pushEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-900"
              }`}
            >
              {pushEnabled ? <BellRing className="w-3.5 h-3.5 text-emerald-600 animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="cursor-pointer touch-manipulation min-h-[30px] px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black flex items-center gap-1 hover:bg-blue-100"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
            {isPinProtected && (
              <form action={lockGrillaAction}>
                <button
                  type="submit"
                  className="cursor-pointer touch-manipulation min-h-[30px] p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  title="Bloquear grilla"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* SWITCH PRINCIPAL DE OPERACIONES: [📅 PLAN DIARIO] vs [🗓️ PLAN SEMANAL] */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("diario")}
            className={`cursor-pointer touch-manipulation min-h-[34px] rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
              viewMode === "diario"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Plan Diario (Hoy)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("semanal")}
            className={`cursor-pointer touch-manipulation min-h-[34px] rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
              viewMode === "semanal"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Plan Semanal</span>
          </button>
        </div>
      </header>

      {/* 2. PANEL DE MÉTRICAS OPERATIVAS Y CONTROL DE TIEMPO */}
      <section className="bg-white rounded-2xl p-2.5 border-2 border-slate-200 shadow-xs shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-700 uppercase tracking-wide text-[10.5px]">
            Semáforo de Hoy ({currentDayData.shortLabel})
          </span>
          <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {progressPercent}% completado
          </span>
        </div>

        {/* FILA DE TIEMPO OPERATIVO (HITO ACTUAL / PRÓXIMO / ATRASO) */}
        <div className="flex items-center justify-between gap-1.5">
          <div
            className={`flex-1 min-w-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-black text-xs ${
              isAllDone || !nextPendingBlock
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : timeDiffMins !== null && timeDiffMins <= 0
                ? "bg-red-600 text-white border-red-700 animate-pulse"
                : "bg-slate-900 text-amber-300 border-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isAllDone || !nextPendingBlock
                ? "🟢 Día 100% completado (3/3 videos)"
                : timeDiffMins !== null && timeDiffMins <= 0
                ? `🚨 Turno ${nextPendingBlock.timeSlot} ATRASADO (+${Math.abs(timeDiffMins)}m)`
                : `⏳ Próximo Turno: ${nextPendingBlock.timeSlot} (en ${Math.floor(timeDiffMins! / 60)}h ${timeDiffMins! % 60}m)`}
            </span>
          </div>

          {/* SELECTOR RÁPIDO DE DÍA (SI ESTÁ EN MODO DIARIO) */}
          {viewMode === "diario" && (
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              {DAY_KEYS.map((key) => {
                const active = selectedDay === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDayOverride(key)}
                    className={`cursor-pointer touch-manipulation px-2.5 py-1 rounded-md text-xs font-black transition ${
                      active
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {daysData[key].shortLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 CAJAS DE SEMÁFORO CON MÉTRICAS NUMÉRICAS REALES */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* VERDE: LISTO */}
          <div className="rounded-xl p-1.5 bg-emerald-500 text-white flex flex-col items-center justify-center shadow-xs">
            <span className="text-base font-black leading-none">{completedCount}</span>
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">🟢 LISTO</span>
          </div>

          {/* AMARILLO: EN ESPERA */}
          <div className="rounded-xl p-1.5 bg-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-xs">
            <span className="text-base font-black leading-none">{procesoTasks.length}</span>
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">🟡 EN ESPERA</span>
          </div>

          {/* ROJO: EN ALERTA */}
          <div
            className={`rounded-xl p-1.5 flex flex-col items-center justify-center transition shadow-xs ${
              alertaTasks.length > 0
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <span className="text-base font-black leading-none">{alertaTasks.length}</span>
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">
              {alertaTasks.length > 0 ? "🔴 ATRASO" : "⚪ AL DÍA"}
            </span>
          </div>
        </div>
      </section>

      {/* 3. VISTA DIARIA: LOS 3 BLOQUES DE CONTENIDO DE HOY */}
      {viewMode === "diario" ? (
        <section className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[10.5px] font-black text-slate-600 uppercase px-1">
            <span>Contenido de Hoy ({videoBlocks.length} Productos)</span>
            <span className="text-blue-700 font-bold">Toca para abrir subproductos</span>
          </div>

          <div className="space-y-1.5">
            {videoBlocks.map((block) => {
              const isVideoDone = !!completedMap[block.mainAction.id];
              const hasAlert = block.allActions.some((a) => isTaskUrgent(a));

              const cardBg = isVideoDone
                ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                : hasAlert
                ? "bg-red-50 border-red-500 text-red-950 ring-2 ring-red-200"
                : "bg-amber-50 border-amber-400 text-amber-950";

              const badgeBg = isVideoDone
                ? "bg-emerald-600 text-white"
                : hasAlert
                ? "bg-red-600 text-white animate-pulse"
                : "bg-amber-500 text-slate-950";

              const subproductsBadges = [
                block.mainAction.videoDownloadUrl ? "🎬 MP4" : null,
                block.mainAction.assetPreview ? "🖼️ Portada" : null,
                block.carousel ? `📑 Carrusel (${block.carousel.slides.length})` : null,
                block.stories.length > 0 ? `📱 ${block.stories.length} Stories` : null,
              ].filter(Boolean);

              return (
                <div
                  key={block.id}
                  className={`p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 shadow-xs transition ${cardBg}`}
                >
                  {/* Tocar el bloque abre el modal con TODOS los subproductos */}
                  <button
                    type="button"
                    onClick={() => setInspectBlockId(block.id)}
                    className="cursor-pointer touch-manipulation min-w-0 flex-1 text-left flex items-center gap-2"
                  >
                    <span
                      className={`font-mono font-black text-xs px-2 py-1 rounded-lg shrink-0 ${badgeBg}`}
                    >
                      {block.timeSlot}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black truncate leading-tight flex items-center gap-1">
                        <span>{block.title.replace(/^Video.*?: /, "")}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      </div>

                      {/* BADGES DE SUBPRODUCTOS INCLUIDOS DETRÁS DEL VIDEO */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subproductsBadges.map((badge, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded border border-slate-300/60 text-slate-800"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] font-bold opacity-80 truncate mt-0.5">
                        {isVideoDone
                          ? "🟢 Video subido y confirmado"
                          : hasAlert
                          ? "🔴 ¡En alerta! Turno pendiente"
                          : "🟡 En espera para publicar"}
                      </div>
                    </div>
                  </button>

                  {/* BOTÓN TICKET RÁPIDO PARA MORDIENDO EL AVANCE */}
                  <button
                    type="button"
                    onClick={() => toggleTask(block.mainAction.id)}
                    className={`cursor-pointer touch-manipulation min-h-[42px] px-3.5 rounded-xl text-xs font-black border flex items-center gap-1 shrink-0 transition active:scale-95 shadow-xs ${
                      isVideoDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300 hover:border-slate-400 text-slate-800"
                    }`}
                  >
                    {isVideoDone ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Listo</span>
                      </>
                    ) : (
                      <span>Marcar</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* 4. VISTA SEMANAL: MATRIZ DE TODA LA SEMANA */
        <section className="space-y-1.5 shrink-0 max-h-[50dvh] overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between text-[10.5px] font-black text-slate-600 uppercase px-1">
            <span>Planificación Semanal (23–30 Nov)</span>
            <span className="text-blue-700 font-bold">Toca para auditar el día</span>
          </div>

          <div className="space-y-1.5">
            {WEEK_PLAN.map((row) => (
              <div
                key={row.day}
                className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-2 shadow-xs transition ${row.cardBg}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">{row.day}</span>
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${row.badgeColor}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-90 truncate mt-0.5 font-medium">
                    {row.topics.join(" · ")}
                  </div>
                </div>

                {row.key ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDayOverride(row.key!);
                      setViewMode("diario");
                    }}
                    className="cursor-pointer touch-manipulation min-h-[34px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10.5px] rounded-lg shrink-0 shadow-xs flex items-center gap-1"
                  >
                    <span>Auditar</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                    Planificado
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. BARRA INFERIOR DE ACCESO RÁPIDO CON CONTADOR DE LEADS */}
      <footer className="grid grid-cols-4 gap-1.5 pt-1 shrink-0">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "diario" ? "semanal" : "diario")}
          className="cursor-pointer touch-manipulation min-h-[44px] bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-800 flex flex-col items-center justify-center shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px]">{viewMode === "diario" ? "Semana" : "Hoy"}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowQuotesModal(true)}
          className="cursor-pointer touch-manipulation min-h-[44px] bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-800 flex flex-col items-center justify-center shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px]">Cotizar</span>
        </button>

        {/* CONTADOR DE LEADS TÁCTIL */}
        <button
          type="button"
          onClick={() => addLead(1)}
          className="cursor-pointer touch-manipulation min-h-[44px] bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-400 rounded-xl text-emerald-950 font-black flex flex-col items-center justify-center shadow-xs"
          title="Toca para registrar un alumno que escribió al WhatsApp"
        >
          <div className="flex items-center gap-1 leading-none">
            <Users className="w-3 h-3 text-emerald-700" />
            <span className="text-xs font-mono">{leadCount}</span>
          </div>
          <span className="text-[9.5px] uppercase tracking-tight">+1 Alumno</span>
        </button>

        <a
          href={formularioMaestroPdf}
          target="_blank"
          rel="noopener noreferrer"
          download="formulario_maestro_ingenieria.pdf"
          className="cursor-pointer touch-manipulation min-h-[44px] bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black text-white flex flex-col items-center justify-center shadow-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="text-[10px]">PDF Form</span>
        </a>
      </footer>

      {/* ======================================================== */}
      {/* MODAL FICHA DE OPERACIONES (ENTREGA DE TODOS LOS SUBPRODUCTOS) */}
      {/* ======================================================== */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-sm max-h-[88dvh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
            {/* CABECERA DE LA FICHA */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-black text-blue-700 uppercase">
                  {inspectedBlock.timeSlot} HRS · ENTREGA TOTAL DE SUBPRODUCTOS
                </span>
                <h3 className="text-xs font-black text-slate-900 truncate">
                  {inspectedBlock.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectBlockId(null)}
                className="p-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENIDO SCROLLABLE DE TODOS LOS SUBPRODUCTOS */}
            <div className="p-3.5 space-y-3.5 overflow-y-auto text-xs">
              {/* CONTROL DE AVANCE OPERATIVO: ¿SUBIÓ O NO SE SUBIÓ? */}
              {(() => {
                const isVideoDone = !!completedMap[inspectedBlock.mainAction.id];
                return (
                  <div
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 shadow-xs transition ${
                      isVideoDone
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                        : "bg-amber-50 border-amber-400 text-amber-950"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black uppercase flex items-center gap-1">
                        {isVideoDone ? "🟢 Video Subido y Confirmado" : "🟡 Video Pendiente de Subir"}
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {isVideoDone
                          ? "Marcado en tu mando de operaciones"
                          : "Toca para registrar la subida"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTask(inspectedBlock.mainAction.id)}
                      className={`cursor-pointer touch-manipulation min-h-[38px] px-3.5 rounded-xl font-black text-xs shadow-xs transition active:scale-95 flex items-center gap-1 ${
                        isVideoDone
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {isVideoDone ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Listo ✓</span>
                        </>
                      ) : (
                        <span>Marcar Subido</span>
                      )}
                    </button>
                  </div>
                );
              })()}

              {/* 1. SUBPRODUCTO VIDEO MASTER (MP4 9:16) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono font-black text-slate-500 uppercase flex items-center gap-1">
                      <Film className="w-3 h-3 text-blue-600" />
                      <span>Subproducto 1: Video Master (9:16)</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                      {inspectedBlock.mainAction.videoLabel || "Video Vertical HD"}
                    </div>
                  </div>
                  {inspectedBlock.mainAction.videoDownloadUrl && (
                    <a
                      href={inspectedBlock.mainAction.videoDownloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[34px] px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Bajar MP4
                    </a>
                  )}
                </div>

                {/* REPRODUCTOR HTML5 EN VIVO */}
                {inspectedBlock.mainAction.videoDownloadUrl && (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    src={inspectedBlock.mainAction.videoDownloadUrl}
                    className="w-full max-h-48 rounded-xl bg-black border border-slate-300"
                  />
                )}
              </div>

              {/* 2. SUBPRODUCTO PORTADA OFICIAL DEL VIDEO */}
              {inspectedBlock.mainAction.assetPreview && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="relative w-16 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0 border border-slate-300">
                    <Image
                      src={inspectedBlock.mainAction.assetPreview.url}
                      alt={inspectedBlock.mainAction.assetPreview.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono font-black text-slate-500 uppercase">
                      Subproducto 2: Portada HD
                    </div>
                    <div className="text-xs font-black text-slate-900 truncate">
                      {inspectedBlock.mainAction.assetPreview.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      1080×1920 px · Calibrada para Reels y TikTok
                    </div>
                    <a
                      href={inspectedBlock.mainAction.assetPreview.downloadUrl}
                      download={inspectedBlock.mainAction.assetPreview.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation mt-1.5 inline-flex items-center gap-1 min-h-[30px] px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10.5px] rounded-lg shadow-xs"
                    >
                      <Download className="w-3 h-3" /> Bajar Portada
                    </a>
                  </div>
                </div>
              )}

              {/* 3. SUBPRODUCTO CARRUSEL (LÁMINAS HD) */}
              {inspectedBlock.carousel && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-black text-amber-700 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-600" />
                        <span>Subproducto 3: Carrusel ({inspectedBlock.carousel.slides.length} Láminas)</span>
                      </span>
                      <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                        {inspectedBlock.carousel.title}
                      </div>
                    </div>
                    {inspectedBlock.carousel.sheetUrl && (
                      <a
                        href={inspectedBlock.carousel.sheetUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg shrink-0 shadow-xs"
                      >
                        Hoja Completa
                      </a>
                    )}
                  </div>

                  {/* Galería horizontal deslizable con cada una de las láminas */}
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                    {inspectedBlock.carousel.slides.map((sl) => {
                      const slideUrl = `${inspectedBlock.carousel!.folderPath}/${sl.file}`;
                      return (
                        <div
                          key={sl.num}
                          className="w-24 shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 text-center space-y-1 shadow-xs"
                        >
                          <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <Image
                              src={slideUrl}
                              alt={`${sl.num} ${sl.name}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="text-[9px] font-black text-slate-800 truncate">
                            {sl.num}. {sl.name}
                          </div>
                          <a
                            href={slideUrl}
                            download={sl.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[26px] w-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[9px] font-black flex items-center justify-center gap-0.5"
                          >
                            <Download className="w-2.5 h-2.5" /> Bajar
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. SUBPRODUCTO STORIES 9:16 */}
              {inspectedBlock.stories.length > 0 && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-mono font-black text-purple-700 uppercase flex items-center gap-1">
                    <span>Subproducto 4: Stories 9:16 ({inspectedBlock.stories.length} Láminas)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {inspectedBlock.stories.map((st) => (
                      <div key={st.id} className="bg-white p-2 rounded-xl border border-slate-200 text-center space-y-1.5">
                        <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
                          <Image
                            src={st.url}
                            alt={st.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="text-[9.5px] font-black text-slate-800 truncate">
                          {st.title}
                        </div>
                        <a
                          href={st.url}
                          download={st.downloadName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[30px] w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Download className="w-3 h-3" /> Bajar Story
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. SUBPRODUCTO COPIES Y TEXTOS LISTOS */}
              {inspectedBlock.mainAction.copies && inspectedBlock.mainAction.copies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wide">
                      Subproducto 5: Copies Listos para Publicar
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">1 toque para copiar</span>
                  </div>
                  {inspectedBlock.mainAction.copies.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleCopy(c.key, c.text)}
                      className="cursor-pointer touch-manipulation w-full min-h-[46px] px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-bold transition active:scale-[0.99]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate text-slate-900 font-black">{c.label}</div>
                        <div className="text-[10px] text-slate-500 truncate font-normal">
                          {c.text.slice(0, 55)}...
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-blue-700 font-black shrink-0 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {copiedKey === c.key ? "¡COPIADO!" : "COPIAR"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* ACCIONES VINCULADAS (WHATSAPP / GRUPOS) */}
              {inspectedBlock.associatedActions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Difusión en Grupos & WhatsApp:
                  </span>
                  {inspectedBlock.associatedActions.map((a) => {
                    const done = !!completedMap[a.id];
                    return (
                      <div
                        key={a.id}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span className={`text-xs truncate ${done ? "line-through text-slate-400" : "text-slate-900 font-bold"}`}>
                          {a.time} · {a.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {a.copies && a.copies[0]?.waShare && (
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(a.copies[0].text)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer touch-manipulation min-h-[34px] px-2.5 bg-[#25D366] text-white text-[11px] font-black rounded-lg flex items-center gap-1"
                            >
                              WA
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleTask(a.id)}
                            className={`cursor-pointer touch-manipulation min-h-[34px] px-3 rounded-lg text-xs font-black ${
                              done ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-800"
                            }`}
                          >
                            {done ? "✓" : "Marcar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL COTIZACIONES                                       */}
      {/* ======================================================== */}
      {showQuotesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Cotizaciones Tutorías (1 Toque)
              </h3>
              <button
                type="button"
                onClick={() => setShowQuotesModal(false)}
                className="p-1 rounded-full bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 space-y-2 overflow-y-auto text-xs">
              {quotesWa.map((q) => (
                <div key={q.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="font-black text-slate-900">{q.name} · <span className="text-emerald-700 font-mono">{q.price}</span></div>
                    <div className="text-[10px] text-slate-500">{q.sub}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(q.key, q.message)}
                      className="cursor-pointer touch-manipulation min-h-[38px] bg-white border border-slate-300 text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100"
                    >
                      {copiedKey === q.key ? "¡Copiado!" : "Copiar"}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(q.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[38px] bg-[#25D366] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      Abrir WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SYNC                                               */}
      {/* ======================================================== */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                Sincronía Mac ↔ Celular
              </h3>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-full bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Copia tu enlace con hash <code className="bg-slate-100 text-emerald-800 px-1 rounded font-mono font-bold">#s=</code> para abrir en tu celular sin perder los tickets hechos.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySyncLink}
                className="cursor-pointer touch-manipulation min-h-[42px] bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar #s=
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🔄 Grilla TPI: ${buildCurrentSyncUrl()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[42px] bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" /> A mi WA
              </a>
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={manualSyncInput}
                onChange={(e) => setManualSyncInput(e.target.value)}
                placeholder="Pega token #s=v1..."
                className="flex-1 min-h-[38px] rounded-xl bg-slate-50 border border-slate-300 px-2.5 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleImportManualSync}
                className="cursor-pointer touch-manipulation min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 rounded-xl shadow-xs"
              >
                Unir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONFIRMACIÓN */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl border border-slate-700 whitespace-nowrap animate-in fade-in"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
