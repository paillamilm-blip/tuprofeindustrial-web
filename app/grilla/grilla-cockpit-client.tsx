"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Flame,
  Award,
  Download,
  Package,
  Film,
  ExternalLink,
  MessageCircle,
  FileText,
  RefreshCw,
  Share2,
  Lock,
  ShieldAlert,
  Sparkles,
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
const SERVER_TIME_KEY = "2026-11-25|1250|20:50";

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

function getCategoryBadge(category: ActionItem["category"], compact = false) {
  const pad = compact ? "px-1.5 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[10px]";
  switch (category) {
    case "video":
      return (
        <span className={`${pad} font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded`}>
          🎬 Video
        </span>
      );
    case "story":
      return (
        <span className={`${pad} font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded`}>
          📸 Story
        </span>
      );
    case "facebook":
      return (
        <span className={`${pad} font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded`}>
          👥 FB
        </span>
      );
    case "whatsapp":
      return (
        <span className={`${pad} font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded`}>
          💬 WA
        </span>
      );
    default:
      return null;
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
  const [activeTab, setActiveTab] = useState<"dia" | "productos" | "semana" | "proyectos">("dia");
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Vista panorámica: acordeón compacto por defecto para evitar scroll infinito
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [expandAllTasks, setExpandAllTasks] = useState(false);
  const [openProductGroupIds, setOpenProductGroupIds] = useState<Record<string, boolean>>({
    videos: true,
  });
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
    setTimeout(() => setToastMsg(null), 2600);
  };

  // Auto-importar #s=... o ?sync=... y fusionar snapshot nuevo desde Mac si cambió syncedAt
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
            ? `🔄 Sincronizadas +${importedCount} tareas entre dispositivos`
            : "🔄 Enlace de sincronización aplicado (al día)"
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
      showToast(nextState ? "✅ Marcado como listo" : "↺ Devuelto a pendiente");
    } catch {
      // Ignorar si localStorage no está disponible
    }
  };

  const toggleTaskAccordion = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleProductGroup = (groupId: string) => {
    setOpenProductGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyTextSafe(text);
    setCopiedKey(key);
    showToast(ok ? "📋 ¡Copiado al portapapeles!" : "⚠️ Selecciona y copia el texto");
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
    showToast(
      ok
        ? "📤 Enlace #s= copiado · Ábrelo en tu celular o Mac"
        : "⚠️ No se pudo copiar el enlace"
    );
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
    showToast(
      addedCount > 0
        ? `🔄 +${addedCount} tareas importadas correctamente`
        : "🔄 Todo ya estaba sincronizado"
    );
  };

  const currentDayData = daysData[selectedDay];
  const dayTasks = currentDayData.actions;

  const isTaskUrgent = (task: ActionItem): boolean => {
    if (completedMap[task.id]) return false;
    if (currentDayData.isoDate < santiagoNow.isoDate) return true;
    if (currentDayData.isoDate > santiagoNow.isoDate) return false;
    return task.minutesFromMidnight <= santiagoNow.minutes + 45;
  };

  const completedCount = dayTasks.filter((t) => completedMap[t.id]).length;
  const alertaTasks = dayTasks.filter((t) => !completedMap[t.id] && isTaskUrgent(t));
  const procesoTasks = dayTasks.filter((t) => !completedMap[t.id] && !isTaskUrgent(t));
  const progressPercent = Math.round((completedCount / dayTasks.length) * 100);

  const nextPriorityTask = alertaTasks[0] ?? procesoTasks[0] ?? null;
  const isAllDone = completedCount === dayTasks.length;
  const paesDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2026-11-30");
  const corfoDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2027-03-20");

  const weekendByIso = useMemo(() => {
    const map: Record<string, SyncedGrillaData["weekendReadiness"][number]> = {};
    for (const item of syncedData.weekendReadiness) {
      map[item.iso] = item;
    }
    return map;
  }, [syncedData.weekendReadiness]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* TOPBAR CLARA CON PRIVACIDAD Y SYNC RÁPIDO */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 pointer-events-none" />
            <span className="font-extrabold text-xs tracking-tight text-slate-900 truncate">
              @tuprofeindustrial
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono shrink-0">
              {santiagoNow.timeStr}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSyncPanel((v) => !v)}
              aria-label="Sincronizar entre dispositivos"
              className={`cursor-pointer touch-manipulation min-h-[34px] px-2 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition ${
                showSyncPanel
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>

            {isPinProtected ? (
              <form action={lockGrillaAction}>
                <button
                  type="submit"
                  className="cursor-pointer touch-manipulation min-h-[34px] px-2 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1"
                  title="Bloquear cockpit con PIN"
                >
                  <Lock className="w-3 h-3" />
                  <span>Cerrar</span>
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowPinHint((v) => !v)}
                className="cursor-pointer touch-manipulation min-h-[34px] px-2 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1"
                title="Estado de privacidad PIN"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Sin PIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerta accionable si GRILLA_PIN aún no está configurada en Vercel */}
        {!isPinProtected && showPinHint && (
          <div className="max-w-md mx-auto mt-2 rounded-xl bg-amber-50 border border-amber-300 p-2.5 text-[11px] text-amber-950 space-y-1">
            <div className="font-extrabold">🔐 Bloqueo por PIN listo para activar en Vercel</div>
            <p className="leading-snug">
              Agrega <code className="bg-white px-1 rounded border">GRILLA_PIN=tu_clave</code> en{" "}
              <strong>Vercel → Settings → Environment Variables</strong> y haz Redeploy.{" "}
              <code className="bg-white px-1 rounded border">/grilla.html</code> ya redirige aquí sin filtrar datos.
            </p>
          </div>
        )}

        {/* Drawer compacto de Sync Mac ↔ Celular */}
        {showSyncPanel && (
          <div className="max-w-md mx-auto mt-2 rounded-xl bg-slate-900 text-white p-3 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Sincronización Mac ↔ Celular
              </span>
              <span className="text-[10px] font-mono text-slate-300">
                Base Mac: {syncedData.syncedAt.slice(5, 16).replace("T", " ")}
              </span>
            </div>

            <div className="text-[10.5px] text-slate-300 flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg">
              <span>🎬 Activos Git: {syncedData.activeVideoCount} MP4 ({syncedData.activeVideoSizeMb} MB)</span>
              <span>Podados: {syncedData.prunedPastVideos.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCopySyncLink}
                className="cursor-pointer touch-manipulation min-h-[40px] bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Copiar Link #s=
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🔄 Avance Cockpit TPI (${currentDayData.shortLabel}): ${buildCurrentSyncUrl()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[40px] bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Enviar a mi WA
              </a>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualSyncInput}
                onChange={(e) => setManualSyncInput(e.target.value)}
                placeholder="Pega aquí un enlace #s=v1... o token"
                className="flex-1 min-h-[38px] rounded-lg bg-slate-800 border border-slate-700 px-2.5 text-[11px] text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleImportManualSync}
                className="cursor-pointer touch-manipulation min-h-[38px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] px-3 rounded-lg"
              >
                Importar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 4 PESTAÑAS PRINCIPALES */}
      <div className="bg-white border-b border-slate-200 px-3 py-1.5 sticky top-[51px] z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: "dia" as const, title: "Hoy / Día", sub: currentDayData.shortLabel, tone: "text-amber-700" },
            { id: "productos" as const, title: "Productos", sub: "MP4 + 8L", tone: "text-purple-700" },
            { id: "semana" as const, title: "Semana", sub: "23–29 Nov", tone: "text-blue-700" },
            { id: "proyectos" as const, title: "Proyectos", sub: `PAES ${paesDaysLeft}d`, tone: "text-red-700" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer touch-manipulation min-h-[42px] py-1 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.title}</span>
              <span className={`text-[9px] font-mono ${tab.tone}`}>{tab.sub}</span>
            </button>
          ))}
        </div>

        {(activeTab === "dia" || activeTab === "productos") && (
          <div className="max-w-md mx-auto grid grid-cols-2 gap-1.5 mt-1.5">
            {DAY_KEYS.map((key) => {
              const d = daysData[key];
              const active = selectedDay === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDayOverride(key)}
                  className={`cursor-pointer touch-manipulation min-h-[36px] py-1 px-2 rounded-lg text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{d.fullLabel}</span>
                  {d.isoDate === santiagoNow.isoDate && (
                    <span
                      className={`text-[9px] px-1 rounded font-mono ${
                        active ? "bg-emerald-500 text-black" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      HOY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <main className="max-w-md mx-auto px-3.5 pt-3 space-y-3">
        {/* TIRA PANORÁMICA DE 1 PANTALLA: SEMÁFORO + PROYECTOS + REDES */}
        <section className="bg-slate-900 text-white rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Panorámica {currentDayData.shortLabel}
              </div>
              <div className="text-sm font-extrabold">
                {completedCount}/{dayTasks.length} Listo{" "}
                <span className="text-emerald-400 font-mono">({progressPercent}%)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("proyectos")}
              className="cursor-pointer touch-manipulation bg-red-600/20 border border-red-400/40 text-red-200 hover:bg-red-600/30 px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-red-400" />
              <span>PAES {paesDaysLeft}d · CORFO {corfoDaysLeft}d</span>
            </button>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-bold text-center">
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 py-1 rounded">
              🟢 {completedCount} Listo
            </div>
            <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 py-1 rounded">
              🟡 {procesoTasks.length} Proceso
            </div>
            <div
              className={`py-1 rounded border ${
                alertaTasks.length > 0
                  ? "bg-red-500/20 border-red-400/50 text-red-200"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              🔴 {alertaTasks.length} Alerta
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {quickApps.map((app) => (
              <a
                key={app.label}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[34px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[10.5px] font-bold text-slate-100 flex items-center justify-center transition"
              >
                {app.label}
              </a>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* VISTA 1: HOY / DÍA (COMPACTA Y ACCIONABLE)               */}
        {/* ======================================================== */}
        {activeTab === "dia" && (
          <>
            {/* SIGUIENTE DECISIÓN PRIORITARIA (COMPACTA) */}
            {isAllDone ? (
              <section className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>🟢 ¡{currentDayData.fullLabel.toUpperCase()} 100% COMPLETADO!</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Puedes cambiar al día siguiente arriba o copiar tu enlace <code className="bg-white px-1 rounded">#s=</code> en Sync.
                </p>
              </section>
            ) : nextPriorityTask ? (
              <section
                className={`border-2 rounded-xl p-3.5 shadow-xs space-y-2.5 ${
                  alertaTasks.length > 0
                    ? "bg-red-50 border-red-500"
                    : "bg-amber-50 border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-white text-[10.5px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                      alertaTasks.length > 0 ? "bg-red-600" : "bg-amber-600"
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    {alertaTasks.length > 0 ? "🔴 En Alerta · Ahora" : "🟡 Próxima Acción"}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {nextPriorityTask.time} HRS
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {nextPriorityTask.title}
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    {nextPriorityTask.detail}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {nextPriorityTask.videoDownloadUrl && (
                    <a
                      href={nextPriorityTask.videoDownloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[40px] flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Film className="w-3.5 h-3.5" /> Bajar MP4
                    </a>
                  )}
                  {nextPriorityTask.assetPreview && (
                    <a
                      href={nextPriorityTask.assetPreview.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[40px] flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Bajar JPG/PNG
                    </a>
                  )}
                  {nextPriorityTask.openUrl && (
                    <a
                      href={nextPriorityTask.openUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer touch-manipulation min-h-[40px] flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <span>{nextPriorityTask.openUrl.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {nextPriorityTask.copies && nextPriorityTask.copies[0] && (
                  <div className="flex gap-1.5">
                    {nextPriorityTask.copies[0].waShare && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          nextPriorityTask.copies[0].text
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation min-h-[42px] flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          nextPriorityTask.copies![0].key,
                          nextPriorityTask.copies![0].text
                        )
                      }
                      className="cursor-pointer touch-manipulation min-h-[42px] flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between gap-1.5"
                    >
                      <span className="truncate">{nextPriorityTask.copies[0].label}</span>
                      <span className="shrink-0 font-black">
                        {copiedKey === nextPriorityTask.copies[0].key ? "¡Copiado!" : "Copiar"}
                      </span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleTask(nextPriorityTask.id)}
                  className="cursor-pointer touch-manipulation min-h-[42px] w-full bg-white hover:bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  Marcar esta acción como subida
                </button>
              </section>
            ) : null}

            {/* CRONOGRAMA COMPLETO EN ACORDEÓN COMPACTO (1 PANTALLA) */}
            <section className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Cronograma {currentDayData.fullLabel}
                  </h3>
                  <div className="text-[10.5px] text-slate-500">
                    Toca cualquier fila para abrir assets y copies
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandAllTasks((v) => !v)}
                  className="cursor-pointer touch-manipulation min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold shrink-0"
                >
                  {expandAllTasks ? "Compactar todo" : `Expandir (${dayTasks.length})`}
                </button>
              </div>

              <div className="space-y-1.5">
                {dayTasks.map((action) => {
                  const isChecked = !!completedMap[action.id];
                  const urgent = isTaskUrgent(action);
                  const isExpanded = expandAllTasks || !!expandedTaskIds[action.id];

                  return (
                    <div
                      key={action.id}
                      className={`rounded-xl border transition ${
                        isChecked
                          ? "bg-slate-50/70 border-slate-200 opacity-75"
                          : urgent
                          ? "bg-red-50/40 border-red-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Fila compacta 1-línea (~48px) */}
                      <div className="p-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTaskAccordion(action.id)}
                          aria-expanded={isExpanded}
                          className="cursor-pointer touch-manipulation flex-1 min-w-0 flex items-center gap-1.5 text-left py-1"
                        >
                          <span className="font-mono font-bold text-[11px] text-slate-800 shrink-0">
                            {action.time}
                          </span>
                          <span className="shrink-0 text-[11px]">
                            {isChecked ? "🟢" : urgent ? "🔴" : "🟡"}
                          </span>
                          {getCategoryBadge(action.category, true)}
                          <span
                            className={`text-xs font-bold truncate ${
                              isChecked ? "line-through text-slate-500" : "text-slate-900"
                            }`}
                          >
                            {action.title}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTask(action.id)}
                          aria-label={`Marcar ${action.title}`}
                          className={`cursor-pointer touch-manipulation shrink-0 min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-extrabold border flex items-center gap-1 transition active:scale-95 ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white border-slate-300 hover:border-emerald-500 text-slate-800"
                          }`}
                        >
                          {isChecked ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Subido
                            </>
                          ) : (
                            <span>⬜ Listo</span>
                          )}
                        </button>
                      </div>

                      {/* Detalle expandible bajo demanda */}
                      {isExpanded && (
                        <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100 space-y-2">
                          <div className="text-[11px] text-slate-600 leading-normal">
                            {action.detail}
                          </div>

                          {(action.assetPreview || action.videoDownloadUrl) && (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                              <a
                                href={action.assetPreview?.url || action.videoDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 min-w-0 cursor-pointer"
                              >
                                {action.assetPreview && (
                                  <Image
                                    src={action.assetPreview.url}
                                    alt={action.assetPreview.name}
                                    width={36}
                                    height={48}
                                    unoptimized
                                    className="w-9 h-12 object-cover rounded border border-slate-300 shrink-0"
                                  />
                                )}
                                <span className="truncate text-[11px] font-bold text-slate-700 underline decoration-slate-300">
                                  {action.assetPreview?.name || action.videoLabel}
                                </span>
                              </a>
                              <div className="flex flex-wrap gap-1.5 shrink-0">
                                {action.videoDownloadUrl && (
                                  <a
                                    href={action.videoDownloadUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer touch-manipulation min-h-[36px] text-[11px] font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1"
                                  >
                                    <Film className="w-3 h-3" /> MP4
                                  </a>
                                )}
                                {action.assetPreview && (
                                  <a
                                    href={action.assetPreview.downloadUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer touch-manipulation min-h-[36px] text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-md flex items-center gap-1"
                                  >
                                    <Download className="w-3 h-3" /> PNG/JPG
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {action.openUrl && (
                            <a
                              href={action.openUrl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer touch-manipulation min-h-[40px] w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between"
                            >
                              <span>{action.openUrl.label}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {action.copies && action.copies.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {action.copies.map((c) => (
                                <div key={c.key} className="flex gap-1.5">
                                  {c.waShare && (
                                    <a
                                      href={`https://wa.me/?text=${encodeURIComponent(c.text)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="cursor-pointer touch-manipulation min-h-[40px] flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-black px-2.5 py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(c.key, c.text)}
                                    className="cursor-pointer touch-manipulation min-h-[40px] flex-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-2 rounded-lg flex items-center justify-between gap-1 active:scale-95"
                                  >
                                    <span className="truncate">{c.label}</span>
                                    <span className="shrink-0 font-black">
                                      {copiedKey === c.key ? "¡Copiado!" : "Copiar"}
                                    </span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RESPUESTAS RÁPIDAS WHATSAPP (COMPACTAS EN 1 FILA POR PLAN) */}
            <section className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Cotizaciones WhatsApp
                </h3>
                <span className="text-[10px] text-slate-500">1 toque = copia o abre WA</span>
              </div>

              <div className="space-y-1.5">
                {quotesWa.map((q) => (
                  <div
                    key={q.key}
                    className={`p-2.5 rounded-lg flex items-center justify-between gap-2 ${
                      q.featured
                        ? "border-2 border-emerald-500 bg-emerald-50/40"
                        : q.purple
                        ? "border border-purple-200 bg-purple-50/30"
                        : "border border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {q.name} ·{" "}
                        <span
                          className={`font-mono font-black ${
                            q.purple ? "text-purple-700" : "text-emerald-700"
                          }`}
                        >
                          {q.price}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{q.sub}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(q.key, q.message)}
                        className="cursor-pointer touch-manipulation min-h-[38px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-[11px] font-bold text-slate-800 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedKey === q.key ? "¡Listo!" : "Copiar"}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(q.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation min-h-[38px] px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> WA
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: PRODUCTOS CALIBRADOS (ACORDEÓN PANORÁMICO)      */}
        {/* ======================================================== */}
        {activeTab === "productos" && (
          <section className="space-y-3">
            {/* PDFs siempre visibles arriba */}
            <div className="space-y-2">
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-blue-950 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate">Formulario Maestro de Ingeniería (PDF)</span>
                  </div>
                  <div className="text-[10.5px] text-blue-800">
                    Cuadrática, Discriminante, Viète y Geometría 3D
                  </div>
                </div>
                <a
                  href={formularioMaestroPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="formulario_maestro_ingenieria.pdf"
                  className="cursor-pointer touch-manipulation min-h-[40px] shrink-0 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </a>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-emerald-900 truncate">
                    📄 Simulacro PAES M1 con Solucionario (PDF)
                  </div>
                  <div className="text-[10.5px] text-emerald-700">
                    20 ítems resueltos paso a paso · Sin calculadora
                  </div>
                </div>
                <a
                  href={simulacroM1Pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="simulacro-paes-m1.pdf"
                  className="cursor-pointer touch-manipulation min-h-[40px] shrink-0 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </a>
              </div>
            </div>

            {/* VIDEOS 9:16 + PORTADAS (DESPLEGABLE) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
              <button
                type="button"
                onClick={() => toggleProductGroup("videos")}
                className="cursor-pointer touch-manipulation w-full flex items-center justify-between text-left"
              >
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>🎬 Videos 9:16 + Portadas ({currentDayData.videos.length})</span>
                </div>
                {openProductGroupIds["videos"] ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openProductGroupIds["videos"] && (
                <div className="space-y-2 pt-1">
                  {currentDayData.videos.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5"
                    >
                      <a
                        href={v.coverUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Image
                          src={v.coverUrl}
                          alt={v.title}
                          width={42}
                          height={56}
                          unoptimized
                          className="w-10 h-14 object-cover rounded border border-slate-300"
                        />
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono font-bold text-blue-700">
                          {v.time} · {v.duration}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          {v.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <a
                            href={v.mp4Url}
                            download={v.mp4Name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[36px] text-[11px] font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1"
                          >
                            <Film className="w-3 h-3" /> MP4
                          </a>
                          <a
                            href={v.coverUrl}
                            download={v.coverName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[36px] text-[11px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Portada
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARRUSELES EN ACORDEÓN (EVITA CARGAR TODAS LAS LÁMINAS A LA VEZ EN 1 PANTALLA) */}
            {currentDayData.carousels.map((car) => {
              const open = !!openProductGroupIds[car.id];
              return (
                <div
                  key={car.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleProductGroup(car.id)}
                    className="cursor-pointer touch-manipulation w-full flex items-center justify-between gap-2 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">{car.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{car.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {car.slides.length} Slides
                      </span>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {car.sheetUrl && (
                    <a
                      href={car.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="cursor-pointer touch-manipulation min-h-[38px] w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center justify-between"
                    >
                      <span>👁️ Hoja Completa ({car.slides.length} slides)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {open && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {car.slides.map((s) => (
                        <div
                          key={s.num}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 text-center"
                        >
                          <a
                            href={`${car.folderPath}/${s.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Image
                              src={`${car.folderPath}/${s.file}`}
                              alt={s.name}
                              width={160}
                              height={200}
                              unoptimized
                              className="w-full h-36 object-cover rounded border border-slate-200"
                            />
                          </a>
                          <div className="text-[10.5px] font-extrabold text-slate-800 truncate w-full">
                            {s.num}. {s.name}
                          </div>
                          <a
                            href={`${car.folderPath}/${s.file}`}
                            download={`${car.id}-${s.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[36px] w-full text-[11px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 py-1 rounded-md flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Bajar PNG
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* HISTORIAS EN ACORDEÓN */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
              <button
                type="button"
                onClick={() => toggleProductGroup("stories")}
                className="cursor-pointer touch-manipulation w-full flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    📱 Historias {currentDayData.shortLabel} ({currentDayData.stories.length} láminas 9:16)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Zonas seguras Meta 2026 (35% inferior libre)
                  </div>
                </div>
                {openProductGroupIds["stories"] ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {currentDayData.storiesSheetUrl && (
                <a
                  href={currentDayData.storiesSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="cursor-pointer touch-manipulation min-h-[38px] w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center justify-between"
                >
                  <span>👁️ Hoja Completa de Historias</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {openProductGroupIds["stories"] && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {currentDayData.stories.map((st) => (
                    <div
                      key={st.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 text-center"
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
                          width={135}
                          height={240}
                          unoptimized
                          className="w-full h-36 object-cover rounded border border-slate-300"
                        />
                      </a>
                      <div className="text-[10.5px] font-extrabold text-slate-800 leading-tight">
                        {st.title}
                      </div>
                      <a
                        href={st.url}
                        download={st.downloadName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation min-h-[36px] w-full py-1 text-[11px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-md flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> {st.tag}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: SEMANA COMPLETA + ESTADO MOTOR FIN DE SEMANA    */}
        {/* ======================================================== */}
        {activeTab === "semana" && (
          <section className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Matriz Semanal 23–29 Nov
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Última semana PAES
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  {
                    day: "Lunes 23 Noviembre",
                    iso: "2026-11-23",
                    badge: "Completado",
                    summary: "(x+2)/2 · 1 m² a cm² · i² = -1",
                  },
                  {
                    day: "Martes 24 Noviembre",
                    iso: "2026-11-24",
                    badge: "Completado",
                    summary: "x² = 25 (±5) · Vértice f(x) · ¿Por qué π?",
                  },
                  {
                    day: "Miércoles 25 Noviembre",
                    iso: "2026-11-25",
                    badge: "En Operación",
                    summary: "12:30 Discriminante · 17:30 Arista 3D · 21:15 Dividir por 0",
                    switchKey: "mie25" as DayKey,
                  },
                  {
                    day: "Jueves 26 Noviembre",
                    iso: "2026-11-26",
                    badge: "Calibrado 8 Láminas",
                    summary: "12:30 Parábola-Recta · 17:30 Viète · 21:15 Euler + Formulario PDF",
                    switchKey: "jue26" as DayKey,
                  },
                  {
                    day: "Viernes 27 Noviembre",
                    iso: "2026-11-27",
                    badge:
                      weekendByIso["2026-11-27"]?.status === "calibrado"
                        ? "Calibrado Motor"
                        : "Falta Render Motor",
                    summary: "Inecuaciones trampa · Máxima Ganancia · Fractales",
                  },
                  {
                    day: "Sábado 28 Noviembre",
                    iso: "2026-11-28",
                    badge:
                      weekendByIso["2026-11-28"]?.status === "calibrado"
                        ? "Calibrado Motor"
                        : "Falta Render Motor",
                    summary: "Intersección Ejes · Función Inversa · Infinito de Hilbert",
                  },
                  {
                    day: "Domingo 29 Noviembre",
                    iso: "2026-11-29",
                    badge:
                      weekendByIso["2026-11-29"]?.status === "calibrado"
                        ? "Calibrado Motor"
                        : "Víspera · Sin Render",
                    summary: "Puntos Clave PAES · Ritual Calma · Mensaje de Confianza",
                  },
                ].map((row) => {
                  const isToday = row.iso === santiagoNow.isoDate;
                  const weekendInfo = weekendByIso[row.iso];
                  const needsRender = weekendInfo?.status === "pendiente_render";

                  return (
                    <div
                      key={row.iso}
                      className={`p-2.5 rounded-lg border ${
                        isToday
                          ? "border-2 border-red-500 bg-red-50/30"
                          : needsRender
                          ? "border-amber-200 bg-amber-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>
                          {row.day} {isToday && "(HOY)"}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isToday
                              ? "bg-red-100 text-red-700"
                              : needsRender
                              ? "bg-amber-100 text-amber-800"
                              : row.iso < santiagoNow.isoDate
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {row.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">• {row.summary}</div>
                      {weekendInfo && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Assets detectados en Mac: {weekendInfo.assetCount} · {weekendInfo.notes}
                        </div>
                      )}
                      {row.switchKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setDayOverride(row.switchKey!);
                            setActiveTab("dia");
                          }}
                          className="cursor-pointer touch-manipulation min-h-[36px] mt-1.5 w-full text-xs font-extrabold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md py-1"
                        >
                          Abrir {row.day} →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COMANDO 1-TOQUE PARA PRODUCIR FIN DE SEMANA + PODAR MP4 VIEJOS */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Automatizar Fin de Semana + Sync Mac → Web
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cuando generes tus videos del Viernes–Domingo con <code className="bg-slate-800 px-1 rounded">./tpi</code>, corre este script en tu Mac para importar el estado de <code className="bg-slate-800 px-1 rounded">scan.cjs</code>, podar MP4 expirados y publicar a Vercel:
              </p>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    "sync-cmd",
                    "node /Users/documentos/Documents/tuprofeindustrial/herramientas/sync-grilla.mjs --push"
                  )
                }
                className="cursor-pointer touch-manipulation min-h-[40px] w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] px-3 py-2 rounded-lg flex items-center justify-between gap-2"
              >
                <span className="truncate font-mono">
                  node .../herramientas/sync-grilla.mjs --push
                </span>
                <span className="shrink-0">
                  {copiedKey === "sync-cmd" ? "¡Copiado!" : "Copiar CLI"}
                </span>
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 4: PROYECTOS Y FONDOS CONCURSABLES                 */}
        {/* ======================================================== */}
        {activeTab === "proyectos" && (
          <section className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Radar de Fondos y Proyectos 2026-2027
              </h3>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cuenta regresiva en vivo ({santiagoNow.isoDate})
              </div>
            </div>

            <div className="space-y-2">
              {convocatoriasBase.map((c, i) => {
                const dias = diffDaysFromIso(santiagoNow.isoDate, c.fechaIso);
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      c.estado === "alerta"
                        ? "bg-red-50/50 border-red-300"
                        : "bg-slate-50/50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{c.nombre}</div>
                        <div className="text-[10px] text-slate-500">{c.entidad}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-extrabold font-mono ${
                            c.estado === "alerta" ? "text-red-700" : "text-emerald-700"
                          }`}
                        >
                          {dias} DÍAS
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          {c.fechaLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-700">Monto: {c.monto}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.estado === "alerta"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.estado === "alerta" ? "Prioridad Inmediata" : "En Planificación"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded border border-slate-200/80">
                      🎯 <strong>Acción:</strong> {c.accion}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FOOTER CON ENLACES VERIFICADOS */}
        <footer className="pt-1 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/"
              className="cursor-pointer touch-manipulation min-h-[42px] bg-white hover:bg-slate-100 text-slate-800 py-2 px-3 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              🌐 Ver Landing Web
            </Link>
            <a
              href={superprofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer touch-manipulation min-h-[42px] bg-amber-50 hover:bg-amber-100 text-amber-800 py-2 px-3 rounded-lg border border-amber-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              ⭐ Superprof 5.0 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500">
            TuProfeIndustrial · Cockpit Operativo · Santiago de Chile
          </div>
        </footer>
      </main>

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-xl border border-slate-700 whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
