"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Share2,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Users,
  Film,
  Image as ImageIcon,
  Flame,
  Award,
  Download,
  Package,
  Eye,
} from "lucide-react";

interface ActionItem {
  id: string;
  time: string;
  category: "video" | "story" | "carrusel" | "facebook" | "whatsapp";
  role: "matias" | "agente";
  title: string;
  detail: string;
  copyKey?: string;
  status: "alerta" | "proceso" | "listo";
  assetPreview?: {
    type: "portada" | "story" | "carrusel";
    url: string;
    downloadUrl: string;
    name: string;
  };
}

export default function GrillaDecisionPage() {
  const [activeTab, setActiveTab] = useState<"dia" | "semana" | "proyectos" | "productos">("dia");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Checklist persistente en localStorage para seguimiento en tiempo real
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    "task-1230-video": true,
    "task-1300-story": true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tpi_tracking_mie25");
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem("tpi_tracking_mie25", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Textos y plantillas oficiales
  const copyIg1730 = `Si duplicas la arista de un cubo, ¿su volumen se duplica? ⚠️ ¡La trampa clásica de geometría 3D en la PAES!

El volumen se mide en las tres direcciones del espacio: largo, ancho y alto:
V = a · a · a = a³.

Al duplicar la arista (2a), el factor 2 también se eleva al cubo:
V₂ = (2a)³ = 2³ · a³ = 8a³.

El volumen NO crece al doble: ¡crece 8 VECES!
Comprobación con números reales:
• Arista 4 cm ➔ V = 4³ = 64 cm³
• Arista 8 cm ➔ V = 8³ = 512 cm³ (512 / 64 = exactamente 8 veces).

✍️ RETO RÁPIDO: Si triplicas la arista de un cubo, ¿cuántas veces crece su volumen?
📩 Mándaselo a quien dé la PAES para que no caiga en el cazabobos.

Creado con IA. #tuprofeindustrial #paesm1 #geometria #cuerposgeometricos #demre`;

  const copyTikTok1730 = `¿Duplicas la arista de un cubo? ⚠️ ¡No es el doble! El volumen crece 8 veces (2³ = 8). Si triplicas la arista, ¿cuántas veces crece? Déjamelo en comentarios 👇 Creado con IA. #tuprofeindustrial #paesm1 #geometria #cuerposgeometricos #demre`;

  const comment1730 = `📌 Tutorías personalizadas 1 a 1 de Geometría y PAES M1 ($20k / h · Pack PAES $100k). Envíame un mensaje interno (DM) para revisar cupos disponibles 📲`;

  const copyStory1800 = `🚨 RETO RÁPIDO PAES:
Si duplicas la medida de la arista de un cubo, su volumen:
A) Se duplica (x2)
B) Se cuadruplica (x4)
C) Crece 8 veces (x8)
👇 Vota en la encuesta (¡El 85% se equivoca por apurado!)`;

  const copyGruposFbWa = `¡Hola a todos! 👋 Para los que están en la recta final de la PAES M1 (o apoderados con hijos rindiéndola este lunes), les comparto esta cápsula explicativa de 1 minuto sobre la trampa clásica de Geometría 3D: ¿qué pasa con el volumen al duplicar la arista? (No es el doble, ¡crece 8 veces!).

👉 Pueden ver la explicación paso a paso en: https://www.instagram.com/tuprofeindustrial/ o en TikTok @tuprofeindustrial

Además, como docente e Ingeniero Civil Industrial, abrí los últimos 3 cupos para tutorías personalizadas intensivas de última semana ($20.000/h o Pack PAES de 6h a $100.000). Si alguien necesita reforzar, me puede escribir por interno. ¡Mucho éxito a todos! 🎯`;

  const copyNoche2115 = `¿Por qué 1 / 0 rompe las matemáticas? 🌙 La gráfica de 1/x explota a +infinito y -infinito al mismo tiempo. ¿Cuánto da 0 / 0? Comenta tu teoría 👇 Creado con IA. #tuprofeindustrial #datosnocturnos #calculo #algebra #cienciachile`;

  const waTutoria = `¡Hola! Con mucho gusto te puedo apoyar. La tutoría personalizada de 1 hora tiene un valor de $20.000 CLP (online o a domicilio en Santiago). Revisamos dudas puntuales, ejercicios tipo PAES y reforzamos la base paso a paso. ¿Qué día y horario te acomoda más coordinar?`;

  const waPackPaes = `¡Hola! Para esta recta final te recomiendo directamente el Pack PAES: son 6 horas de tutorías personalizadas intensivas por $100.000 CLP (ahorras $20.000 frente a la hora individual). Trabajamos resolución de ensayos, trampas clásicas DEMRE y manejo de tiempo pregunta a pregunta. ¿Te gustaría agendar la primera sesión esta semana?`;

  const waIngenieria = `¡Hola! El programa Intensivo de Ingeniería incluye 36 horas mensuales de acompañamiento integral (Cálculo diferencial/integral, Álgebra Lineal, Física y Nivelación universitaria) por $600.000 CLP al mes, con soporte continuo por WhatsApp para resolución de dudas. Cuéntame qué ramos estás cursando para diseñar tu plan de estudio.`;

  // Lista de acciones del día Miércoles 25
  const dailyActions: ActionItem[] = [
    {
      id: "task-1230-video",
      time: "12:30",
      category: "video",
      role: "matias",
      title: "Video Álgebra: Discriminante Δ = b² - 4ac",
      detail: "Test de 5s para saber si tiene 2, 1 o 0 soluciones. Subir a Reels y TikTok.",
      status: "listo",
      assetPreview: {
        type: "portada",
        url: "/motor-assets/portadas/MIERCOLES-1230-portada-discriminante.jpg",
        downloadUrl: "/motor-assets/portadas/MIERCOLES-1230-portada-discriminante.jpg",
        name: "Portada 12:30 Discriminante",
      },
    },
    {
      id: "task-1300-story",
      time: "13:00",
      category: "story",
      role: "matias",
      title: "Story Encuesta Interacción",
      detail: "Pregunta en Instagram Stories sobre si Δ > 0 corta en 1 o 2 puntos.",
      status: "listo",
      assetPreview: {
        type: "story",
        url: "/motor-assets/historias/miercoles-1230-historia-01-encuesta.png",
        downloadUrl: "/motor-assets/historias/miercoles-1230-historia-01-encuesta.png",
        name: "Historia 13:00 Encuesta",
      },
    },
    {
      id: "task-1730-video",
      time: "17:30",
      category: "video",
      role: "matias",
      title: "Video Geometría 3D: Duplica la Arista (Volumen)",
      detail: "Trampa mortal PAES. Video 62.8s con cubo y 8 subcubos (2³=8). Listo en Mac.",
      copyKey: "ig1730",
      status: "alerta",
      assetPreview: {
        type: "portada",
        url: "/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg",
        downloadUrl: "/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg",
        name: "Portada 17:30 Duplica Arista",
      },
    },
    {
      id: "task-1800-story",
      time: "18:00",
      category: "story",
      role: "matias",
      title: "Story Reto Arista vs Volumen (Sticker de encuesta)",
      detail: "Subir sticker interactivo: ¿El volumen crece el doble o 8 veces?",
      copyKey: "story1800",
      status: "alerta",
      assetPreview: {
        type: "story",
        url: "/motor-assets/historias/miercoles-1730-historia-01-encuesta.png",
        downloadUrl: "/motor-assets/historias/miercoles-1730-historia-01-encuesta.png",
        name: "Historia 18:00 Encuesta Arista",
      },
    },
    {
      id: "task-1830-fb",
      time: "18:30",
      category: "facebook",
      role: "matias",
      title: "Difusión en Grupos de Facebook Apoderados",
      detail: "Compartir cápsula de geometría en grupos de Las Condes, Providencia, Maipú.",
      copyKey: "gruposFbWa",
      status: "proceso",
    },
    {
      id: "task-1900-wa",
      time: "19:00",
      category: "whatsapp",
      role: "matias",
      title: "Difusión en Comunidades de WhatsApp",
      detail: "Mandar mensaje de valor + cupos de tutorías a grupos de estudio PAES.",
      copyKey: "gruposFbWa",
      status: "proceso",
    },
    {
      id: "task-2115-video",
      time: "21:15",
      category: "video",
      role: "matias",
      title: "Dato Nocturno 05: ¿Por qué 1 / 0 rompe las matemáticas?",
      detail: "Asíntota hiperbólica 1/x y el infinito. Video 53.3s listo en Mac.",
      copyKey: "noche2115",
      status: "proceso",
      assetPreview: {
        type: "portada",
        url: "/motor-assets/portadas/MIERCOLES-2115-portada-dividir-por-cero.jpg",
        downloadUrl: "/motor-assets/portadas/MIERCOLES-2115-portada-dividir-por-cero.jpg",
        name: "Portada 21:15 Dividir por 0",
      },
    },
    {
      id: "task-2130-story",
      time: "21:30",
      category: "story",
      role: "matias",
      title: "Story Cierre de Conversión (Pack PAES $100k)",
      detail: "Llamado directo a DM para agendar los últimos cupos del Pack PAES.",
      status: "proceso",
      assetPreview: {
        type: "story",
        url: "/motor-assets/historias/miercoles-1730-historia-02-clases.png",
        downloadUrl: "/motor-assets/historias/miercoles-1730-historia-02-clases.png",
        name: "Historia 21:30 Flyer Clases",
      },
    },
  ];

  // Cálculo de progreso del día
  const totalTasks = dailyActions.length;
  const completedCount = dailyActions.filter((a) => completedTasks[a.id]).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // Radar de fondos y proyectos
  const convocatorias = [
    {
      nombre: "Rendición PAES Regular 2026",
      entidad: "DEMRE / Mineduc",
      dias: 5,
      fecha: "30-Nov-2026",
      monto: "Ingreso Universidad 2027",
      estado: "alerta",
      accion: "Captación intensiva de última semana ($100k Pack PAES).",
    },
    {
      nombre: "CORFO: Semilla Inicia",
      entidad: "CORFO (Llamado Nacional)",
      dias: 115,
      fecha: "20-Mar-2027",
      monto: "$15.000.000 CLP",
      estado: "proceso",
      accion: "Validar tracción de descargas del dossier y métricas de videos en redes.",
    },
    {
      nombre: "Start-Up Chile: Build (Cohorte 1)",
      entidad: "Start-Up Chile / CORFO",
      dias: 141,
      fecha: "15-Abr-2027",
      monto: "$15.000.000 CLP",
      estado: "proceso",
      accion: "Tener video pitch de 90s mostrando el motor automatizado EdTech.",
    },
    {
      nombre: "Sercotec: Capital Semilla Emprende",
      entidad: "Sercotec Santiago",
      dias: 151,
      fecha: "25-Abr-2027",
      monto: "$3.500.000 CLP",
      estado: "listo",
      accion: "Cotizaciones de equipamiento y formalización de empresa.",
    },
    {
      nombre: "Santander X Award Chile",
      entidad: "Banco Santander",
      dias: 157,
      fecha: "01-May-2027",
      monto: "Capital + Aceleración",
      estado: "listo",
      accion: "Registrar perfil del proyecto en la plataforma Santander X.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* ======================================================== */}
      {/* TOPBAR CLARA DE ALTA VISIBILIDAD                         */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              @tuprofeindustrial
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
              Motor TPI V2
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>PAES: 5 DÍAS</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 4 PESTAÑAS: DÍA | SEMANA | PRODUCTOS MOTOR | PROYECTOS   */}
      {/* ======================================================== */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 sticky top-[49px] z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab("dia")}
            className={`py-2 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
              activeTab === "dia"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Hoy</span>
            <span className="text-[9px] font-mono text-amber-700">Mié 25</span>
          </button>

          <button
            onClick={() => setActiveTab("productos")}
            className={`py-2 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
              activeTab === "productos"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Productos</span>
            <span className="text-[9px] font-mono text-purple-700">Descargas</span>
          </button>

          <button
            onClick={() => setActiveTab("semana")}
            className={`py-2 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
              activeTab === "semana"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Semana</span>
            <span className="text-[9px] font-mono text-blue-700">Semana 2</span>
          </button>

          <button
            onClick={() => setActiveTab("proyectos")}
            className={`py-2 text-[11px] font-extrabold rounded-md transition flex flex-col items-center justify-center ${
              activeTab === "proyectos"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Proyectos</span>
            <span className="text-[9px] font-mono text-emerald-700">Fondos</span>
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* ======================================================== */}
        {/* VISTA 1: PROGRAMACIÓN COMPLETA DEL DÍA (HOY)             */}
        {/* ======================================================== */}
        {activeTab === "dia" && (
          <>
            {/* SEMÁFORO DE RESUMEN Y BARRA DE PROGRESO */}
            <section className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Ejecución Miércoles 25 Nov
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {completedCount} de {totalTasks} Acciones Completadas
                  </div>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {progressPercent}%
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Semáforo badges */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-bold text-center">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 py-1 px-1 rounded flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{completedCount} Listo</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 py-1 px-1 rounded flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>3 En Proceso</span>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-800 py-1 px-1 rounded flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                  <span>2 En Alerta</span>
                </div>
              </div>
            </section>

            {/* ALERTA CRÍTICA INMINENTE (17:30 - GEOMETRÍA 3D) */}
            <section className="bg-red-50 border-2 border-red-500 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 tracking-wider shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>🔴 EN ALERTA · ACCIÓN AHORA</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-red-800 bg-white border border-red-200 px-2 py-0.5 rounded">
                  17:30 HRS
                </span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                Video 17:30: Duplica la arista (Geometría 3D)
              </h2>
              <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                ¿Crece el doble o 8 veces? Trampa mortal PAES. Video listo en tu Mac (
                <code className="text-red-700 bg-red-100 px-1 py-0.5 rounded text-[11px] font-mono">
                  MIERCOLES-1730-video-duplica-arista.mp4
                </code>
                ).
              </p>

              {/* Miniatura de Portada Conectada */}
              <div className="my-3 p-2 bg-white rounded-lg border border-red-200 flex items-center gap-3">
                <img
                  src="/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg"
                  alt="Portada 17:30"
                  className="w-14 h-20 object-cover rounded border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    Portada Horneada Frame 0
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2">
                    Lista para usar en Reels / TikTok
                  </div>
                  <a
                    href="/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg"
                    download="MIERCOLES-1730-portada-duplica-arista.jpg"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-700 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded transition"
                  >
                    <Download className="w-3 h-3" /> Descargar al Celular
                  </a>
                </div>
              </div>

              {/* Botones de Copiado Rápido */}
              <div className="space-y-2">
                <button
                  onClick={() => copyToClipboard("ig1730", copyIg1730)}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] transition text-white text-xs font-extrabold py-2.5 px-3 rounded-lg flex items-center justify-between shadow-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    Copiar Copy Completo Instagram (Reel)
                  </span>
                  {copiedKey === "ig1730" ? (
                    <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                      ¡COPIADO!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyToClipboard("tk1730", copyTikTok1730)}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-between"
                  >
                    <span>📱 Copy TikTok (5 tags)</span>
                    {copiedKey === "tk1730" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard("pin1730", comment1730)}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-emerald-700 text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-between"
                  >
                    <span>📌 Comentario Fijado</span>
                    {copiedKey === "pin1730" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* CHECKLIST COMPLETO DEL DÍA (CON ACTIVOS VISUALES) */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Cronograma Detallado de Hoy
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Toca la casilla cuando lo hayas publicado
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  8 Tareas
                </span>
              </div>

              <div className="space-y-2.5">
                {dailyActions.map((action) => {
                  const isChecked = !!completedTasks[action.id];

                  const getCategoryBadge = () => {
                    switch (action.category) {
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
                  };

                  return (
                    <div
                      key={action.id}
                      className={`p-3 rounded-lg border transition ${
                        isChecked
                          ? "bg-slate-50/70 border-slate-200 opacity-60"
                          : action.status === "alerta"
                          ? "bg-red-50/40 border-red-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleTask(action.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 hover:border-slate-400 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono font-bold text-xs text-slate-800">
                              {action.time}
                            </span>
                            {getCategoryBadge()}
                            <span className="text-[10px] font-semibold text-slate-500">
                              {action.role === "matias" ? "👤 Tú ejecutas" : "🤖 IA produce"}
                            </span>
                          </div>

                          <div
                            className={`text-xs font-bold leading-tight ${
                              isChecked ? "line-through text-slate-500" : "text-slate-900"
                            }`}
                          >
                            {action.title}
                          </div>

                          <div className="text-[11px] text-slate-600 mt-1 leading-normal">
                            {action.detail}
                          </div>

                          {/* Previsualización de Imagen Conectada */}
                          {action.assetPreview && !isChecked && (
                            <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={action.assetPreview.url}
                                  alt={action.assetPreview.name}
                                  className="w-10 h-14 object-cover rounded border border-slate-300 shrink-0"
                                />
                                <div className="truncate text-[11px] font-bold text-slate-700">
                                  {action.assetPreview.name}
                                </div>
                              </div>
                              <a
                                href={action.assetPreview.downloadUrl}
                                download
                                className="shrink-0 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded flex items-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> Descargar
                              </a>
                            </div>
                          )}

                          {/* Botón rápido si tiene copy asociado */}
                          {action.copyKey && !isChecked && (
                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Copy preparado
                              </span>
                              <button
                                onClick={() => {
                                  if (action.copyKey === "ig1730") copyToClipboard("ig1730", copyIg1730);
                                  if (action.copyKey === "story1800") copyToClipboard("story1800", copyStory1800);
                                  if (action.copyKey === "gruposFbWa") copyToClipboard("gruposFbWa", copyGruposFbWa);
                                  if (action.copyKey === "noche2115") copyToClipboard("noche2115", copyNoche2115);
                                }}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 active:scale-95"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedKey === action.copyKey ? "¡Copiado!" : "Copiar texto"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECCIÓN RESPUESTAS RÁPIDAS (TUTORÍAS & PRECIOS) */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Respuestas Rápidas para Cotizaciones
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Copia y envía directo cuando te pregunten por WhatsApp
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Tutoría individual (1 hora) ·{" "}
                      <span className="font-mono text-emerald-600 font-extrabold">$20.000 CLP</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Online o domicilio Santiago</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard("wa1", waTutoria)}
                    className="shrink-0 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition"
                  >
                    {copiedKey === "wa1" ? "¡Listo!" : "Copiar"}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50/40 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Pack PAES (6 horas) ·{" "}
                      <span className="font-mono text-emerald-700 font-black">$100.000 CLP</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold">
                      Ahorro $20k · Ensayos y cazabobos intensivos
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard("wa2", waPackPaes)}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition"
                  >
                    {copiedKey === "wa2" ? "¡Listo!" : "Copiar"}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/30 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Intensivo Ingeniería (36h) ·{" "}
                      <span className="font-mono text-purple-700 font-bold">$600.000 CLP</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Mensual · Cálculo, Álgebra y Nivelación</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard("wa3", waIngenieria)}
                    className="shrink-0 bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition"
                  >
                    {copiedKey === "wa3" ? "¡Listo!" : "Copiar"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: 📦 CATÁLOGO COMPLETO DE PRODUCTOS DEL MOTOR     */}
        {/* ======================================================== */}
        {activeTab === "productos" && (
          <section className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  Productos Generados por tu Motor
                </h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  Descarga Móvil
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Láminas, portadas, carruseles y PDFs listos para guardar en tu celular y subir a
                redes.
              </p>
            </div>

            {/* CARRUSEL 17:30 (6 SLIDES COMPLETAS) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    📸 Carrusel 17:30 · Duplica la Arista
                  </div>
                  <div className="text-[10px] text-slate-500">
                    6 Láminas HD (1080×1350 px · Formato 4:5)
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  6 Slides
                </span>
              </div>

              {/* Grid de 6 Láminas con botón de descarga individual */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "01", name: "Portada", file: "slide_01_portada.png" },
                  { id: "02", name: "Enunciado", file: "slide_02_enunciado.png" },
                  { id: "03", name: "Desarrollo", file: "slide_03_desarrollo.png" },
                  { id: "04", name: "Descarte", file: "slide_04_descarte.png" },
                  { id: "05", name: "Formulario", file: "slide_05_formulario.png" },
                  { id: "06", name: "Cierre DM", file: "slide_06_cta_dm.png" },
                ].map((s) => (
                  <div
                    key={s.id}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1 text-center"
                  >
                    <img
                      src={`/motor-assets/carrusel-1730/${s.file}`}
                      alt={s.name}
                      className="w-full h-24 object-cover rounded border border-slate-200"
                    />
                    <div className="text-[9.5px] font-bold text-slate-700 truncate w-full">
                      {s.id}. {s.name}
                    </div>
                    <a
                      href={`/motor-assets/carrusel-1730/${s.file}`}
                      download={`carrusel-1730-${s.file}`}
                      className="w-full text-[9px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 py-0.5 rounded flex items-center justify-center gap-0.5"
                    >
                      <Download className="w-2.5 h-2.5" /> Bajar
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* PACK DE HISTORIAS PARA INSTAGRAM & WHATSAPP */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    📱 Historias del Día (Pack Dual 9:16)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Stickers de encuesta y banners de captación de alumnos
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Historia 17:30 Encuesta */}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-2 text-center">
                  <img
                    src="/motor-assets/historias/miercoles-1730-historia-01-encuesta.png"
                    alt="Historia 17:30 Encuesta"
                    className="w-full h-36 object-cover rounded border border-slate-300"
                  />
                  <div className="text-[11px] font-extrabold text-slate-800">
                    17:30 Encuesta Arista
                  </div>
                  <a
                    href="/motor-assets/historias/miercoles-1730-historia-01-encuesta.png"
                    download="miercoles-1730-historia-01-encuesta.png"
                    className="w-full py-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Descargar PNG
                  </a>
                </div>

                {/* Historia 17:30 Clases */}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-2 text-center">
                  <img
                    src="/motor-assets/historias/miercoles-1730-historia-02-clases.png"
                    alt="Historia 17:30 Clases"
                    className="w-full h-36 object-cover rounded border border-slate-300"
                  />
                  <div className="text-[11px] font-extrabold text-slate-800">
                    Flyer Tutorías $20k/$100k
                  </div>
                  <a
                    href="/motor-assets/historias/miercoles-1730-historia-02-clases.png"
                    download="miercoles-1730-historia-02-clases.png"
                    className="w-full py-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Descargar PNG
                  </a>
                </div>
              </div>
            </div>

            {/* LEAD MAGNET / SIMULACRO PAES M1 PDF */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-emerald-900">
                  📄 Simulacro Oficial PAES M1 (PDF)
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  65 preguntas resueltas · Imán para captar apoderados y alumnos
                </div>
              </div>
              <a
                href="/simulacro-paes-m1.pdf"
                target="_blank"
                download="simulacro-paes-m1.pdf"
                className="shrink-0 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Bajar PDF
              </a>
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
                3 videos diarios + Stories de interacción + Grupos
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Lunes 23 Noviembre</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">
                    100% Completado
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: Álgebra (x+2)/2 · 17:30: 1 m² a cm² · 21:15: i² = -1 · Carrusel 6 slides
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Martes 24 Noviembre</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">
                    100% Completado
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: x² = 25 · 17:30: Vértice parábola · 21:15: ¿Por qué π no tiene esquinas?
                </div>
              </div>

              <div className="p-3 rounded-lg border-2 border-red-500 bg-red-50/30">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    Miércoles 25 Noviembre (HOY)
                  </span>
                  <span className="text-[10px] text-red-700 font-black bg-red-100 px-1.5 py-0.5 rounded">
                    En Ejecución
                  </span>
                </div>
                <div className="text-[11px] text-slate-800 space-y-0.5">
                  <div>• 12:30: Discriminante Cuadrática (✅ Publicado)</div>
                  <div>• 17:30: Duplica la arista (🔴 Pendiente)</div>
                  <div>• 21:15: Dato 05: Dividir por cero (🟡 Noche)</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Jueves 26 Noviembre (Mañana)</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                    Producido
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: Intersección Parábola-Recta · 17:30: Truco de Viète · 21:15: Identidad Euler e^(iπ)+1=0
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Viernes 27 Noviembre</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Programado
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: Inecuaciones trampa · 17:30: Máxima Ganancia · 21:15: Geometría Fractal
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Sábado 28 Noviembre</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Programado
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: Intersección con los ejes · 17:30: Función Inversa · 21:15: Infinito de Hilbert
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Domingo 29 Noviembre</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Víspera PAES
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  • 12:30: Puntos Clave PAES · 17:30: Ritual de Calma · 21:15: Mensaje de Confianza
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* VISTA 4: DÍAS QUE FALTAN PARA POSTULAR A PROYECTOS       */}
        {/* ======================================================== */}
        {activeTab === "proyectos" && (
          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Radar de Fondos y Proyectos 2026-2027
                </h3>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Días restantes calculados para convocatorias CORFO, Sercotec y Start-Up Chile
              </div>
            </div>

            <div className="space-y-2.5">
              {convocatorias.map((c, i) => (
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
                        {c.dias} DÍAS
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400">{c.fecha}</div>
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
              ))}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              💡 <strong>Estrategia de Fondos:</strong> Cada video que subes y cada alumno que
              atiendes genera la métrica de tracción real que CORFO y Start-Up Chile exigen en el
              formulario.
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* ENLACES Y FOOTER CLARO                                   */}
        {/* ======================================================== */}
        <footer className="pt-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/"
              className="bg-white hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              🌐 Ver Landing Web
            </Link>
            <a
              href="https://www.superprof.cl/profesor-particular-matematicas-calculo-algebra-fisica-estadistica-preparacion-paes-ingeniero-civil-industrial.html"
              target="_blank"
              rel="noreferrer"
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 py-2.5 px-3 rounded-lg border border-amber-300 shadow-xs flex items-center justify-center gap-1.5"
            >
              ⭐ Superprof 5.0
            </a>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            TuProfeIndustrial · Grilla Móvil de Decisión · Santiago de Chile
          </div>
        </footer>
      </main>
    </div>
  );
}
