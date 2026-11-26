"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Copy,
  Check,
  CheckCircle2,
  DollarSign,
  Flame,
  Award,
  Download,
  Package,
  Film,
  ExternalLink,
  MessageCircle,
  FileText,
} from "lucide-react";
import {
  DAYS_DATA,
  QUICK_APPS,
  QUOTES_WA,
  CONVOCATORIAS_BASE,
  SUPERPROF_URL,
  FORMULARIO_MAESTRO_PDF,
  SIMULACRO_M1_PDF,
  getSantiagoNow,
  diffDaysFromIso,
  type DayKey,
  type ActionItem,
} from "./grilla-data";

const DEFAULT_MIE25_JSON = JSON.stringify({
  "mie-1230-video": true,
  "mie-1300-story": true,
});
const DEFAULT_JUE26_JSON = "{}";
const SERVER_TIME_KEY = "2026-11-25|1250|20:50";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tpi-tracking-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tpi-tracking-update", callback);
  };
}

function getStorageSnapshot(day: DayKey): string {
  try {
    const val = localStorage.getItem(`tpi_tracking_${day}`);
    if (val !== null) return val;
  } catch {
    // Fallback
  }
  return day === "mie25" ? DEFAULT_MIE25_JSON : DEFAULT_JUE26_JSON;
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

function getCategoryBadge(category: ActionItem["category"]) {
  switch (category) {
    case "video":
      return (
        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
          🎬 Video
        </span>
      );
    case "story":
      return (
        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
          📸 Story
        </span>
      );
    case "facebook":
      return (
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
          👥 Grupo FB
        </span>
      );
    case "whatsapp":
      return (
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
          💬 WhatsApp
        </span>
      );
    default:
      return null;
  }
}

export default function GrillaDecisionPage() {
  const [activeTab, setActiveTab] = useState<"dia" | "productos" | "semana" | "proyectos">("dia");
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const rawCompletedJson = useSyncExternalStore(
    subscribeStorage,
    () => getStorageSnapshot(selectedDay),
    () => (selectedDay === "mie25" ? DEFAULT_MIE25_JSON : DEFAULT_JUE26_JSON)
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

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyTextSafe(text);
    setCopiedKey(key);
    showToast(ok ? "📋 ¡Copiado al portapapeles!" : "⚠️ Selecciona y copia el texto");
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const currentDayData = DAYS_DATA[selectedDay];
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* TOPBAR CLARA DE ALTA VISIBILIDAD */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse pointer-events-none" />
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              @tuprofeindustrial
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
              {santiagoNow.timeStr} CLT
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("proyectos")}
            className="cursor-pointer touch-manipulation flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full transition"
          >
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>PAES: {paesDaysLeft} DÍAS</span>
          </button>
        </div>
      </header>

      {/* 4 PESTAÑAS PRINCIPALES */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 sticky top-[45px] z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: "dia" as const, title: "Hoy / Día", sub: currentDayData.shortLabel, tone: "text-amber-700" },
            { id: "productos" as const, title: "Productos", sub: "MP4 + 8L", tone: "text-purple-700" },
            { id: "semana" as const, title: "Semana", sub: "23–29 Nov", tone: "text-blue-700" },
            { id: "proyectos" as const, title: "Proyectos", sub: "Fondos", tone: "text-emerald-700" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer touch-manipulation min-h-[44px] py-1.5 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
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

        {/* SELECTOR DE DÍA (Mié 25 | Jue 26) visible en Hoy y Productos */}
        {(activeTab === "dia" || activeTab === "productos") && (
          <div className="max-w-md mx-auto grid grid-cols-2 gap-2 mt-2">
            {(["mie25", "jue26"] as DayKey[]).map((key) => {
              const d = DAYS_DATA[key];
              const active = selectedDay === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDayOverride(key)}
                  className={`cursor-pointer touch-manipulation min-h-[40px] py-1.5 px-2 rounded-lg text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
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

      <main className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* ACCESO DIRECTO CLICKABLE A REDES Y METRICOOL */}
        <section className="grid grid-cols-4 gap-1.5">
          {QUICK_APPS.map((app) => (
            <a
              key={app.label}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer touch-manipulation min-h-[40px] bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 flex items-center justify-center shadow-xs transition"
            >
              {app.label}
            </a>
          ))}
        </section>

        {/* ======================================================== */}
        {/* VISTA 1: PROGRAMACIÓN COMPLETA DEL DÍA SELECCIONADO      */}
        {/* ======================================================== */}
        {activeTab === "dia" && (
          <>
            {/* SEMÁFORO 100% DINÁMICO Y BARRA DE PROGRESO */}
            <section className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Ejecución {currentDayData.fullLabel}
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {completedCount} de {dayTasks.length} Acciones Listas
                  </div>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-bold text-center">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 py-1.5 px-1 rounded flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{completedCount} Listo</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 py-1.5 px-1 rounded flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>{procesoTasks.length} En Proceso</span>
                </div>
                <div
                  className={`py-1.5 px-1 rounded flex items-center justify-center gap-1 border ${
                    alertaTasks.length > 0
                      ? "bg-red-50 border-red-300 text-red-800"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block pointer-events-none ${
                      alertaTasks.length > 0 ? "bg-red-500 animate-ping" : "bg-slate-300"
                    }`}
                  />
                  <span>{alertaTasks.length} En Alerta</span>
                </div>
              </div>
            </section>

            {/* TARJETA DINÁMICA DE SIGUIENTE DECISIÓN */}
            {isAllDone ? (
              <section className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>🟢 ¡{currentDayData.fullLabel.toUpperCase()} 100% COMPLETADO!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Todas las acciones del día están marcadas como subidas. Puedes cambiar al día
                  siguiente arriba o monitorear cotizaciones.
                </p>
              </section>
            ) : nextPriorityTask ? (
              <section
                className={`border-2 rounded-xl p-4 shadow-sm relative overflow-hidden ${
                  alertaTasks.length > 0
                    ? "bg-red-50 border-red-500"
                    : "bg-amber-50 border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1 tracking-wider shadow-xs ${
                      alertaTasks.length > 0 ? "bg-red-600" : "bg-amber-600"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>
                      {alertaTasks.length > 0
                        ? "🔴 EN ALERTA · SIGUIENTE ACCIÓN"
                        : "🟡 PRÓXIMO EN AGENDA"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {nextPriorityTask.time} HRS
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                  {nextPriorityTask.title}
                </h2>
                <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                  {nextPriorityTask.detail}
                </p>

                {/* Preview y descargas clickeables */}
                {(nextPriorityTask.assetPreview || nextPriorityTask.videoDownloadUrl) && (
                  <div className="mb-3 p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                    {nextPriorityTask.assetPreview && (
                      <a
                        href={nextPriorityTask.assetPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Image
                          src={nextPriorityTask.assetPreview.url}
                          alt={nextPriorityTask.assetPreview.name}
                          width={48}
                          height={64}
                          unoptimized
                          className="w-12 h-16 object-cover rounded border border-slate-200"
                        />
                      </a>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {nextPriorityTask.videoDownloadUrl && (
                        <a
                          href={nextPriorityTask.videoDownloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[40px] w-full inline-flex items-center justify-center gap-1.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg transition"
                        >
                          <Film className="w-3.5 h-3.5" /> Bajar Video MP4 al Celular
                        </a>
                      )}
                      {nextPriorityTask.assetPreview && (
                        <a
                          href={nextPriorityTask.assetPreview.downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[38px] w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                        >
                          <Download className="w-3.5 h-3.5" /> Abrir / Bajar{" "}
                          {nextPriorityTask.assetPreview.name}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {nextPriorityTask.openUrl && (
                  <a
                    href={nextPriorityTask.openUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer touch-manipulation min-h-[44px] mb-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-3 py-2.5 rounded-lg flex items-center justify-between shadow-xs"
                  >
                    <span>{nextPriorityTask.openUrl.label}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Botones de copiado / envío directo WhatsApp */}
                {nextPriorityTask.copies && nextPriorityTask.copies.length > 0 && (
                  <div className="space-y-2">
                    {nextPriorityTask.copies.map((c) => (
                      <div key={c.key} className="space-y-1.5">
                        {c.waShare && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(c.text)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer touch-manipulation min-h-[44px] w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black py-2.5 px-3 rounded-lg flex items-center justify-between shadow-xs transition active:scale-[0.99]"
                          >
                            <span className="flex items-center gap-1.5">
                              <MessageCircle className="w-4 h-4" />
                              Abrir WhatsApp y Enviar a Grupo
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(c.key, c.text)}
                          className={`cursor-pointer touch-manipulation min-h-[44px] w-full text-xs font-extrabold py-2.5 px-3 rounded-lg flex items-center justify-between transition active:scale-[0.99] ${
                            c.tone === "primary"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : c.tone === "green"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-800"
                          }`}
                        >
                          <span className="text-left">{c.label}</span>
                          {copiedKey === c.key ? (
                            <span className="text-[10px] font-black bg-white/95 text-slate-900 px-2 py-0.5 rounded">
                              ¡COPIADO!
                            </span>
                          ) : (
                            <Copy className="w-4 h-4 shrink-0 opacity-85" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleTask(nextPriorityTask.id)}
                  className="cursor-pointer touch-manipulation min-h-[44px] mt-3 w-full bg-white hover:bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  Marcar esta acción como subida
                </button>
              </section>
            ) : null}

            {/* CRONOGRAMA COMPLETO CON BOTONES TÁCTILES GRANDES */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Cronograma {currentDayData.fullLabel}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Todos los botones están calibrados para el pulgar
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {dayTasks.length} Acciones
                </span>
              </div>

              <div className="space-y-3">
                {dayTasks.map((action) => {
                  const isChecked = !!completedMap[action.id];
                  const urgent = isTaskUrgent(action);

                  return (
                    <div
                      key={action.id}
                      className={`p-3 rounded-xl border transition ${
                        isChecked
                          ? "bg-slate-50/80 border-slate-200 opacity-70"
                          : urgent
                          ? "bg-red-50/40 border-red-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {action.time}
                          </span>
                          {getCategoryBadge(action.category)}
                          <span className="text-[10px] font-bold text-slate-600">
                            {isChecked
                              ? "🟢 Listo"
                              : urgent
                              ? "🔴 En Alerta"
                              : "🟡 En Proceso"}
                          </span>
                        </div>

                        {/* Botón táctil grande para marcar estado (min 40px) */}
                        <button
                          type="button"
                          onClick={() => toggleTask(action.id)}
                          aria-label={`Marcar ${action.title}`}
                          className={`cursor-pointer touch-manipulation shrink-0 min-h-[38px] px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold border flex items-center gap-1 transition active:scale-95 ${
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
                            <span>⬜ Marcar listo</span>
                          )}
                        </button>
                      </div>

                      <div
                        className={`text-xs font-extrabold leading-snug ${
                          isChecked ? "line-through text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {action.title}
                      </div>

                      <div className="text-[11px] text-slate-600 mt-1 leading-normal">
                        {action.detail}
                      </div>

                      {!isChecked && (action.assetPreview || action.videoDownloadUrl) && (
                        <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
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

                      {!isChecked && action.openUrl && (
                        <a
                          href={action.openUrl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[40px] mt-2 w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between"
                        >
                          <span>{action.openUrl.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {!isChecked && action.copies && action.copies.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          {action.copies.map((c) => (
                            <div key={c.key} className="flex gap-1.5">
                              {c.waShare && (
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(c.text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer touch-manipulation min-h-[40px] flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-black px-2.5 py-2 rounded-lg flex items-center justify-center gap-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> Abrir WhatsApp
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
                  );
                })}
              </div>
            </section>

            {/* RESPUESTAS RÁPIDAS PARA COTIZACIONES WHATSAPP */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Respuestas Rápidas para Cotizaciones
                </h3>
                <div className="text-[11px] text-slate-500">
                  Copia o abre WhatsApp directo con la propuesta cargada
                </div>
              </div>

              <div className="space-y-2.5">
                {QUOTES_WA.map((q) => (
                  <div
                    key={q.key}
                    className={`p-3 rounded-lg space-y-2 ${
                      q.featured
                        ? "border-2 border-emerald-500 bg-emerald-50/40"
                        : q.purple
                        ? "border border-purple-200 bg-purple-50/30"
                        : "border border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {q.name} ·{" "}
                        <span
                          className={`font-mono font-black ${
                            q.purple ? "text-purple-700" : "text-emerald-700"
                          }`}
                        >
                          {q.price}
                        </span>
                      </div>
                      <div
                        className={`text-[10.5px] ${
                          q.featured ? "text-amber-700 font-bold" : "text-slate-500"
                        }`}
                      >
                        {q.sub}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(q.key, q.message)}
                        className={`cursor-pointer touch-manipulation min-h-[40px] text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs active:scale-95 transition flex items-center justify-center gap-1 ${
                          q.featured
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                            : q.purple
                            ? "bg-white hover:bg-purple-100 border border-purple-300 text-purple-800"
                            : "bg-white hover:bg-slate-100 border border-slate-300 text-slate-800"
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedKey === q.key ? "¡Copiado!" : "Copiar texto"}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(q.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer touch-manipulation min-h-[40px] bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: PRODUCTOS CALIBRADOS (MP4 + 8 LÁMINAS + PDFs)   */}
        {/* ======================================================== */}
        {activeTab === "productos" && (
          <section className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  Productos {currentDayData.fullLabel}
                </h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  Calibrado 2026
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Videos MP4, carruseles (8 láminas el jueves), historias zona segura Meta 35% y PDFs
                descargables con un toque.
              </p>
            </div>

            {/* NUEVO: FORMULARIO MAESTRO DE INGENIERÍA + SIMULACRO M1 */}
            <div className="space-y-2.5">
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-blue-950 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Formulario Maestro de Ingeniería (PDF)</span>
                  </div>
                  <div className="text-[11px] text-blue-800 mt-0.5">
                    Nuevo 20:01 hrs · Cuadrática, Discriminante, Viète y Geometría 3D
                  </div>
                </div>
                <a
                  href={FORMULARIO_MAESTRO_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="formulario_maestro_ingenieria.pdf"
                  className="cursor-pointer touch-manipulation min-h-[44px] shrink-0 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Abrir / Bajar
                </a>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-emerald-900">
                    📄 Simulacro PAES M1 con Solucionario (PDF)
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    20 ítems de alternativas resueltos paso a paso · Sin calculadora
                  </div>
                </div>
                <a
                  href={SIMULACRO_M1_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="simulacro-paes-m1.pdf"
                  className="cursor-pointer touch-manipulation min-h-[44px] shrink-0 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Bajar PDF
                </a>
              </div>
            </div>

            {/* VIDEOS MP4 Y PORTADAS DEL DÍA */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                <span>🎬 Videos Verticales 9:16 + Portadas</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentDayData.videos.length} Videos
                </span>
              </div>
              <div className="space-y-2.5">
                {currentDayData.videos.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3"
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
                        width={48}
                        height={64}
                        unoptimized
                        className="w-12 h-16 object-cover rounded border border-slate-300"
                      />
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono font-bold text-blue-700">
                        {v.time} hrs · {v.duration}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {v.title}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <a
                          href={v.mp4Url}
                          download={v.mp4Name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[38px] text-[11px] font-extrabold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Film className="w-3.5 h-3.5" /> Descargar MP4
                        </a>
                        <a
                          href={v.coverUrl}
                          download={v.coverName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer touch-manipulation min-h-[38px] text-[11px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Portada JPG
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARRUSELES HD (6 LÁMINAS MIÉ / 8 LÁMINAS CALIBRADAS JUE) */}
            {currentDayData.carousels.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{car.title}</div>
                    <div className="text-[10px] text-slate-500">{car.subtitle}</div>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {car.slides.length} Slides
                  </span>
                </div>

                {car.sheetUrl && (
                  <a
                    href={car.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="cursor-pointer touch-manipulation min-h-[40px] w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between"
                  >
                    <span>👁️ Ver Hoja Completa de Carrusel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2">
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
                        className="cursor-pointer touch-manipulation min-h-[38px] w-full text-[11px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 py-1.5 rounded-md flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Bajar PNG
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* PACK COMPLETO DE HISTORIAS 9:16 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div>
                <div className="text-xs font-extrabold text-slate-900">
                  📱 Historias {currentDayData.fullLabel} (Pack 9:16)
                </div>
                <div className="text-[10px] text-slate-500">
                  Zonas seguras Meta 2026 (35% inferior libre para sticker/DM)
                </div>
              </div>

              {currentDayData.storiesSheetUrl && (
                <a
                  href={currentDayData.storiesSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="cursor-pointer touch-manipulation min-h-[40px] w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-extrabold px-3 py-2 rounded-lg flex items-center justify-between"
                >
                  <span>👁️ Ver Hoja Completa de Historias</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="grid grid-cols-2 gap-2.5">
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
                      className="cursor-pointer touch-manipulation min-h-[38px] w-full py-1.5 text-[11px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-md flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> {st.tag}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: PROGRAMACIÓN SEMANAL COMPLETA (SEMANA 2)        */}
        {/* ======================================================== */}
        {activeTab === "semana" && (
          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Matriz Semanal de Contenido
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Semana Crítica PAES
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                3 videos diarios + Carruseles 8 láminas + Stories + Grupos
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  day: "Lunes 23 Noviembre",
                  iso: "2026-11-23",
                  badge: "Completado",
                  summary: "(x+2)/2 · 1 m² a cm² · i² = -1 · Carrusel 6 slides",
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
                  badge: "Programado",
                  summary: "Inecuaciones trampa · Máxima Ganancia · Fractales",
                },
                {
                  day: "Sábado 28 Noviembre",
                  iso: "2026-11-28",
                  badge: "Programado",
                  summary: "Intersección Ejes · Función Inversa · Infinito de Hilbert",
                },
                {
                  day: "Domingo 29 Noviembre",
                  iso: "2026-11-29",
                  badge: "Víspera PAES",
                  summary: "Puntos Clave PAES · Ritual Calma · Mensaje de Confianza",
                },
              ].map((row) => {
                const isToday = row.iso === santiagoNow.isoDate;
                return (
                  <div
                    key={row.iso}
                    className={`p-3 rounded-lg border ${
                      isToday
                        ? "border-2 border-red-500 bg-red-50/30"
                        : row.iso < santiagoNow.isoDate
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        {isToday && (
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping pointer-events-none" />
                        )}
                        {row.day} {isToday && "(HOY)"}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          isToday
                            ? "bg-red-100 text-red-700"
                            : row.iso < santiagoNow.isoDate
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {row.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">• {row.summary}</div>
                    {row.switchKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setDayOverride(row.switchKey!);
                          setActiveTab("dia");
                        }}
                        className="cursor-pointer touch-manipulation min-h-[38px] mt-2 w-full text-xs font-extrabold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md py-1.5"
                      >
                        Abrir turno {row.day} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 4: DÍAS QUE FALTAN PARA POSTULAR A PROYECTOS       */}
        {/* ======================================================== */}
        {activeTab === "proyectos" && (
          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Radar de Fondos y Proyectos 2026-2027
              </h3>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cuenta regresiva automática desde hoy ({santiagoNow.isoDate})
              </div>
            </div>

            <div className="space-y-2.5">
              {CONVOCATORIAS_BASE.map((c, i) => {
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

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 mt-1">
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
                      🎯 <strong>Acción Requerida:</strong> {c.accion}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              💡 <strong>Estrategia de Fondos:</strong> Cada video que subes y cada alumno que
              atiendes genera la métrica de tracción real que CORFO y Start-Up Chile exigen en el
              formulario.
            </div>
          </section>
        )}

        {/* FOOTER CON ENLACES VERIFICADOS */}
        <footer className="pt-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/"
              className="cursor-pointer touch-manipulation min-h-[44px] bg-white hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              🌐 Ver Landing Web
            </Link>
            <a
              href={SUPERPROF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer touch-manipulation min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-800 py-2.5 px-3 rounded-lg border border-amber-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              ⭐ Superprof 5.0 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            TuProfeIndustrial · Uso Interno (noindex) · Santiago de Chile
          </div>
        </footer>
      </main>

      {/* TOAST VISUAL FLOTANTE PARA CONFIRMACIÓN TÁCTIL */}
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
