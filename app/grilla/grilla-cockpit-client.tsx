"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  ChevronDown,
  Download,
  MessageCircle,
  FileText,
  RefreshCw,
  Share2,
  Lock,
  X,
  Calendar,
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
const SERVER_TIME_KEY = "2026-11-26|0710|07:10";

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
  convocatoriasBase,
  formularioMaestroPdf,
  simulacroM1Pdf,
  syncedData,
  isPinProtected,
}: GrillaCockpitClientProps) {
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modales ligeros para mantener la pantalla principal en 1 sola vista exacta sin scroll
  const [inspectBlockId, setInspectBlockId] = useState<string | null>(null);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [manualSyncInput, setManualSyncInput] = useState("");

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
            : "🔄 Grilla al día con tu Mac"
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
      showToast(nextState ? "✅ Subido / Listo" : "↺ Devuelto a pendiente");
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

  const nextPriorityAction = alertaTasks[0] ?? procesoTasks[0] ?? null;
  const paesDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2026-11-30");

  const inspectedBlock = useMemo(() => {
    return videoBlocks.find((b) => b.id === inspectBlockId) ?? null;
  }, [videoBlocks, inspectBlockId]);

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-slate-900 text-slate-100 font-sans flex flex-col justify-between overflow-hidden antialiased select-none p-3">
      {/* 1. CABECERA PANORÁMICA DE DECISIÓN (MINIMALISTA) */}
      <header className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs font-black tracking-tight text-white leading-none truncate">
              @tuprofeindustrial
            </h1>
            <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">
              {santiagoNow.timeStr} CLT · PAES {paesDaysLeft}d
            </span>
          </div>
        </div>

        {/* SELECTOR DE DÍA RÁPIDO */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
          {DAY_KEYS.map((key) => {
            const active = selectedDay === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDayOverride(key)}
                className={`cursor-pointer touch-manipulation px-2 py-1 rounded-md text-[11px] font-black transition ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {daysData[key].shortLabel}
              </button>
            );
          })}
        </div>

        {/* ACCESO A SYNC Y PRIVACIDAD */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="cursor-pointer touch-manipulation min-h-[30px] px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-black flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
          {isPinProtected && (
            <form action={lockGrillaAction}>
              <button
                type="submit"
                className="cursor-pointer touch-manipulation min-h-[30px] p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </header>

      {/* 2. SEMÁFORO DE DIAGNÓSTICO EN 1 LÍNEA (QUÉ TIENES Y QUÉ FALTA) */}
      <section className="bg-slate-800/90 rounded-2xl p-2.5 border border-slate-700/80 shrink-0 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">
              {completedCount}/{dayTasks.length} Listas
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded">
              {progressPercent}%
            </span>
          </div>

          {/* 3 INDICADORES DIRECTOS DEL SEMÁFORO */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              🟢 {completedCount}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              🟡 {procesoTasks.length}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                alertaTasks.length > 0
                  ? "bg-red-500/30 text-red-300 border-red-500 animate-pulse font-black"
                  : "bg-slate-700/40 text-slate-500 border-slate-700"
              }`}
            >
              🔴 {alertaTasks.length}
            </span>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isAllDone ? "bg-emerald-400" : alertaTasks.length > 0 ? "bg-red-500" : "bg-amber-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 3. TARJETA DE ACCIÓN TÁCTICA: LO QUE TIENES QUE HACER AHORA MISMO */}
      {isAllDone ? (
        <section className="bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-3 shrink-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wide">
              🟢 DÍA 100% COMPLETADO
            </div>
            <div className="text-xs font-bold text-slate-200 truncate">
              Todos los videos y acciones de hoy están arriba.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWeekModal(true)}
            className="cursor-pointer touch-manipulation min-h-[38px] px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shrink-0"
          >
            Ver Semana →
          </button>
        </section>
      ) : nextPriorityAction ? (
        <section
          className={`rounded-2xl p-3 border-2 shrink-0 space-y-1.5 shadow-md ${
            isTaskUrgent(nextPriorityAction)
              ? "bg-red-950/60 border-red-500 ring-2 ring-red-500/30"
              : "bg-amber-950/50 border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                isTaskUrgent(nextPriorityAction)
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-amber-400 text-slate-950"
              }`}
            >
              {isTaskUrgent(nextPriorityAction) ? "🚨 ACCIÓN URGENTE AHORA" : "👉 SIGUIENTE ACCIÓN"}
            </span>
            <span className="font-mono font-black text-xs text-white bg-black/40 px-2 py-0.5 rounded">
              {nextPriorityAction.time} HRS
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white truncate leading-tight">
                {nextPriorityAction.title}
              </div>
              <div className="text-[10.5px] text-slate-300 truncate">
                {nextPriorityAction.detail}
              </div>
            </div>

            {/* BOTÓN RÁPIDO DE TICKET */}
            <button
              type="button"
              onClick={() => toggleTask(nextPriorityAction.id)}
              className="cursor-pointer touch-manipulation min-h-[42px] px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow-xs active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Listo</span>
            </button>
          </div>

          {/* BOTONES DE EMERGENCIA EN 1 LÍNEA */}
          <div className="flex gap-1.5 pt-0.5">
            {nextPriorityAction.videoDownloadUrl && (
              <a
                href={nextPriorityAction.videoDownloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[36px] flex-1 bg-white text-slate-950 hover:bg-slate-200 text-[11px] font-black rounded-lg flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> Bajar MP4
              </a>
            )}
            {nextPriorityAction.copies && nextPriorityAction.copies[0] && (
              <>
                {nextPriorityAction.copies[0].waShare && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(nextPriorityAction.copies[0].text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer touch-manipulation min-h-[36px] flex-1 bg-[#25D366] text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WA
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(nextPriorityAction.copies![0].key, nextPriorityAction.copies![0].text)}
                  className="cursor-pointer touch-manipulation min-h-[36px] flex-1 bg-slate-800 text-slate-100 hover:bg-slate-700 text-[11px] font-black rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === nextPriorityAction.copies[0].key ? "Copiado" : "Copy"}</span>
                </button>
              </>
            )}
          </div>
        </section>
      ) : null}

      {/* 4. LOS 3 VIDEOS DEL DÍA (EN EXACTAMENTE 3 FILAS COMPACTAS, 0 SCROLL) */}
      <section className="space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-0.5">
          <span>VIDEOS DE HOY ({videoBlocks.length})</span>
          <span>Toca el video para ver todo el kit</span>
        </div>

        <div className="space-y-1.5">
          {videoBlocks.map((block) => {
            const isVideoDone = !!completedMap[block.mainAction.id];
            const blockDoneCount = block.allActions.filter((a) => completedMap[a.id]).length;
            const isBlockFullyDone = blockDoneCount === block.allActions.length;
            const hasAlert = block.allActions.some((a) => isTaskUrgent(a));

            return (
              <div
                key={block.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                  isBlockFullyDone
                    ? "bg-slate-800/40 border-slate-700 opacity-60"
                    : hasAlert
                    ? "bg-red-950/40 border-red-500 shadow-sm"
                    : "bg-slate-800 border-slate-700"
                }`}
              >
                {/* Tocar el nombre abre la gaveta modal de emergencia con todo */}
                <button
                  type="button"
                  onClick={() => setInspectBlockId(block.id)}
                  className="cursor-pointer touch-manipulation min-w-0 flex-1 text-left flex items-center gap-2"
                >
                  <span
                    className={`font-mono font-black text-xs px-2 py-1 rounded-md shrink-0 ${
                      hasAlert && !isBlockFullyDone
                        ? "bg-red-600 text-white animate-pulse"
                        : isBlockFullyDone
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {block.timeSlot}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white truncate leading-tight flex items-center gap-1">
                      <span>{block.title.replace(/^Video.*?: /, "")}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{isBlockFullyDone ? "🟢 100% Hecho" : `${blockDoneCount}/${block.allActions.length} listos`}</span>
                      {block.carousel && <span className="text-blue-400">· Carrusel</span>}
                      {block.stories.length > 0 && <span className="text-purple-400">· Stories</span>}
                    </div>
                  </div>
                </button>

                {/* Botón ticket del video */}
                <button
                  type="button"
                  onClick={() => toggleTask(block.mainAction.id)}
                  className={`cursor-pointer touch-manipulation min-h-[40px] px-3 rounded-xl text-xs font-black border flex items-center gap-1 shrink-0 transition active:scale-95 ${
                    isVideoDone
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black"
                      : "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                  }`}
                >
                  {isVideoDone ? <Check className="w-4 h-4 stroke-[3]" /> : "Marcar"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BARRA INFERIOR DE DECISIÓN RÁPIDA (SEMANA / COTIZACIONES / FORMULARIO) */}
      <footer className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setShowWeekModal(true)}
          className="cursor-pointer touch-manipulation min-h-[44px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black text-slate-200 flex items-center justify-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Semana</span>
        </button>

        <button
          type="button"
          onClick={() => setShowQuotesModal(true)}
          className="cursor-pointer touch-manipulation min-h-[44px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black text-slate-200 flex items-center justify-center gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cotizar WA</span>
        </button>

        <a
          href={formularioMaestroPdf}
          target="_blank"
          rel="noopener noreferrer"
          download="formulario_maestro_ingenieria.pdf"
          className="cursor-pointer touch-manipulation min-h-[44px] bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 shadow-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF Form</span>
        </a>
      </footer>

      {/* ======================================================== */}
      {/* MODAL GAVETA DE EMERGENCIA (AL TOCAR CUALQUIER VIDEO)    */}
      {/* ======================================================== */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header modal */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/80">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-black text-emerald-400 uppercase">
                  {inspectedBlock.timeSlot} HRS · PACK COMPLETO
                </span>
                <h3 className="text-xs font-black text-white truncate">
                  {inspectedBlock.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectBlockId(null)}
                className="p-1 rounded-full bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable solo dentro del modal si es necesario */}
            <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
              {/* VIDEO Y PORTADA */}
              <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <div className="font-black text-white">Video MP4 9:16</div>
                  <div className="text-[10px] text-slate-400">Reels / TikTok</div>
                </div>
                {inspectedBlock.mainAction.videoDownloadUrl && (
                  <a
                    href={inspectedBlock.mainAction.videoDownloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer touch-manipulation min-h-[38px] px-3 bg-white text-slate-950 font-black text-xs rounded-lg flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" /> Bajar MP4
                  </a>
                )}
              </div>

              {/* COPIES */}
              {inspectedBlock.mainAction.copies && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Copies del Video:</span>
                  {inspectedBlock.mainAction.copies.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleCopy(c.key, c.text)}
                      className="cursor-pointer touch-manipulation w-full min-h-[42px] px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center justify-between text-xs font-bold"
                    >
                      <span className="truncate mr-2">{c.label}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-black shrink-0">
                        {copiedKey === c.key ? "¡COPIADO!" : "COPIAR"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* HISTORIAS */}
              {inspectedBlock.stories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">
                    Stories 9:16 ({inspectedBlock.stories.length} láminas):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {inspectedBlock.stories.map((st) => (
                      <div key={st.id} className="bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-center space-y-1">
                        <Image
                          src={st.url}
                          alt={st.title}
                          width={90}
                          height={140}
                          unoptimized
                          className="w-full h-24 object-cover rounded-lg border border-slate-600"
                        />
                        <a
                          href={st.url}
                          download={st.downloadName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[32px] w-full bg-purple-600/30 text-purple-200 border border-purple-500/40 rounded-lg text-[10.5px] font-black flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Bajar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCIONES VINCULADAS */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Grupos y WhatsApp:</span>
                {inspectedBlock.associatedActions.map((a) => {
                  const done = !!completedMap[a.id];
                  return (
                    <div key={a.id} className="p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${done ? "line-through text-slate-500" : "text-white font-bold"}`}>
                        {a.time} · {a.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {a.copies && a.copies[0]?.waShare && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(a.copies[0].text)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[34px] px-2 bg-[#25D366] text-white text-[11px] font-black rounded-lg flex items-center gap-1"
                          >
                            WA
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleTask(a.id)}
                          className={`cursor-pointer touch-manipulation min-h-[34px] px-2.5 rounded-lg text-xs font-black ${
                            done ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                          }`}
                        >
                          {done ? "✓" : "Hacer"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SEMANA (ESTADO SEMANAL COMPLETO)                    */}
      {/* ======================================================== */}
      {showWeekModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/80">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                Semana 23–29 Noviembre
              </h3>
              <button
                type="button"
                onClick={() => setShowWeekModal(false)}
                className="p-1 rounded-full bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 space-y-2 overflow-y-auto text-xs">
              {[
                { day: "Lunes 23 Nov", status: "🟢 Listo (3/3 videos)", desc: "Simplificar · 1m² a cm² · i²=-1" },
                { day: "Martes 24 Nov", status: "🟢 Listo (3/3 videos)", desc: "Olvido del ± · Vértice · Secreto π" },
                { day: "Miércoles 25 Nov", status: "🟢 Operativo", desc: "Discriminante · Arista 3D · Dividir por 0", key: "mie25" as DayKey },
                { day: "Jueves 26 Nov", status: "🔴 Hoy Crítico", desc: "Parábola · Viète · Euler + Formulario", key: "jue26" as DayKey },
                { day: "Viernes 27 Nov", status: "🟡 Falta Render V2", desc: "Inecuaciones · Ganancia máx · Fractales" },
                { day: "Sábado 28 Nov", status: "🟡 Falta Render V2", desc: "Intersección ejes · Inversa · Hilbert" },
                { day: "Domingo 29 Nov", status: "🟡 Víspera PAES", desc: "10 Puntos Clave · Calma · Confianza" },
              ].map((row) => (
                <div key={row.day} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white">{row.day}</div>
                    <div className="text-[10px] text-slate-400 truncate">{row.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block">{row.status}</span>
                    {row.key && (
                      <button
                        type="button"
                        onClick={() => {
                          setDayOverride(row.key!);
                          setShowWeekModal(false);
                        }}
                        className="text-[10.5px] text-blue-400 underline font-bold mt-0.5"
                      >
                        Abrir turno →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL COTIZACIONES WHATSAPP (1 TOQUE)                    */}
      {/* ======================================================== */}
      {showQuotesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/80">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Cotizaciones Rápidas Tutorías
              </h3>
              <button
                type="button"
                onClick={() => setShowQuotesModal(false)}
                className="p-1 rounded-full bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 space-y-2 overflow-y-auto text-xs">
              {quotesWa.map((q) => (
                <div key={q.key} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div>
                    <div className="font-black text-white">{q.name} · <span className="text-emerald-400">{q.price}</span></div>
                    <div className="text-[10px] text-slate-400">{q.sub}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(q.key, q.message)}
                      className="cursor-pointer touch-manipulation min-h-[38px] bg-slate-700 text-white font-bold rounded-lg text-xs"
                    >
                      {copiedKey === q.key ? "¡Copiado!" : "Copiar"}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(q.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[38px] bg-[#25D366] text-white font-black rounded-lg text-xs flex items-center justify-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-400" />
                Sincronía Mac ↔ Celular
              </h3>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Copia tu enlace con hash <code className="bg-slate-800 text-emerald-400 px-1 rounded font-mono">#s=</code> para abrir en cualquier otro dispositivo sin perder los tickets hechos.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySyncLink}
                className="cursor-pointer touch-manipulation min-h-[42px] bg-blue-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar #s=
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🔄 Grilla TPI: ${buildCurrentSyncUrl()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[42px] bg-[#25D366] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1"
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
                className="flex-1 min-h-[38px] rounded-lg bg-slate-800 border border-slate-700 px-2.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleImportManualSync}
                className="cursor-pointer touch-manipulation min-h-[38px] bg-emerald-500 text-slate-950 font-black text-xs px-3 rounded-lg"
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
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[100] bg-white text-slate-950 text-xs font-black px-4 py-2 rounded-full shadow-2xl border border-slate-300 whitespace-nowrap animate-in fade-in"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
