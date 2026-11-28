"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
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
  Camera,
  Globe,
  ExternalLink,
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

const DAY_KEYS: DayKey[] = ["mie25", "jue26", "vie27", "sab28", "dom29"];
const SERVER_TIME_KEY = "2026-11-27|1324|22:04";

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

export const getSubproductExactTimes = (slot: string) => {
  if (slot === "12:30") {
    return {
      video: "12:30",
      cover: "12:30",
      carousel: "12:45",
      stories: "13:00",
      copy: "12:30",
      comment: "12:35",
      wa: "13:15",
    };
  }
  if (slot === "17:30") {
    return {
      video: "17:30",
      cover: "17:30",
      carousel: "17:45",
      stories: "18:00",
      copy: "17:30",
      comment: "17:35",
      wa: "18:30",
    };
  }
  return {
    video: "21:15",
    cover: "21:15",
    carousel: "21:20",
    stories: "21:30",
    copy: "21:15",
    comment: "21:20",
    wa: "21:45",
  };
};

export function GrillaCockpitClient({
  daysData,
  quotesWa,
  formularioMaestroPdf,
  superprofUrl,
  syncedData,
  isPinProtected,
}: GrillaCockpitClientProps) {
  const [dayOverride, setDayOverride] = useState<DayKey | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dia = params.get("dia") as DayKey | null;
      if (dia && DAY_KEYS.includes(dia)) {
        return dia;
      }
    }
    return null;
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modales ligeros y pestañas operativas de mando
  const [viewMode, setViewMode] = useState<"diario" | "semanal">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "semanal" || window.location.hash.includes("semanal")) {
        return "semanal";
      }
    }
    return "diario";
  });
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [expandedWeekDay, setExpandedWeekDay] = useState<string | null>("sab28");
  const [inspectBlockId, setInspectBlockId] = useState<string | null>(null);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
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
    dayOverride ??
    (santiagoNow.isoDate >= "2026-11-29"
      ? "dom29"
      : santiagoNow.isoDate === "2026-11-28"
      ? "sab28"
      : santiagoNow.isoDate === "2026-11-27"
      ? "vie27"
      : santiagoNow.isoDate === "2026-11-26"
      ? "jue26"
      : "mie25");

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

  const handleLaunchSocialUpload = async (
    platform: "instagram" | "tiktok" | "facebook",
    block?: VideoBlock
  ) => {
    if (block && block.mainAction.copies && block.mainAction.copies.length > 0) {
      let copyText = block.mainAction.copies[0].text;
      if (platform === "facebook") {
        copyText = `${copyText}\n\n🔗 Web oficial: https://tuprofeindustrial-web.vercel.app\n💬 WhatsApp tutorías: https://wa.me/56957936649`;
      }
      await copyTextSafe(copyText);
      showToast(
        platform === "instagram"
          ? "📋 ¡Copy copiado! Abriendo Instagram..."
          : platform === "tiktok"
          ? "📋 ¡Copy copiado! Abriendo TikTok..."
          : "📋 ¡Copy copiado con links web! Abriendo Facebook..."
      );
    } else {
      showToast(
        platform === "instagram"
          ? "📸 Abriendo Instagram Creator..."
          : platform === "tiktok"
          ? "🎵 Abriendo TikTok Upload..."
          : "📘 Abriendo Facebook Fan Page..."
      );
    }
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

  const videosAlertCount = videoBlocks.filter(
    (b) => !completedMap[b.mainAction.id] && isTaskUrgent(b.mainAction)
  ).length;
  const paesDaysLeft = diffDaysFromIso(santiagoNow.isoDate, "2026-11-30");

  // Checklist de todos los subproductos del día
  const allDaySubproducts = useMemo(() => {
    const list: {
      id: string;
      blockId: string;
      timeSlot: string;
      type: "video" | "cover" | "carousel" | "stories" | "copy" | "comment" | "wa";
      name: string;
    }[] = [];

    for (const b of videoBlocks) {
      const times = getSubproductExactTimes(b.timeSlot);
      list.push({
        id: b.mainAction.id,
        blockId: b.id,
        timeSlot: times.video,
        type: "video",
        name: `${times.video} Video Master`,
      });
      if (b.mainAction.assetPreview) {
        list.push({
          id: `${b.id}_cover`,
          blockId: b.id,
          timeSlot: times.cover,
          type: "cover",
          name: `${times.cover} Portada Oficial HD`,
        });
      }
      if (b.carousel) {
        list.push({
          id: `${b.id}_carousel`,
          blockId: b.id,
          timeSlot: times.carousel,
          type: "carousel",
          name: `${times.carousel} Carrusel (${b.carousel.slides.length} láminas)`,
        });
      }
      if (b.stories.length > 0) {
        list.push({
          id: `${b.id}_stories`,
          blockId: b.id,
          timeSlot: times.stories,
          type: "stories",
          name: `${times.stories} Stories (${b.stories.length})`,
        });
      }
      if (b.mainAction.copies && b.mainAction.copies.length > 0) {
        list.push({
          id: `${b.id}_copy`,
          blockId: b.id,
          timeSlot: times.copy,
          type: "copy",
          name: `${times.copy} Copy Publicación`,
        });
        if (b.mainAction.copies.length > 2) {
          list.push({
            id: `${b.id}_comment`,
            blockId: b.id,
            timeSlot: times.comment,
            type: "comment",
            name: `${times.comment} Comentario Alumnos`,
          });
        }
      }
      if (b.associatedActions.length > 0) {
        list.push({
          id: `${b.id}_wa`,
          blockId: b.id,
          timeSlot: times.wa,
          type: "wa",
          name: `${times.wa} Difusión WhatsApp`,
        });
      }
    }
    return list;
  }, [videoBlocks]);

  const totalSubproducts = allDaySubproducts.length;
  const completedSubproductsCount = allDaySubproducts.filter((i) => !!completedMap[i.id]).length;
  const pendingSubproductsCount = totalSubproducts - completedSubproductsCount;
  const checklistPercent =
    totalSubproducts > 0
      ? Math.round((completedSubproductsCount / totalSubproducts) * 100)
      : 0;

  const stats = useMemo(() => {
    const byType = (t: string) => {
      const items = allDaySubproducts.filter((i) => i.type === t);
      const done = items.filter((i) => !!completedMap[i.id]).length;
      return { done, total: items.length };
    };
    return {
      videos: byType("video"),
      covers: byType("cover"),
      carousels: byType("carousel"),
      stories: byType("stories"),
      copies: byType("copy"),
      comments: byType("comment"),
      wa: byType("wa"),
    };
  }, [allDaySubproducts, completedMap]);

  const buildDailyReportText = (): string => {
    return [
      `📊 REPORTE DIARIO DE OPERACIONES · @tuprofeindustrial`,
      `📅 Día: ${currentDayData.fullLabel} (${santiagoNow.timeStr} CLT)`,
      `🎯 Avance Checklist: ${checklistPercent}% (${completedSubproductsCount}/${totalSubproducts} subproductos)`,
      `🎬 Videos en Internet: ${stats.videos.done}/${stats.videos.total}`,
      `🖼️ Portadas Oficiales HD: ${stats.covers.done}/${stats.covers.total}`,
      `📑 Carruseles Educativos: ${stats.carousels.done}/${stats.carousels.total}`,
      `📱 Stories 9:16: ${stats.stories.done}/${stats.stories.total}`,
      `📝 Copies, Comentarios & WA: ${stats.copies.done + stats.comments.done + stats.wa.done}/${stats.copies.total + stats.comments.total + stats.wa.total}`,
      `🎓 Meta PAES M1: Faltan ${paesDaysLeft} días`,
      `🔗 Grilla: ${typeof window !== "undefined" ? window.location.href : "https://tuprofeindustrial-web.vercel.app/grilla"}`,
    ].join("\n");
  };

  const handleCopyDailyReport = async () => {
    const text = buildDailyReportText();
    const ok = await copyTextSafe(text);
    showToast(ok ? "📋 Reporte diario copiado para WhatsApp" : "⚠️ Error al copiar");
  };

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
      id: "lun23",
      day: "Lunes 23 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topicsSummary: "12:30 Simplificar · 17:30 1m² a cm² · 21:15 i² = -1",
      key: null as DayKey | null,
      readiness: {
        ready: [
          "3 Videos publicados en redes (Instagram & TikTok)",
          "Portadas y copies subidos",
          "Archivado en registro histórico",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "Simplificar Fracciones con Letras",
          format: "Reel / TikTok + Stories",
          hook: "El error fatal de tachar términos sumando en vez de factorizar.",
        },
        {
          time: "17:30",
          title: "Convertir 1m² a cm² sin memorizar",
          format: "Reel / TikTok + Stories",
          hook: "El truco visual del cuadrado de 100cm × 100cm = 10.000 cm².",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 03: ¿Por qué i² = -1?",
          format: "Curiosidad Matemática",
          hook: "La necesidad de los números complejos y rotación en 90°.",
        },
      ],
    },
    {
      id: "mar24",
      day: "Martes 24 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topicsSummary: "12:30 Olvido del ± · 17:30 Vértice parábola · 21:15 Secreto π",
      key: null as DayKey | null,
      readiness: {
        ready: [
          "3 Videos publicados en redes",
          "Portadas y copies subidos",
          "Archivado en registro histórico",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "El olvido del ± al sacar raíz cuadrada",
          format: "Reel / TikTok + Stories",
          hook: "x² = 9 tiene dos soluciones: jamás olvides la raíz negativa.",
        },
        {
          time: "17:30",
          title: "Vértice de una Parábola sin fórmulas",
          format: "Reel / TikTok + Stories",
          hook: "El punto medio exacto entre las dos raíces reales.",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 04: El misterio de Pi (π)",
          format: "Curiosidad Matemática",
          hook: "La constante universal que une el perímetro y el diámetro.",
        },
      ],
    },
    {
      id: "mie25",
      day: "Miércoles 25 Nov",
      status: "🟢 Operativo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topicsSummary: "12:30 Discriminante · 17:30 Arista 3D · 21:15 Dividir por 0",
      key: "mie25" as DayKey,
      readiness: {
        ready: [
          "3 Videos MP4 renderizados y subidos a servidor",
          "Portadas en alta resolución",
          "Carrusel de 8 láminas generado",
          "Historias interactivas listas",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "Discriminante en 1 minuto",
          format: "Reel + Carrusel 8 láminas + Stories",
          hook: "¿Corta al eje X en dos puntos, uno o flota en el plano?",
        },
        {
          time: "17:30",
          title: "Duplicar arista de un cubo y su volumen",
          format: "Reel + Cover + Stories",
          hook: "Cuidado: el volumen no se duplica, crece 8 veces (2³).",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 05: No dividir por cero",
          format: "Reel + Cover + Stories",
          hook: "La contradicción matemática que destruiría la lógica numérica.",
        },
      ],
    },
    {
      id: "jue26",
      day: "Jueves 26 Nov (Hoy)",
      status: "🔴 Turno Activo Hoy",
      badgeColor: "bg-red-600 text-white animate-pulse font-black",
      cardBg: "bg-red-50 border-red-400 text-red-950 ring-2 ring-red-200",
      topicsSummary: "12:30 Parábola y Recta · 17:30 Truco Viète · 21:15 Euler + Formulario",
      key: "jue26" as DayKey,
      readiness: {
        ready: [
          "3 Videos MP4 listos en servidor público",
          "3 Portadas de alto impacto listas",
          "Carrusel 8 láminas generado",
          "Stories con stickers de encuesta",
          "Formulario Maestro PAES PDF servido",
        ],
        pending: [
          "Subir a Instagram y TikTok en los turnos",
          "Publicar stories y enviar broadcast a WhatsApp",
        ],
      },
      slots: [
        {
          time: "12:30",
          title: "¿Parábola y Recta se cortan?",
          format: "Reel + Carrusel 8 láminas + Stories",
          hook: "Igualar las ecuaciones y calcular el discriminante en 30 segundos.",
        },
        {
          time: "17:30",
          title: "Truco de las Raíces de Viète",
          format: "Reel + Carrusel 8 láminas + Stories",
          hook: "Suma (-b/a) y producto (c/a) para resolver en 15 seg sin la cuadrática.",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 06: Identidad de Euler",
          format: "Reel + Cover + Stories + PDF Formulario",
          hook: "e^(iπ) + 1 = 0 y descarga exclusiva del Formulario PAES M1.",
        },
      ],
    },
    {
      id: "vie27",
      day: "Viernes 27 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topicsSummary: "12:30 Inecuaciones · 17:30 Máxima Ganancia · 21:15 Copo de Koch",
      key: "vie27" as DayKey,
      readiness: {
        ready: [
          "3 Videos MP4 con copys A/B oficiales",
          "Carrusel 8 láminas con Formulario de Bolsillo",
          "Historias interactivas y encuesta listas",
          "5 hashtags de nicho validados",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "Inecuaciones: trampa del signo",
          format: "Reel / TikTok + Carrusel 8 láminas",
          hook: "El 85% se equivoca al dividir por negativo: el signo se invierte.",
        },
        {
          time: "17:30",
          title: "Máxima Ganancia sin derivar (Vértice)",
          format: "Reel / TikTok + Carrusel 8 láminas + Stories",
          hook: "Precio óptimo en 15 segundos con el vértice de la parábola.",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 07: Fractales (Copo de Koch)",
          format: "Dato Nocturno + Stories",
          hook: "¿Puede una figura tener área finita y perímetro infinito?",
        },
      ],
    },
    {
      id: "sab28",
      day: "Sábado 28 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      topicsSummary: "12:30 Función Inversa · 17:30 Intersección Ejes · 21:15 Identidad Euler",
      key: "sab28" as DayKey,
      readiness: {
        ready: [
          "3 Videos MP4 con copys A/B oficiales",
          "Carrusel 8 láminas con Formulario de Bolsillo",
          "Historias interactivas listas",
          "5 hashtags de nicho validados",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "3 Errores en Función Inversa f⁻¹(x)",
          format: "Reel / TikTok + Carrusel 8 láminas + Stories",
          hook: "¡No confundas f⁻¹(x) con 1/f(x)! Despeje e intercambio de variables.",
        },
        {
          time: "17:30",
          title: "Intersección con los ejes en 10s",
          format: "Reel / TikTok + Carrusel 8 láminas + Stories",
          hook: "Corte eje Y es x=0; corte eje X es y=0. Pregunta fija DEMRE.",
        },
        {
          time: "21:15",
          title: "Dato Nocturno 08: Identidad de Euler",
          format: "Dato Nocturno + Póster PDF",
          hook: "Los 5 números clave de las matemáticas en una sola ecuación: e^(iπ) + 1 = 0.",
        },
      ],
    },
    {
      id: "dom29",
      day: "Domingo 29 Nov",
      status: "🟢 Listo (3/3)",
      badgeColor: "bg-emerald-600 text-white font-black",
      cardBg: "bg-emerald-50 border-purple-300 text-purple-950",
      topicsSummary: "12:30 5 Trampas DEMRE · 17:30 Tiempos 45s · 21:15 Mensaje Confianza",
      key: "dom29" as DayKey,
      readiness: {
        ready: [
          "3 Videos MP4 con copys A/B oficiales",
          "Carrusel 8 láminas: Formulario Maestro de Bolsillo",
          "Historias interactivas de víspera listas",
          "5 hashtags de nicho validados",
        ],
        pending: [],
      },
      slots: [
        {
          time: "12:30",
          title: "5 Trampas DEMRE que más se repiten",
          format: "Reel / TikTok + Carrusel 8 láminas + Stories",
          hook: "Las 5 trampas clásicas antes de guardar los cuadernos.",
        },
        {
          time: "17:30",
          title: "Gestión de Tiempos: Regla de los 45s",
          format: "Reel / TikTok + Stories",
          hook: "No gana quien calcula más, sino quien gestiona el tiempo: 45s o marca y sigue.",
        },
        {
          time: "21:15",
          title: "Mensaje de Confianza del Profe",
          format: "Cierre Cercano + Story de Apoyo",
          hook: "El estudio está hecho: cierra los cuadernos, descansa y confía.",
        },
      ],
    },
    {
      id: "lun30",
      day: "Lunes 30 Nov",
      status: "🎓 ¡DÍA 1 PAES M1!",
      badgeColor: "bg-blue-600 text-white font-black",
      cardBg: "bg-blue-50 border-blue-300 text-blue-950",
      topicsSummary: "08:00 Desayuno y Calma · 14:00 Impresiones M1 · 18:00 Feedback e Intensivos",
      key: null as DayKey | null,
      readiness: {
        ready: [
          "Estrategia de cobertura en vivo de la jornada",
          "Pauta de captación para cursos universitarios y reforzamiento",
        ],
        pending: [
          "Historias en tiempo real desde el local de rendición",
          "Live de feedback tras la prueba",
        ],
      },
      slots: [
        {
          time: "08:00",
          title: "Último Aliento: Cédula, Lápiz N°2 y Calma",
          format: "Story Matutina + Video Ánimo",
          hook: "¡Respira hondo, ya estás listo para dar lo mejor de ti!",
        },
        {
          time: "14:00",
          title: "Primeras Impresiones tras la PAES M1",
          format: "Reel / Story de Reacción",
          hook: "Cómo estuvo la dificultad y cómo sacudirse los nervios para la siguiente.",
        },
        {
          time: "18:00",
          title: "Feedback General y Apertura Cursos Universidad",
          format: "Post / Story de Convocatoria",
          hook: "Para quienes entran a Ingeniería: nivelación de Cálculo y Álgebra.",
        },
      ],
    },
  ];

  const handleCopyWeekDayPlan = async (row: (typeof WEEK_PLAN)[number]) => {
    const lines = [
      `📅 *PLANIFICACIÓN: ${row.day.toUpperCase()}*`,
      `📌 *Estado:* ${row.status}`,
      "",
      `✅ *¿Qué está listo?:*`,
      ...row.readiness.ready.map((item) => `  • ${item}`),
      "",
      row.readiness.pending.length > 0
        ? `⏳ *¿Qué falta por subir/renderizar?:*\n${row.readiness.pending
            .map((item) => `  • ${item}`)
            .join("\n")}\n`
        : "✅ *Contenido 100% producido y listo.*\n",
      "🎬 *TURNOS Y PRODUCTOS:*",
      ...row.slots.map(
        (s) =>
          `⏰ *${s.time}* · ${s.title}\n   Formato: ${s.format}\n   Gancho: "${s.hook}"`
      ),
      "",
      "🎯 *Mando de Operaciones @tuprofeindustrial*",
    ].join("\n");

    const ok = await copyTextSafe(lines);
    showToast(ok ? `📋 Plan de ${row.day} copiado` : "⚠️ Error al copiar");
  };

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
            className={`cursor-pointer touch-manipulation min-h-[32px] rounded-lg text-xs font-black flex items-center justify-center gap-1 transition ${
              viewMode === "diario"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Plan Diario</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("semanal")}
            className={`cursor-pointer touch-manipulation min-h-[32px] rounded-lg text-xs font-black flex items-center justify-center gap-1 transition ${
              viewMode === "semanal"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Plan Semanal</span>
          </button>
        </div>
      </header>

      {/* 2. PANEL DE MÉTRICAS OPERATIVAS Y CONTROL DE TIEMPO */}
      <section className="bg-white rounded-2xl p-2.5 border-2 border-slate-200 shadow-xs shrink-0 space-y-2">
        {/* CABECERA SEMÁFORO CON SELECTOR DE DÍA Y BOTÓN REPORTE */}
        <div className="flex items-center justify-between gap-1 text-xs font-black">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-700 uppercase tracking-wide text-[10.5px]">
              Semáforo de Hoy
            </span>
            <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
              {checklistPercent}%
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* BOTÓN GUARDAR / PANTALLAZO DEL DÍA */}
            <button
              type="button"
              onClick={() => setShowDailyReportModal(true)}
              className="cursor-pointer touch-manipulation px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95"
              title="Guardar o sacar pantallazo del día"
            >
              <Camera className="w-3 h-3" />
              <span>Reporte</span>
            </button>

            {/* SELECTOR RÁPIDO DE DÍA (MIÉ / JUE) */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {DAY_KEYS.map((key) => {
                const active = selectedDay === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDayOverride(key);
                      setViewMode("diario");
                    }}
                    className={`cursor-pointer touch-manipulation px-2 py-0.5 rounded-md text-[10.5px] font-black transition ${
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
          </div>
        </div>

        {/* BARRA COCKPIT FULL-WIDTH DE CUENTA REGRESIVA */}
        <div
          className={`w-full px-3 py-1.5 rounded-xl border flex items-center justify-between font-black text-xs shadow-xs transition ${
            checklistPercent === 100
              ? "bg-emerald-600 text-white border-emerald-700"
              : timeDiffMins !== null && timeDiffMins <= 0
              ? "bg-red-600 text-white border-red-700 animate-pulse"
              : "bg-slate-950 text-amber-300 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate tracking-tight text-[11px]">
              {checklistPercent === 100
                ? "🟢 ¡DÍA CUMPLIDO! Checklist 100% en internet"
                : timeDiffMins !== null && timeDiffMins <= 0
                ? `🚨 TURNO ${nextPendingBlock?.timeSlot} ATRASADO (+${Math.abs(timeDiffMins)}m)`
                : `⏳ PRÓXIMO: ${nextPendingBlock?.timeSlot ?? "12:30"} (en ${Math.floor((timeDiffMins ?? 0) / 60)}h ${(timeDiffMins ?? 0) % 60}m)`}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-90 shrink-0 bg-white/20 px-1.5 py-0.5 rounded ml-1">
            {completedSubproductsCount}/{totalSubproducts} ({checklistPercent}%)
          </span>
        </div>

        {/* SEMÁFORO UNIFICADO EN UN SOLO BLOQUE INTEGRADO */}
        <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-200 divide-x divide-slate-200 text-center bg-slate-50 shadow-xs">
          {/* VERDE: EN INTERNET (CHECKLIST) */}
          <div className={`p-2 transition ${checklistPercent > 0 ? "bg-emerald-50 text-emerald-950" : "bg-white text-slate-700"}`}>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-base font-black leading-none">{checklistPercent}%</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider block mt-0.5 text-emerald-700 leading-none">
              🟢 EN INTERNET
            </span>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5 leading-none truncate">
              {completedSubproductsCount}/{totalSubproducts} subprod.
            </span>
          </div>

          {/* AMARILLO: POR SUBIR (CHECKLIST) */}
          <div className={`p-2 transition ${pendingSubproductsCount > 0 ? "bg-amber-50 text-amber-950" : "bg-white text-slate-700"}`}>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-base font-black leading-none">{100 - checklistPercent}%</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider block mt-0.5 text-amber-700 leading-none">
              🟡 POR SUBIR
            </span>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5 leading-none truncate">
              {pendingSubproductsCount} pendientes
            </span>
          </div>

          {/* ESTADO / AL DÍA */}
          <div
            className={`p-2 transition ${
              videosAlertCount > 0
                ? "bg-red-50 text-red-950 animate-pulse"
                : "bg-white text-slate-700"
            }`}
          >
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-base font-black leading-none">
                {stats.videos.done}/{stats.videos.total} Vid
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider block mt-0.5 text-slate-700 leading-none">
              {checklistPercent === 100 ? "🟢 100% LISTO" : videosAlertCount > 0 ? "🔴 ATRASO" : "⚪ AL DÍA"}
            </span>
            <span className="text-[8px] font-mono opacity-80 mt-0.5 leading-none truncate">
              Meta PAES: {paesDaysLeft}d
            </span>
          </div>
        </div>

        {/* BARRA DE AVANCE GRÁFICA TIPO BATERÍA */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              checklistPercent === 100
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500"
            }`}
            style={{ width: `${Math.max(4, checklistPercent)}%` }}
          />
        </div>
      </section>

      {/* 3. VISTA DIARIA: LISTADO PLEGABLE UNIFICADO */}
      {viewMode === "diario" ? (
        <section className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-200">
            {/* CABECERA DEL LISTADO UNIFICADO */}
            <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[10.5px] font-black text-slate-700 uppercase">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-blue-600" />
                <span>Contenido de Hoy ({videoBlocks.length} Productos)</span>
              </div>
              <span className="text-[10px] text-blue-700 font-bold">Listado Plegable</span>
            </div>

            {/* FILAS PLEGABLES */}
            {videoBlocks.map((block) => {
              const times = getSubproductExactTimes(block.timeSlot);
              const isVideoDone = !!completedMap[block.mainAction.id];
              const isCoverDone = block.mainAction.assetPreview ? !!completedMap[`${block.id}_cover`] : null;
              const isCarouselDone = block.carousel ? !!completedMap[`${block.id}_carousel`] : null;
              const isStoriesDone = block.stories.length > 0 ? !!completedMap[`${block.id}_stories`] : null;
              const hasAlert = isTaskUrgent(block.mainAction);
              const isExpanded = expandedBlockId === block.id;

              const cleanTitle = block.title
                .replace(/^Video.*?: /, "")
                .replace(/^Dato Nocturno.*?: /, "Dato Nocturno: ");

              return (
                <div key={block.id} className="transition-colors">
                  {/* FILA CABECERA CLICKEABLE PARA PLEGAR / DESPLEGAR */}
                  <div
                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                    className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer touch-manipulation transition select-none ${
                      isExpanded
                        ? "bg-blue-50/70"
                        : isVideoDone
                        ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                        : hasAlert
                        ? "bg-red-50/40 hover:bg-red-50/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* HORA Y TÍTULO */}
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span
                        className={`font-mono font-black text-[11px] px-2 py-1 rounded-lg shrink-0 ${
                          isVideoDone
                            ? "bg-emerald-600 text-white"
                            : hasAlert
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-amber-500 text-slate-950"
                        }`}
                      >
                        {block.timeSlot}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black truncate leading-tight text-slate-900">
                          {cleanTitle}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono mt-0.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${
                              isVideoDone
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            🎬 Video {times.video} {isVideoDone ? "✓" : "⏳"}
                          </span>
                          {block.mainAction.assetPreview && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${
                                isCoverDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              🖼️ Cover {times.cover} {isCoverDone ? "✓" : "⏳"}
                            </span>
                          )}
                          {block.carousel && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${
                                isCarouselDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              📑 Carrusel {times.carousel} {isCarouselDone ? "✓" : "⏳"}
                            </span>
                          )}
                          {block.stories.length > 0 && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${
                                isStoriesDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-900"
                              }`}
                            >
                              📱 Story {times.stories} {isStoriesDone ? "✓" : "⏳"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN "EN INTERNET / NO EN INTERNET" + CHEVRON */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(block.mainAction.id);
                        }}
                        className={`cursor-pointer touch-manipulation px-2.5 py-1.5 rounded-xl font-black text-[10.5px] border flex items-center gap-1 shadow-xs transition active:scale-95 ${
                          isVideoDone
                            ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                        }`}
                        title={
                          isVideoDone
                            ? "Publicado en internet. Toca para desmarcar."
                            : "Toca para marcar que ya está en internet"
                        }
                      >
                        {isVideoDone ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>En Internet</span>
                          </>
                        ) : (
                          <span>⚪ No en Internet</span>
                        )}
                      </button>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* BARRA DE ACCIÓN DIRECTA: ENGANCHE DE SUBIDA Y DESCARGA INMEDIATA */}
                  <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-black uppercase text-slate-500">
                        Subir:
                      </span>
                      <a
                        href="https://www.instagram.com/create/select/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchSocialUpload("instagram", block);
                        }}
                        className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-black text-[9.5px] flex items-center gap-0.5 shadow-2xs hover:opacity-90 active:scale-95 transition"
                        title="Copiar Copy y abrir Instagram Creator"
                      >
                        <span>📸 IG</span>
                      </a>
                      <a
                        href="https://www.tiktok.com/upload"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchSocialUpload("tiktok", block);
                        }}
                        className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-lg bg-black text-white font-black text-[9.5px] flex items-center gap-0.5 shadow-2xs hover:bg-slate-800 active:scale-95 transition"
                        title="Copiar Copy y abrir TikTok Upload"
                      >
                        <span>🎵 TT</span>
                      </a>
                      <a
                        href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchSocialUpload("facebook", block);
                        }}
                        className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-[9.5px] flex items-center gap-0.5 shadow-2xs hover:bg-blue-700 active:scale-95 transition"
                        title="Copiar Copy con links y abrir Facebook Fan Page"
                      >
                        <span>📘 FB</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {block.mainAction.videoDownloadUrl && (
                        <a
                          href={block.mainAction.videoDownloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[9px] font-black flex items-center gap-0.5 shadow-2xs hover:bg-slate-800 active:scale-95"
                          title="Descargar Video MP4 vertical"
                        >
                          <Download className="w-2.5 h-2.5" /> MP4
                        </a>
                      )}
                      {block.mainAction.assetPreview && (
                        <a
                          href={block.mainAction.assetPreview.downloadUrl}
                          download={block.mainAction.assetPreview.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 font-mono text-[9px] font-bold flex items-center gap-0.5 shadow-2xs hover:bg-slate-50 active:scale-95"
                          title="Descargar Portada HD"
                        >
                          <Download className="w-2.5 h-2.5" /> Portada
                        </a>
                      )}
                      {block.carousel?.sheetUrl && (
                        <a
                          href={block.carousel.sheetUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-mono text-[9px] font-bold flex items-center gap-0.5 shadow-2xs hover:bg-amber-200 active:scale-95"
                          title="Descargar Hoja Completa de Carrusel"
                        >
                          <Download className="w-2.5 h-2.5" /> Carrusel
                        </a>
                      )}
                      {block.stories.length > 0 && block.stories[0]?.url && (
                        <a
                          href={block.stories[0].url}
                          download={block.stories[0].downloadName}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-md bg-purple-100 border border-purple-300 text-purple-950 font-mono text-[9px] font-bold flex items-center gap-0.5 shadow-2xs hover:bg-purple-200 active:scale-95"
                          title="Descargar Historia 9:16"
                        >
                          <Download className="w-2.5 h-2.5" /> Story
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedBlockId(isExpanded ? null : block.id);
                        }}
                        className="cursor-pointer touch-manipulation px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold flex items-center gap-0.5"
                      >
                        {isExpanded ? "Ocultar" : "Detalle"}
                      </button>
                    </div>
                  </div>

                  {/* CONTENIDO DESPLEGADO: VIDEO ARRIBA + LISTADO CLICKEABLE MINIMALISTA ABAJO */}
                  {isExpanded && (() => {
                    const subproductsList = [
                      {
                        id: block.mainAction.id,
                        time: times.video,
                        name: "1. Video Master (Reels / TikTok)",
                        detail: "Vertical 9:16 con audio calibrado",
                        isDone: !!completedMap[block.mainAction.id],
                        action: (
                          <div className="flex items-center gap-1 shrink-0">
                            {block.mainAction.videoDownloadUrl && (
                              <a
                                href={block.mainAction.videoDownloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9.5px] font-black flex items-center gap-0.5 shadow-xs"
                                title="Descargar Video MP4"
                              >
                                <Download className="w-2.5 h-2.5" /> MP4
                              </a>
                            )}
                            <a
                              href="https://www.instagram.com/create/select/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleLaunchSocialUpload("instagram", block)}
                              className="px-1.5 py-0.5 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-mono text-[9px] font-black shadow-xs"
                              title="Copiar Copy y subir a Instagram"
                            >
                              IG
                            </a>
                            <a
                              href="https://www.tiktok.com/upload"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleLaunchSocialUpload("tiktok", block)}
                              className="px-1.5 py-0.5 rounded bg-black text-white font-mono text-[9px] font-black shadow-xs"
                              title="Copiar Copy y subir a TikTok"
                            >
                              TT
                            </a>
                            <a
                              href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleLaunchSocialUpload("facebook", block)}
                              className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-black shadow-xs"
                              title="Copiar Copy con links y subir a Facebook"
                            >
                              FB
                            </a>
                          </div>
                        ),
                      },
                      ...(block.mainAction.assetPreview
                        ? [
                            {
                              id: `${block.id}_cover`,
                              time: times.cover,
                              name: "2. Portada Oficial HD",
                              detail: "1080×1920 calibrada para Feed",
                              isDone: !!completedMap[`${block.id}_cover`],
                              action: (
                                <a
                                  href={block.mainAction.assetPreview.downloadUrl}
                                  download={block.mainAction.assetPreview.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-[9.5px] font-bold flex items-center gap-0.5 shadow-xs"
                                >
                                  <Download className="w-2.5 h-2.5" /> Bajar
                                </a>
                              ),
                            },
                          ]
                        : []),
                      ...(block.carousel
                        ? [
                            {
                              id: `${block.id}_carousel`,
                              time: times.carousel,
                              name: `3. Carrusel Educativo (${block.carousel.slides.length} láminas)`,
                              detail: "Secuencia didáctica paso a paso",
                              isDone: !!completedMap[`${block.id}_carousel`],
                              action: (
                                <div className="flex items-center gap-1 shrink-0">
                                  {block.carousel.sheetUrl && (
                                    <a
                                      href={block.carousel.sheetUrl}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-mono text-[9.5px] font-bold flex items-center gap-0.5 shadow-xs"
                                    >
                                      <Download className="w-2.5 h-2.5" /> Hoja
                                    </a>
                                  )}
                                  <a
                                    href="https://www.instagram.com/create/select/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleLaunchSocialUpload("instagram", block)}
                                    className="px-1.5 py-0.5 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-mono text-[9px] font-black shadow-xs"
                                    title="Subir carrusel a Instagram"
                                  >
                                    IG
                                  </a>
                                  <a
                                    href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleLaunchSocialUpload("facebook", block)}
                                    className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-black shadow-xs"
                                    title="Subir carrusel a Facebook Fan Page"
                                  >
                                    FB
                                  </a>
                                </div>
                              ),
                            },
                          ]
                        : []),
                      ...(block.stories.length > 0
                        ? [
                            {
                              id: `${block.id}_stories`,
                              time: times.stories,
                              name: `4. Stories de Apoyo (${block.stories.length} láminas)`,
                              detail: "Encuesta y reto 9:16",
                              isDone: !!completedMap[`${block.id}_stories`],
                              action: (
                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={block.stories[0]?.url}
                                    download={block.stories[0]?.downloadName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-mono text-[9.5px] font-bold flex items-center gap-0.5 shadow-xs"
                                  >
                                    <Download className="w-2.5 h-2.5" /> Bajar
                                  </a>
                                  <a
                                    href="https://www.instagram.com/create/select/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleLaunchSocialUpload("instagram", block)}
                                    className="px-1.5 py-0.5 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-mono text-[9px] font-black shadow-xs"
                                    title="Subir story a Instagram"
                                  >
                                    IG
                                  </a>
                                  <a
                                    href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleLaunchSocialUpload("facebook", block)}
                                    className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-black shadow-xs"
                                    title="Subir story a Facebook Fan Page"
                                  >
                                    FB
                                  </a>
                                </div>
                              ),
                            },
                          ]
                        : []),
                      ...(block.mainAction.copies && block.mainAction.copies.length > 0
                        ? [
                            {
                              id: `${block.id}_copy`,
                              time: times.copy,
                              name: "5. Copy / Texto Publicación",
                              detail: block.mainAction.copies[0].text.slice(0, 38) + "...",
                              isDone: !!completedMap[`${block.id}_copy`],
                              action: (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      block.mainAction.copies![0].key,
                                      block.mainAction.copies![0].text
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono text-[9.5px] font-black"
                                >
                                  {copiedKey === block.mainAction.copies[0].key
                                    ? "¡COPIADO!"
                                    : "COPIAR"}
                                </button>
                              ),
                            },
                            ...(block.mainAction.copies.length > 2
                              ? [
                                  {
                                    id: `${block.id}_comment`,
                                    time: times.comment,
                                    name: "6. Primer Comentario Fijado",
                                    detail: "Captación WhatsApp tutorías",
                                    isDone: !!completedMap[`${block.id}_comment`],
                                    action: (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(
                                            block.mainAction.copies![2].key,
                                            block.mainAction.copies![2].text
                                          )
                                        }
                                        className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[9.5px] font-black"
                                      >
                                        {copiedKey === block.mainAction.copies[2].key
                                          ? "¡COPIADO!"
                                          : "COPIAR"}
                                      </button>
                                    ),
                                  },
                                ]
                              : []),
                          ]
                        : []),
                      ...(block.associatedActions.length > 0
                        ? [
                            {
                              id: `${block.id}_wa`,
                              time: times.wa,
                              name: "7. Difusión en Grupos WhatsApp",
                              detail: "Avisar en grupos de alumnos",
                              isDone: !!completedMap[`${block.id}_wa`],
                              action: block.associatedActions[0]?.copies?.[0]?.waShare ? (
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(
                                    block.associatedActions[0].copies[0].text
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 rounded bg-[#25D366] text-white font-mono text-[9.5px] font-black shadow-xs"
                                >
                                  WA
                                </a>
                              ) : null,
                            },
                          ]
                        : []),
                    ];

                    const subDoneCount = subproductsList.filter((s) => s.isDone).length;
                    const subTotalCount = subproductsList.length;
                    const isOnlyVideoDone = isVideoDone && subDoneCount === 1;

                    return (
                      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3 text-xs animate-in fade-in duration-200">
                        {/* 1. REPRODUCTOR DE VIDEO PRINCIPAL */}
                        <div className="bg-black rounded-xl overflow-hidden shadow-xs relative">
                          {block.mainAction.videoDownloadUrl ? (
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              src={block.mainAction.videoDownloadUrl}
                              className="w-full max-h-52 object-contain bg-black"
                            />
                          ) : (
                            <div className="p-4 text-center text-slate-400 text-xs">
                              Video no disponible
                            </div>
                          )}
                          <div className="px-2.5 py-1.5 bg-slate-900 flex items-center justify-between text-white text-xs">
                            <div className="min-w-0 pr-2">
                              <div className="font-mono text-[10.5px] font-bold text-slate-200 truncate">
                                {block.mainAction.videoLabel || "Video Master Vertical (9:16)"}
                              </div>
                              <span className="text-[9px] text-emerald-400 font-mono">
                                {isVideoDone ? "🟢 Video subido a internet" : "🟡 Video pendiente"}
                              </span>
                            </div>
                            {block.mainAction.videoDownloadUrl && (
                              <a
                                href={block.mainAction.videoDownloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer touch-manipulation px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 font-black text-[10px] flex items-center gap-1 shrink-0"
                              >
                                <Download className="w-3 h-3" /> Bajar MP4
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 2. CHECKLIST MINIMALISTA CLICKEABLE DE SUBPRODUCTOS */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                          {/* CABECERA DEL CHECKLIST CON DIAGNÓSTICO */}
                          <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
                            <span className="font-mono font-black text-[10.5px] text-slate-700 uppercase">
                              Checklist: {subDoneCount} de {subTotalCount} subidos
                            </span>
                            <span
                              className={`font-mono text-[9.5px] font-black px-2 py-0.5 rounded ${
                                subDoneCount === subTotalCount
                                  ? "bg-emerald-600 text-white"
                                  : isOnlyVideoDone
                                  ? "bg-amber-500 text-slate-950"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {subDoneCount === subTotalCount
                                ? "🟢 100% SUBIDO"
                                : isOnlyVideoDone
                                ? "🟡 SOLO EL VIDEO"
                                : `${Math.round((subDoneCount / subTotalCount) * 100)}%`}
                            </span>
                          </div>

                          {/* FILAS CLICKEABLES DE CADA SUBPRODUCTO */}
                          <div className="divide-y divide-slate-100">
                            {subproductsList.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => toggleTask(item.id)}
                                className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition select-none ${
                                  item.isDone
                                    ? "bg-emerald-50/50 hover:bg-emerald-50/80"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                {/* Checkbox táctil minimalista y nombre con hora */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                      item.isDone
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-slate-300 text-transparent"
                                    }`}
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>

                                  <span
                                    className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                                      item.isDone
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-slate-900 text-amber-300"
                                    }`}
                                  >
                                    {item.time}
                                  </span>

                                  <div className="min-w-0">
                                    <div
                                      className={`text-xs font-black truncate leading-tight ${
                                        item.isDone
                                          ? "line-through text-slate-400"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                                      {item.detail}
                                    </div>
                                  </div>
                                </div>

                                {/* Botón de acción directo (bajar / copiar) */}
                                <div
                                  className="shrink-0 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.action}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. ATAJOS RÁPIDOS PARA PUBLICAR DIRECTO EN REDES */}
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          <a
                            href="https://www.instagram.com/create/select/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchSocialUpload("instagram", block)}
                            className="cursor-pointer touch-manipulation min-h-[34px] px-1 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition"
                          >
                            <span>📸 Instagram</span>
                          </a>
                          <a
                            href="https://www.tiktok.com/upload"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchSocialUpload("tiktok", block)}
                            className="cursor-pointer touch-manipulation min-h-[34px] px-1 rounded-xl bg-black text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:bg-slate-800 active:scale-95 transition"
                          >
                            <span>🎵 TikTok</span>
                          </a>
                          <a
                            href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchSocialUpload("facebook", block)}
                            className="cursor-pointer touch-manipulation min-h-[34px] px-1 rounded-xl bg-blue-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:bg-blue-700 active:scale-95 transition"
                          >
                            <span>📘 Facebook</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* 4. VISTA SEMANAL: MATRIZ DE TODA LA SEMANA INTERACTIVA */
        <section className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-2">
          <div className="flex items-center justify-between text-[10.5px] font-black text-slate-600 uppercase px-1">
            <span>Planificación Semanal (23–30 Nov)</span>
            <span className="text-blue-700 font-bold">Toca un día para ver qué hay listo</span>
          </div>

          <div className="space-y-2">
            {WEEK_PLAN.map((row) => {
              const isExpanded = expandedWeekDay === row.id;
              return (
                <div
                  key={row.id}
                  className={`rounded-2xl border-2 transition overflow-hidden shadow-xs ${row.cardBg}`}
                >
                  {/* CABECERA DE DÍA (CLICKEABLE) */}
                  <div
                    onClick={() => setExpandedWeekDay(isExpanded ? null : row.id)}
                    className="p-2.5 flex items-center justify-between gap-2 cursor-pointer touch-manipulation select-none hover:opacity-95"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black">{row.day}</span>
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${row.badgeColor}`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-90 truncate mt-0.5 font-medium">
                        {row.topicsSummary}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-600">
                        {isExpanded ? "Ocultar" : "Detalle"}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full bg-white/70 flex items-center justify-center transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                      </div>
                    </div>
                  </div>

                  {/* DESPLIEGUE COMPLETO: QUÉ HAY LISTO VS QUÉ FALTA + 3 TURNOS */}
                  {isExpanded && (
                    <div className="p-2.5 pt-0 border-t border-black/10 space-y-2 text-xs bg-white/60">
                      {/* ESTADO DE PRODUCCIÓN */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="text-[10.5px] font-black uppercase text-slate-800 tracking-wide">
                          📊 Estado de Producción
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2">
                            <div className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>¿Qué está listo?</span>
                            </div>
                            <ul className="space-y-0.5 text-emerald-950 font-medium list-disc list-inside text-[10px]">
                              {row.readiness.ready.map((item, idx) => (
                                <li key={idx} className="leading-tight">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2">
                            <div className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>
                                {row.readiness.pending.length > 0 ? "¿Qué falta?" : "Completado"}
                              </span>
                            </div>
                            {row.readiness.pending.length > 0 ? (
                              <ul className="space-y-0.5 text-amber-950 font-medium list-disc list-inside text-[10px]">
                                {row.readiness.pending.map((item, idx) => (
                                  <li key={idx} className="leading-tight">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-[10px] text-emerald-700 font-bold">
                                Todo el contenido de este día está finalizado y publicado.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CONTENIDOS Y TURNOS DEL DÍA */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="text-[10.5px] font-black uppercase text-slate-800 tracking-wide">
                          🎬 Turnos Planificados (3 Productos)
                        </div>
                        <div className="space-y-1.5">
                          {row.slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-mono font-black text-[10.5px] bg-slate-900 text-white px-1.5 py-0.5 rounded shrink-0">
                                    {slot.time}
                                  </span>
                                  <span className="font-black text-slate-900 text-xs truncate">
                                    {slot.title}
                                  </span>
                                </div>
                                <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                  {slot.format}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-600 italic">
                                &ldquo;{slot.hook}&rdquo;
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BOTONES DE ACCIÓN */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {row.key ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDayOverride(row.key!);
                              setViewMode("diario");
                            }}
                            className="cursor-pointer touch-manipulation flex-1 min-h-[34px] px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <span>⚡ Abrir Mando Diario</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleCopyWeekDayPlan(row)}
                          className="cursor-pointer touch-manipulation flex-1 min-h-[34px] px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copiar Pauta WA</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. ENGANCHE DIRECTO DE SUBIDA A REDES (INSTAGRAM, TIKTOK Y FACEBOOK) */}
      <div className="bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-xs space-y-1.5 shrink-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Enganche Directo de Subida</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-black">
            {checklistPercent}% completado
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <a
            href="https://www.instagram.com/create/select/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLaunchSocialUpload("instagram")}
            className="cursor-pointer touch-manipulation min-h-[36px] px-1 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:opacity-95 active:scale-95 transition"
            title="Abrir Instagram Creator para subir"
          >
            <span>📸 Instagram</span>
          </a>
          <a
            href="https://www.tiktok.com/upload"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLaunchSocialUpload("tiktok")}
            className="cursor-pointer touch-manipulation min-h-[36px] px-1 rounded-xl bg-black text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:bg-slate-800 active:scale-95 transition"
            title="Abrir TikTok Upload para subir"
          >
            <span>🎵 TikTok</span>
          </a>
          <a
            href="https://www.facebook.com/people/Tuprofeindustrial/61596403543170/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLaunchSocialUpload("facebook")}
            className="cursor-pointer touch-manipulation min-h-[36px] px-1 rounded-xl bg-blue-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs hover:bg-blue-700 active:scale-95 transition"
            title="Abrir Fan Page de Facebook para subir"
          >
            <span>📘 Facebook</span>
          </a>
        </div>
      </div>

      {/* 5. ACCESOS DIRECTOS EXTERNOS: MI PÁGINA WEB & SUPERPROF */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 shrink-0">
        <Link
          href="/"
          className="cursor-pointer touch-manipulation min-h-[36px] px-2.5 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-black text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
          title="Abrir landing page pública de tuprofeindustrial"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Mi Página Web</span>
        </Link>
        <a
          href={
            superprofUrl ||
            "https://www.superprof.cl/ingeniero-industrial-diplomado-docencia-innovacion-educacion-superior-clases-calculo-algebra-fisica.html"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer touch-manipulation min-h-[36px] px-2.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl text-xs font-black text-amber-950 flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
          title="Abrir perfil verificado en Superprof Chile"
        >
          <span className="text-amber-500 shrink-0">⭐</span>
          <span className="truncate">Superprof (5.0)</span>
          <ExternalLink className="w-3 h-3 text-amber-700 shrink-0" />
        </a>
      </div>

      {/* 6. BARRA INFERIOR DE ACCESO RÁPIDO CON CONTADOR DE LEADS */}
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
                  <div className="space-y-1.5">
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

                    {/* ATAJOS DIRECTOS PARA SUBIR A REDES SOCIALES */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        href="https://www.instagram.com/create/select/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLaunchSocialUpload("instagram", inspectedBlock)}
                        className="cursor-pointer touch-manipulation min-h-[36px] px-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition"
                      >
                        <span>📸 Subir a Instagram</span>
                      </a>
                      <a
                        href="https://www.tiktok.com/upload"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLaunchSocialUpload("tiktok", inspectedBlock)}
                        className="cursor-pointer touch-manipulation min-h-[36px] px-2 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs hover:bg-slate-800 active:scale-95 transition"
                      >
                        <span>🎵 Subir a TikTok</span>
                      </a>
                    </div>
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
      {/* MODAL REPORTE DIARIO DE CIERRE (PANTALLAZO Y EXPORTACIÓN) */}
      {/* ======================================================== */}
      {showDailyReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-sm p-4 space-y-3.5 shadow-2xl text-white">
            {/* CABECERA PANTALLAZO */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black tracking-tight text-white uppercase">
                    Reporte de Operaciones · Cierre
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentDayData.fullLabel} · {santiagoNow.timeStr} CLT
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDailyReportModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GRAN MEDIDOR DE AVANCE */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                Avance Total del Checklist Diario
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono leading-none">
                {checklistPercent}%
              </div>
              <span className="text-xs text-slate-300 font-bold block mt-1">
                {completedSubproductsCount} de {totalSubproducts} subproductos subidos
              </span>
            </div>

            {/* TABLA RESUMEN POR CATEGORÍAS */}
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>🎬 Videos Reels/TikTok:</span>
                <span className="font-bold text-white">
                  {stats.videos.done}/{stats.videos.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>🖼️ Portadas Oficiales HD:</span>
                <span className="font-bold text-white">
                  {stats.covers.done}/{stats.covers.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>📑 Carruseles Educativos:</span>
                <span className="font-bold text-white">
                  {stats.carousels.done}/{stats.carousels.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>📱 Stories de Apoyo:</span>
                <span className="font-bold text-white">
                  {stats.stories.done}/{stats.stories.total}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>📝 Copies, Comentarios & WA:</span>
                <span className="font-bold text-white">
                  {stats.copies.done + stats.comments.done + stats.wa.done}/
                  {stats.copies.total + stats.comments.total + stats.wa.total}
                </span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN PARA GUARDAR */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyDailyReport}
                className="cursor-pointer touch-manipulation min-h-[40px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildDailyReportText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer touch-manipulation min-h-[40px] px-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Enviar a WA</span>
              </a>
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
