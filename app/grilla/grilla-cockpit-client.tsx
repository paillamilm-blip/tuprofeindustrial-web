"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Award,
  Download,
  Film,
  ExternalLink,
  MessageCircle,
  FileText,
  RefreshCw,
  Share2,
  Lock,
  ShieldAlert,
  Layers,
  FolderOpen,
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
const SERVER_TIME_KEY = "2026-11-26|0635|06:35";

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
  timeSlot: string; // "12:30", "17:30", "21:15"
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
  quickApps,
  quotesWa,
  convocatoriasBase,
  superprofUrl,
  formularioMaestroPdf,
  simulacroM1Pdf,
  syncedData,
  isPinProtected,
}: GrillaCockpitClientProps) {
  const [activeTab, setActiveTab] = useState<"dia" | "semana" | "productos" | "proyectos">("dia");
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Bloque seleccionado manualmente (o null para derivar del primer bloque activo)
  const [selectedVideoBlockId, setSelectedVideoBlockId] = useState<string | null>(null);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [manualSyncInput, setManualSyncInput] = useState("");
  const [showPinHint, setShowPinHint] = useState(false);

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
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Auto-sync de #s= o ?sync=
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
      // Ignorar si localStorage falla
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
            ? `🔄 Sincronizadas +${importedCount} acciones realizadas`
            : "🔄 Grilla al día con tu sincronización"
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
      showToast(nextState ? "✅ Marcado con ticket (Subido)" : "↺ Devuelto a pendiente");
    } catch {
      // Ignorar si localStorage falla
    }
  };

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyTextSafe(text);
    setCopiedKey(key);
    showToast(ok ? "📋 ¡Copiado al portapapeles!" : "⚠️ Selecciona el texto");
    setTimeout(() => setCopiedKey(null), 2200);
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
    showToast(ok ? "📤 Enlace #s= copiado para tu celular o Mac" : "⚠️ Error al copiar");
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
    setShowSyncPanel(false);
    showToast(`🔄 +${addedCount} tareas actualizadas correctamente`);
  };

  const currentDayData = daysData[selectedDay];
  const dayTasks = currentDayData.actions;

  // Clasificación de urgencia según la hora en Santiago
  const isTaskUrgent = (task: ActionItem): boolean => {
    if (completedMap[task.id]) return false;
    if (currentDayData.isoDate < santiagoNow.isoDate) return true;
    if (currentDayData.isoDate > santiagoNow.isoDate) return false;
    return task.minutesFromMidnight <= santiagoNow.minutes + 45;
  };

  // Agrupación en 3 Bloques Maestros centrados en cada VIDEO
  const videoBlocks = useMemo<VideoBlock[]>(() => {
    const videoActions = dayTasks.filter((a) => a.category === "video");

    return videoActions.map((vAction) => {
      let timeSlot = "12:30";
      if (vAction.time.includes("17") || vAction.time.includes("18")) timeSlot = "17:30";
      if (vAction.time.includes("20") || vAction.time.includes("21")) timeSlot = "21:15";

      // Acciones asociadas a este turno (stories, grupos FB, WhatsApp)
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

  // Derivación directa sin setState dentro de useEffect
  const effectiveOpenBlockId = useMemo(() => {
    if (selectedVideoBlockId !== null) return selectedVideoBlockId;
    const urgentBlock = videoBlocks.find((b) =>
      b.allActions.some((a) => !completedMap[a.id] && isTaskUrgent(a))
    );
    const pendingBlock = videoBlocks.find((b) =>
      b.allActions.some((a) => !completedMap[a.id])
    );
    return urgentBlock?.id ?? pendingBlock?.id ?? videoBlocks[0]?.id ?? null;
  }, [selectedVideoBlockId, videoBlocks, completedMap, isTaskUrgent]);

  const paesDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2026-11-30");

  // Bloque que viene más tarde hoy (cálculo directo en render)
  const upcomingBlock = videoBlocks.find((b) => {
    const done = b.allActions.every((a) => completedMap[a.id]);
    return !done && b.mainAction.minutesFromMidnight > santiagoNow.minutes;
  });

  // Estado semanal consolidado (para saber qué está listo, qué falta y qué está en alerta)
  const weekOverview = useMemo(() => {
    const allStored = readAllCompletedFromStorage(syncedData.completedBaseline);

    return [
      {
        day: "Lunes 23 Noviembre",
        iso: "2026-11-23",
        summary: "12:30 Simplificar (x+2)/2 · 17:30 1 m² a cm² · 21:15 ¿Por qué i²=-1?",
        status: "listo" as const,
        badge: "Listo (3/3 videos)",
        alert: false,
        actionsTotal: 8,
        actionsDone: 8,
      },
      {
        day: "Martes 24 Noviembre",
        iso: "2026-11-24",
        summary: "12:30 Olvido del ± · 17:30 Vértice f(x) · 21:15 El secreto de π",
        status: "listo" as const,
        badge: "Listo (3/3 videos)",
        alert: false,
        actionsTotal: 8,
        actionsDone: 8,
      },
      {
        day: "Miércoles 25 Noviembre",
        iso: "2026-11-25",
        summary: "12:30 Discriminante Δ · 17:30 Duplica Arista 3D · 21:15 Dividir por 0",
        status: (Object.values(allStored["mie25"] ?? {}).filter(Boolean).length === 8 ? "listo" : "proceso") as "listo" | "proceso",
        badge: `${Object.values(allStored["mie25"] ?? {}).filter(Boolean).length}/8 acciones`,
        alert: santiagoNow.isoDate > "2026-11-25" && Object.values(allStored["mie25"] ?? {}).filter(Boolean).length < 8,
        actionsTotal: 8,
        actionsDone: Object.values(allStored["mie25"] ?? {}).filter(Boolean).length,
        switchKey: "mie25" as DayKey,
      },
      {
        day: "Jueves 26 Noviembre",
        iso: "2026-11-26",
        summary: "12:30 Parábola-Recta · 17:30 Viète · 21:15 Euler + Formulario PDF",
        status: (Object.values(allStored["jue26"] ?? {}).filter(Boolean).length === 8 ? "listo" : "alerta") as "listo" | "alerta",
        badge: `${Object.values(allStored["jue26"] ?? {}).filter(Boolean).length}/8 acciones`,
        alert: santiagoNow.isoDate === "2026-11-26" && Object.values(allStored["jue26"] ?? {}).filter(Boolean).length < 8,
        actionsTotal: 8,
        actionsDone: Object.values(allStored["jue26"] ?? {}).filter(Boolean).length,
        switchKey: "jue26" as DayKey,
      },
      {
        day: "Viernes 27 Noviembre",
        iso: "2026-11-27",
        summary: "12:30 Inecuación trampa · 17:30 Ganancia máx · 21:15 Fractales",
        status: "falta" as const,
        badge: "Falta render en motor V2",
        alert: false,
        actionsTotal: 8,
        actionsDone: 0,
      },
      {
        day: "Sábado 28 Noviembre",
        iso: "2026-11-28",
        summary: "12:30 Intersección ejes · 17:30 Función Inversa · 21:15 Hilbert",
        status: "falta" as const,
        badge: "Falta render en motor V2",
        alert: false,
        actionsTotal: 8,
        actionsDone: 0,
      },
      {
        day: "Domingo 29 Noviembre",
        iso: "2026-11-29",
        summary: "12:30 10 Puntos Clave · 17:30 Ritual Calma · 21:15 Confianza PAES",
        status: "falta" as const,
        badge: "Víspera · Guiones pendientes",
        alert: false,
        actionsTotal: 8,
        actionsDone: 0,
      },
    ];
  }, [syncedData.completedBaseline, santiagoNow.isoDate]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-28 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* 1. TOPBAR MINIMALISTA Y LIMPIA */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h1 className="font-black text-sm tracking-tight text-slate-900 truncate">
              @tuprofeindustrial
            </h1>
            <span className="text-[11px] font-mono font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 shrink-0">
              {santiagoNow.timeStr} CLT
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSyncPanel((v) => !v)}
              className={`cursor-pointer touch-manipulation min-h-[34px] px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition ${
                showSyncPanel
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>

            {isPinProtected ? (
              <form action={lockGrillaAction}>
                <button
                  type="submit"
                  className="cursor-pointer touch-manipulation min-h-[34px] px-2 py-1 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowPinHint((v) => !v)}
                className="cursor-pointer touch-manipulation min-h-[34px] px-2 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                <span>Libre</span>
              </button>
            )}
          </div>
        </div>

        {/* Notificación si GRILLA_PIN no está configurado */}
        {!isPinProtected && showPinHint && (
          <div className="max-w-md mx-auto mt-2 rounded-xl bg-amber-50 border border-amber-300 p-2.5 text-[11px] text-amber-950">
            🔐 <strong>Protección con PIN:</strong> Configura <code className="bg-white px-1 rounded border">GRILLA_PIN=tu_clave</code> en Vercel para bloquear la grilla en tu celular.
          </div>
        )}

        {/* Panel desplegable de sincronización */}
        {showSyncPanel && (
          <div className="max-w-md mx-auto mt-2 rounded-2xl bg-slate-900 text-white p-3.5 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                Sincronía Celular ↔ Mac
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {syncedData.syncedAt.slice(5, 16).replace("T", " ")}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Manda tu avance a WhatsApp o copia el enlace <code className="bg-slate-800 px-1 rounded text-emerald-400 font-mono">#s=</code> para abrir en otro dispositivo sin perder ningún ticket.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySyncLink}
                className="cursor-pointer touch-manipulation min-h-[42px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> Copiar Enlace #s=
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔄 Grilla TPI (${currentDayData.shortLabel}) al día: ${buildCurrentSyncUrl()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[42px] bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Mandar a mi WA
              </a>
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={manualSyncInput}
                onChange={(e) => setManualSyncInput(e.target.value)}
                placeholder="Pega enlace #s=v1... de otro dispositivo"
                className="flex-1 min-h-[38px] rounded-lg bg-slate-800 border border-slate-700 px-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleImportManualSync}
                className="cursor-pointer touch-manipulation min-h-[38px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 rounded-lg"
              >
                Unir
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. SELECTOR DE VISTA MINIMALISTA (HOY / SEMANA / PRODUCTOS / PROYECTOS) */}
      <nav className="bg-white border-b border-slate-200 px-3 py-2 sticky top-[49px] z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
          {[
            { id: "dia" as const, label: "Hoy", sub: currentDayData.shortLabel },
            { id: "semana" as const, label: "Semana", sub: "23–29 Nov" },
            { id: "productos" as const, label: "Productos", sub: "PDF + 8L" },
            { id: "proyectos" as const, label: "Fondos", sub: `PAES ${paesDaysLeft}d` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer touch-manipulation min-h-[44px] py-1 text-xs font-black rounded-lg transition flex flex-col items-center justify-center ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9.5px] font-mono text-slate-500 font-bold">{tab.sub}</span>
            </button>
          ))}
        </div>

        {/* Interruptor de día rápido (Mié 25 / Jue 26) */}
        {activeTab === "dia" && (
          <div className="max-w-md mx-auto grid grid-cols-2 gap-1.5 mt-2">
            {DAY_KEYS.map((key) => {
              const d = daysData[key];
              const active = selectedDay === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDayOverride(key)}
                  className={`cursor-pointer touch-manipulation min-h-[38px] py-1 px-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{d.fullLabel}</span>
                  {d.isoDate === santiagoNow.isoDate && (
                    <span className="text-[9px] px-1 rounded font-mono bg-emerald-400 text-slate-950 font-black">
                      HOY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <main className="max-w-md mx-auto px-3.5 pt-3.5 space-y-3.5">
        {/* ======================================================== */}
        {/* VISTA 1: HOY / CRONOGRAMA POR VIDEO                      */}
        {/* ======================================================== */}
        {activeTab === "dia" && (
          <>
            {/* TIRA DE ESTADO RÁPIDO: SEMÁFORO Y QUÉ VIENE MÁS TARDE */}
            <section className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Avance {currentDayData.fullLabel}
                  </div>
                  <div className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>{completedCount} de {dayTasks.length} acciones</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    🟢 {completedCount}
                  </span>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    🟡 {procesoTasks.length}
                  </span>
                  {alertaTasks.length > 0 && (
                    <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      🔴 {alertaTasks.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* QUÉ VIENE MÁS TARDE */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    {upcomingBlock ? "⏰ Viene más tarde:" : "🏁 Estado del día:"}
                  </span>
                  <span className="font-extrabold text-slate-800 truncate block">
                    {upcomingBlock
                      ? `${upcomingBlock.timeSlot} hrs · ${upcomingBlock.title.replace(/^Video.*?: /, "")}`
                      : isAllDone
                      ? "¡Día 100% completado!"
                      : "Todas las horas de hoy ya transcurrieron"}
                  </span>
                </div>
                {upcomingBlock && (
                  <button
                    type="button"
                    onClick={() => setSelectedVideoBlockId(upcomingBlock.id)}
                    className="cursor-pointer touch-manipulation text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg shrink-0"
                  >
                    Ver bloque →
                  </button>
                )}
              </div>
            </section>

            {/* LISTA DE VIDEOS DEL DÍA CON GAVETA DE EMERGENCIA AL APRETAR */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-slate-900" />
                  Videos y Acciones del Día (3 Bloques)
                </h2>
                <span className="text-[10.5px] text-slate-500">
                  Toca el video para abrir todos sus productos
                </span>
              </div>

              {videoBlocks.map((block) => {
                const isOpen = effectiveOpenBlockId === block.id;
                const isVideoDone = !!completedMap[block.mainAction.id];
                const blockDoneCount = block.allActions.filter((a) => completedMap[a.id]).length;
                const isBlockFullyDone = blockDoneCount === block.allActions.length;
                const hasAlert = block.allActions.some((a) => isTaskUrgent(a));

                return (
                  <div
                    key={block.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isBlockFullyDone
                        ? "bg-slate-50/80 border-slate-300 opacity-80"
                        : hasAlert
                        ? "bg-red-50/40 border-red-400 shadow-xs"
                        : "bg-white border-slate-300 shadow-xs"
                    }`}
                  >
                    {/* CABECERA DEL BLOQUE: AL APRETAR EL NOMBRE SE ABRE TODO EL PACK DE EMERGENCIA */}
                    <div className="p-3.5 flex items-start justify-between gap-3 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVideoBlockId(isOpen ? "" : block.id)
                        }
                        className="cursor-pointer touch-manipulation flex-1 min-w-0 text-left flex items-start gap-2.5"
                      >
                        <div className="shrink-0 mt-0.5">
                          <span
                            className={`inline-flex items-center justify-center font-mono font-black text-xs px-2 py-1 rounded-lg ${
                              hasAlert
                                ? "bg-red-600 text-white"
                                : isBlockFullyDone
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-900 text-white"
                            }`}
                          >
                            {block.timeSlot}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900 leading-snug">
                              {block.title}
                            </span>
                            {hasAlert && !isBlockFullyDone && (
                              <span className="text-[10px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                EN ALERTA
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                            {block.topic}
                          </div>

                          <div className="text-[10.5px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                            <span>
                              {isBlockFullyDone
                                ? "🟢 Bloque 100% listo"
                                : `Progreso: ${blockDoneCount}/${block.allActions.length} acciones`}
                            </span>
                            <span className="text-blue-700 font-bold underline flex items-center gap-0.5">
                              {isOpen ? "Cerrar pack" : "Ver todo a mano"}
                              {isOpen ? (
                                <ChevronUp className="w-3 h-3 inline" />
                              ) : (
                                <ChevronDown className="w-3 h-3 inline" />
                              )}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Ticket rápido de estado del video principal */}
                      <button
                        type="button"
                        onClick={() => toggleTask(block.mainAction.id)}
                        aria-label={`Ticket ${block.title}`}
                        className={`cursor-pointer touch-manipulation shrink-0 min-h-[44px] px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 transition active:scale-95 ${
                          isVideoDone
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "bg-white border-slate-300 hover:border-emerald-500 text-slate-800"
                        }`}
                      >
                        {isVideoDone ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Listo</span>
                          </>
                        ) : (
                          <span>Marcar Video</span>
                        )}
                      </button>
                    </div>

                    {/* GAVETA DE EMERGENCIA: APARECEN TODOS LOS PRODUCTOS DE ESTE VIDEO */}
                    {isOpen && (
                      <div className="border-t border-slate-200 bg-slate-50 p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-4 h-4 text-slate-900" />
                            Pack completo de emergencia ({block.timeSlot} hrs)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Descargas y copies directos
                          </span>
                        </div>

                        {/* 1. DESCARGA DEL VIDEO MP4 + PORTADA */}
                        {block.mainAction.videoDownloadUrl && (
                          <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-blue-600" />
                                <span className="truncate">Video Vertical 9:16</span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                {block.mainAction.videoLabel || "Formato Reels / TikTok"}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={block.mainAction.videoDownloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer touch-manipulation min-h-[40px] text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Bajar MP4
                              </a>
                              {block.mainAction.assetPreview && (
                                <a
                                  href={block.mainAction.assetPreview.downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer touch-manipulation min-h-[40px] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 rounded-lg flex items-center gap-1"
                                >
                                  Portada
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. COPIES DEL VIDEO (INSTAGRAM / TIKTOK / PRIMER COMENTARIO) */}
                        {block.mainAction.copies && block.mainAction.copies.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                              Textos y Copies Listos para Copiar:
                            </div>
                            {block.mainAction.copies.map((copy) => (
                              <button
                                key={copy.key}
                                type="button"
                                onClick={() => handleCopy(copy.key, copy.text)}
                                className={`cursor-pointer touch-manipulation w-full min-h-[44px] text-xs font-extrabold px-3 py-2.5 rounded-xl border flex items-center justify-between transition active:scale-[0.99] ${
                                  copy.tone === "primary"
                                    ? "bg-red-50 border-red-200 text-red-900 hover:bg-red-100"
                                    : copy.tone === "green"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100"
                                }`}
                              >
                                <span className="text-left truncate mr-2">{copy.label}</span>
                                <span className="shrink-0 text-[11px] font-black font-mono">
                                  {copiedKey === copy.key ? "¡COPIADO!" : "COPIAR"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 3. HISTORIAS / STORIES VINCULADAS */}
                        {block.stories.length > 0 && (
                          <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <span>📸 Historias 9:16 (Meta 35% Safe-Zone)</span>
                              <span className="text-[10px] text-purple-700 font-mono">
                                ({block.stories.length} láminas)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {block.stories.map((st) => (
                                <div
                                  key={st.id}
                                  className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col items-center text-center gap-1"
                                >
                                  <a
                                    href={st.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                  >
                                    <Image
                                      src={st.url}
                                      alt={st.title}
                                      width={100}
                                      height={160}
                                      unoptimized
                                      className="w-full h-28 object-cover rounded border border-slate-300"
                                    />
                                  </a>
                                  <div className="text-[10.5px] font-extrabold text-slate-800 truncate w-full">
                                    {st.title}
                                  </div>
                                  <a
                                    href={st.url}
                                    download={st.downloadName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer touch-manipulation min-h-[36px] w-full text-[11px] font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md flex items-center justify-center gap-1"
                                  >
                                    <Download className="w-3 h-3" /> Bajar
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. CARRUSEL HD (SI CORRESPONDE A ESTE TURNO) */}
                        {block.carousel && (
                          <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs font-black text-slate-900">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-blue-600" />
                                Carrusel {block.carousel.title}
                              </span>
                              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                {block.carousel.slides.length} láminas
                              </span>
                            </div>
                            {block.carousel.sheetUrl && (
                              <a
                                href={block.carousel.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="cursor-pointer touch-manipulation min-h-[40px] w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between"
                              >
                                <span>👁️ Hoja Completa de Carrusel</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* 5. ACCIONES ASOCIADAS (POST EN FACEBOOK Y DIFUSIÓN WHATSAPP) CON TICKETS */}
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                            Acciones y Mensajes de Difusión ({block.associatedActions.length}):
                          </div>
                          {block.associatedActions.map((action) => {
                            const isActionDone = !!completedMap[action.id];
                            return (
                              <div
                                key={action.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
                                  isActionDone
                                    ? "bg-slate-100 border-slate-200 opacity-70"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold text-slate-500">
                                      {action.time}
                                    </span>
                                    <span
                                      className={`text-xs font-bold truncate ${
                                        isActionDone ? "line-through text-slate-400" : "text-slate-900"
                                      }`}
                                    >
                                      {action.title}
                                    </span>
                                  </div>

                                  {action.copies && action.copies[0] && (
                                    <div className="flex gap-1.5 mt-1.5">
                                      {action.copies[0].waShare && (
                                        <a
                                          href={`https://wa.me/?text=${encodeURIComponent(
                                            action.copies[0].text
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="cursor-pointer touch-manipulation min-h-[38px] bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" /> Abrir WA
                                        </a>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(action.copies![0].key, action.copies![0].text)
                                        }
                                        className="cursor-pointer touch-manipulation min-h-[38px] text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg"
                                      >
                                        {copiedKey === action.copies[0].key ? "Copiado" : "Copiar texto"}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Botón ticket individual */}
                                <button
                                  type="button"
                                  onClick={() => toggleTask(action.id)}
                                  className={`cursor-pointer touch-manipulation shrink-0 min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-black border flex items-center gap-1 ${
                                    isActionDone
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "bg-white border-slate-300 hover:border-emerald-500 text-slate-700"
                                  }`}
                                >
                                  {isActionDone ? <Check className="w-4 h-4 stroke-[3]" /> : "Hacer"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            {/* RESPUESTAS RÁPIDAS PARA COTIZACIONES DE TUTORÍAS */}
            <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Cotizaciones de Tutorías (1 Toque)
                </h3>
              </div>
              <div className="space-y-1.5">
                {quotesWa.map((q) => (
                  <div
                    key={q.key}
                    className={`p-2.5 rounded-xl flex items-center justify-between gap-2 border ${
                      q.featured ? "bg-emerald-50/50 border-emerald-400" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {q.name} · <span className="font-mono font-black text-emerald-700">{q.price}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{q.sub}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(q.key, q.message)}
                        className="cursor-pointer touch-manipulation min-h-[38px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold"
                      >
                        {copiedKey === q.key ? "¡Listo!" : "Copiar"}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(q.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation min-h-[38px] px-2.5 py-1 rounded-lg bg-[#25D366] text-white text-xs font-black flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WA
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: SEMANA COMPLETA (SABER QUÉ ESTÁ LISTO O FALTA)   */}
        {/* ======================================================== */}
        {activeTab === "semana" && (
          <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Estado Semanal de Campaña (23–29 Nov)
                </h2>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Semana Crítica PAES
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Semáforo para saber qué día está listo, qué tiene alerta y qué falta renderizar en el motor.
              </p>
            </div>

            <div className="space-y-2">
              {weekOverview.map((item) => {
                const isToday = item.iso === santiagoNow.isoDate;
                return (
                  <div
                    key={item.iso}
                    className={`p-3 rounded-xl border transition ${
                      isToday
                        ? "border-2 border-red-500 bg-red-50/30"
                        : item.alert
                        ? "border-red-300 bg-red-50/20"
                        : item.status === "listo"
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {item.status === "listo" ? "🟢" : item.alert ? "🔴" : "🟡"}
                        {item.day} {isToday && "(HOY)"}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          item.status === "listo"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.alert
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      • {item.summary}
                    </p>

                    {item.switchKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setDayOverride(item.switchKey!);
                          setActiveTab("dia");
                        }}
                        className="cursor-pointer touch-manipulation min-h-[38px] mt-2 w-full text-xs font-black text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg py-1 flex items-center justify-center gap-1 shadow-xs"
                      >
                        Abrir programación {item.day} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: PRODUCTOS DIRECTOS (PDFs + RECURSOS)            */}
        {/* ======================================================== */}
        {activeTab === "productos" && (
          <section className="space-y-3">
            <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-blue-950 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Formulario Maestro de Ingeniería (PDF)</span>
                </div>
                <div className="text-[11px] text-blue-800 mt-0.5">
                  Cuadrática, Discriminante, Viète y Geometría 3D · 208 KB
                </div>
              </div>
              <a
                href={formularioMaestroPdf}
                target="_blank"
                rel="noopener noreferrer"
                download="formulario_maestro_ingenieria.pdf"
                className="cursor-pointer touch-manipulation min-h-[44px] shrink-0 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" /> Bajar
              </a>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-emerald-950">
                  📄 Simulacro PAES M1 con Solucionario (PDF)
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  20 ejercicios resueltos paso a paso · Sin calculadora
                </div>
              </div>
              <a
                href={simulacroM1Pdf}
                target="_blank"
                rel="noopener noreferrer"
                download="simulacro-paes-m1.pdf"
                className="cursor-pointer touch-manipulation min-h-[44px] shrink-0 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" /> Bajar
              </a>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="font-extrabold text-slate-900">🚀 Redes del proyecto:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {quickApps.map((app) => (
                  <a
                    key={app.label}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer touch-manipulation min-h-[42px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center transition"
                  >
                    {app.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 4: RADAR DE FONDOS CONCURSABLES                    */}
        {/* ======================================================== */}
        {activeTab === "proyectos" && (
          <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Radar de Fondos y Proyectos 2026-2027
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Días que faltan para postular según la fecha de Santiago.
              </p>
            </div>

            <div className="space-y-2">
              {convocatoriasBase.map((c, i) => {
                const dias = diffDaysFromIso(santiagoNow.isoDate, c.fechaIso);
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      c.estado === "alerta" ? "bg-red-50/50 border-red-300" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="text-xs font-black text-slate-900">{c.nombre}</div>
                        <div className="text-[10px] text-slate-500">{c.entidad}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-black font-mono ${
                            c.estado === "alerta" ? "text-red-700" : "text-emerald-700"
                          }`}
                        >
                          {dias} DÍAS
                        </div>
                        <div className="text-[9.5px] font-mono text-slate-400">{c.fechaLabel}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded-lg border border-slate-200">
                      🎯 {c.accion}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="pt-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/"
              className="cursor-pointer touch-manipulation min-h-[44px] bg-white hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              🌐 Ver Landing Web
            </Link>
            <a
              href={superprofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer touch-manipulation min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-800 py-2.5 px-3 rounded-xl border border-amber-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              ⭐ Superprof 5.0 <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500">
            TuProfeIndustrial · Cockpit Operativo · Santiago de Chile
          </div>
        </footer>
      </main>

      {/* TOAST CONFIRMACIÓN TÁCTIL */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
