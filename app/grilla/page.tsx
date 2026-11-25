"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ExternalLink,
  MessageCircle,
  Share2,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function GrillaMobilePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Textos y plantillas de decisión inmediata
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

  const copyNoche2115 = `¿Por qué 1 / 0 rompe las matemáticas? 🌙 La gráfica de 1/x explota a +infinito y -infinito al mismo tiempo. ¿Cuánto da 0 / 0? Comenta tu teoría 👇 Creado con IA. #tuprofeindustrial #datosnocturnos #calculo #algebra #cienciachile`;

  // Respuestas rápidas de WhatsApp / DM para cierre de ventas
  const waTutoria = `¡Hola! Con mucho gusto te puedo apoyar. La tutoría personalizada de 1 hora tiene un valor de $20.000 CLP (online o a domicilio en Santiago). Revisamos dudas puntuales, ejercicios tipo PAES y reforzamos la base paso a paso. ¿Qué día y horario te acomoda más coordinar?`;

  const waPackPaes = `¡Hola! Para esta recta final te recomiendo directamente el Pack PAES: son 6 horas de tutorías personalizadas intensivas por $100.000 CLP (ahorras $20.000 frente a la hora individual). Trabajamos resolución de ensayos, trampas clásicas DEMRE y manejo de tiempo pregunta a pregunta. ¿Te gustaría agendar la primera sesión esta semana?`;

  const waIngenieria = `¡Hola! El programa Intensivo de Ingeniería incluye 36 horas mensuales de acompañamiento integral (Cálculo diferencial/integral, Álgebra Lineal, Física y Nivelación universitaria) por $600.000 CLP al mes, con soporte continuo por WhatsApp para resolución de dudas. Cuéntame qué ramos estás cursando para diseñar tu plan de estudio.`;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans pb-16 antialiased selection:bg-red-500 selection:text-white">
      {/* Barra Superior con Semáforo Global */}
      <header className="sticky top-0 z-50 bg-[#0b1322]/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            @tuprofeindustrial
          </span>
          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            Semáforo Operativo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded">
          <Clock className="w-3 h-3" />
          <span>PAES: 5 DÍAS</span>
        </div>
      </header>

      {/* CINTA SEMÁFORO: ESTADO RESUMIDO DE UN VISTAZO */}
      <div className="bg-[#0b1322] border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {/* VERDE: LISTO */}
          <div className="bg-emerald-950/40 border border-emerald-600/50 text-emerald-400 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400" />
            <span>1 LISTO</span>
          </div>

          {/* AMARILLO: EN PROCESO */}
          <div className="bg-amber-950/40 border border-amber-500/50 text-amber-300 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400" />
            <span>1 EN PROCESO</span>
          </div>

          {/* ROJO: EN ALERTA */}
          <div className="bg-red-950/60 border-2 border-red-500 text-red-300 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500" />
            <span>1 EN ALERTA</span>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* ======================================================== */}
        {/* BLOQUE ROJO: EN ALERTA (ACCIÓN INMEDIATA REQUERIDA)      */}
        {/* ======================================================== */}
        <section className="bg-gradient-to-b from-red-950/50 via-[#160a0d] to-[#0d0709] border-2 border-red-500 rounded-xl p-4 shadow-xl shadow-red-950/40 relative overflow-hidden">
          {/* Badge Semáforo Rojo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
              <span>🔴 EN ALERTA · ACCIÓN INMEDIATA</span>
            </div>
            <span className="text-xs font-mono font-bold text-red-300 bg-red-950 border border-red-700/60 px-2 py-0.5 rounded">
              HOY 17:30 HRS
            </span>
          </div>

          <div className="mt-2 mb-2">
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
              Turno Diurno 2 · Geometría 3D PAES
            </div>
            <h2 className="text-base font-extrabold text-white leading-snug">
              Duplica la arista: ¿crece el doble o 8 veces?
            </h2>
          </div>

          <p className="text-xs text-red-100/90 mb-3 leading-relaxed bg-red-950/30 p-2.5 rounded-lg border border-red-800/40">
            ⚠️ <strong>ALERTA DE PUBLICACIÓN:</strong> Video 62.8s con cubo y 8 subcubos (
            <span className="font-mono text-red-300 font-bold">2³ = 8</span>).
            Archivo listo en tu Mac (<code className="text-red-200 text-[10px]">MIERCOLES-1730-video-duplica-arista.mp4</code>).
            Copia el texto abajo y publícalo ya:
          </p>

          {/* Botones de Copiado 1-Tap */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => copyToClipboard("ig1730", copyIg1730)}
              className="w-full flex items-center justify-between bg-red-600 hover:bg-red-500 active:scale-[0.98] transition text-white text-xs font-extrabold py-2.5 px-3 rounded-lg shadow-md shadow-red-950"
            >
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Copiar Copy Completo Instagram (Reels)
              </span>
              {copiedKey === "ig1730" ? (
                <span className="flex items-center gap-1 text-[11px] bg-white text-red-700 font-black px-1.5 py-0.5 rounded">
                  <Check className="w-3 h-3" /> ¡COPIADO!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-red-200" />
              )}
            </button>

            <button
              onClick={() => copyToClipboard("tk1730", copyTikTok1730)}
              className="w-full flex items-center justify-between bg-slate-800/90 hover:bg-slate-800 active:scale-[0.98] transition border border-red-900/60 text-slate-100 text-xs font-bold py-2 px-3 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copiar Copy Corto TikTok (5 tags)
              </span>
              {copiedKey === "tk1730" ? (
                <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> ¡Copiado!
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Tocar</span>
              )}
            </button>

            <button
              onClick={() => copyToClipboard("pin1730", comment1730)}
              className="w-full flex items-center justify-between bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-[0.98] transition border border-emerald-600/60 text-emerald-300 text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Copiar 1er Comentario Fijado (Captación Tutorías)
              </span>
              {copiedKey === "pin1730" ? (
                <span className="text-[11px] text-emerald-300 font-extrabold">¡Copiado!</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">$20k/$100k</span>
              )}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-red-900/40 flex items-center justify-between text-[11px]">
            <a
              href="https://www.tiktok.com/@tuprofeindustrial"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 font-bold flex items-center gap-1 hover:underline"
            >
              Abrir TikTok ↗
            </a>
            <a
              href="https://www.instagram.com/tuprofeindustrial/"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 font-bold flex items-center gap-1 hover:underline"
            >
              Abrir Instagram ↗
            </a>
          </div>
        </section>

        {/* ======================================================== */}
        {/* BLOQUE AMARILLO: EN PROCESO (TURNO NOCTURNO 21:15)       */}
        {/* ======================================================== */}
        <section className="bg-[#11161f] border-2 border-amber-500/70 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[11px] font-black uppercase px-2 py-0.5 rounded-md">
              <Hourglass className="w-3 h-3 text-amber-400" />
              <span>🟡 EN PROCESO · 21:15 HRS</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              PROGRAMADO
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Dato 05: ¿Por qué 1 / 0 rompe las matemáticas?
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              Asíntota hiperbólica 1/x y el infinito. Video 53.3s y portada listos en Mac.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard("noche2115", copyNoche2115)}
            className="w-full flex items-center justify-between bg-amber-500/15 hover:bg-amber-500/25 active:scale-[0.98] transition border border-amber-500/40 text-amber-200 text-xs font-bold py-2 px-3 rounded-lg"
          >
            <span className="flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              Copiar Copy Nocturno 21:15
            </span>
            {copiedKey === "noche2115" ? (
              <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                <Check className="w-3 h-3" /> ¡Listo!
              </span>
            ) : (
              <span className="text-[10px] text-amber-400/80 font-mono">Tocar</span>
            )}
          </button>
        </section>

        {/* ======================================================== */}
        {/* BLOQUE VERDE: LISTO / COMPLETADO (12:30 Y ACTIVOS)       */}
        {/* ======================================================== */}
        <section className="bg-[#0b1322] border-2 border-emerald-500/60 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>🟢 LISTO · COMPLETADO</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              12:30 PUBLICADO
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 space-y-1">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Discriminante Cuadrática (Δ = b² - 4ac)</span>
              <span className="text-[10px] text-emerald-400 font-extrabold">OK</span>
            </div>
            <div className="text-[10px] text-slate-300">
              52.9s · Parábola tocando ejes · Subtítulos Whisper OK
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CIERRE RÁPIDO DE VENTAS (TUTORÍAS OFICIALES)              */}
        {/* ======================================================== */}
        <section className="bg-[#0b1322] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Respuestas Rápidas para DMs & WhatsApp
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
              Tarifas 2026
            </span>
          </div>

          <div className="space-y-2">
            {/* 1h: $20k */}
            <div className="bg-[#101b2f] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">
                  Tutoría Individual (1h) ·{" "}
                  <span className="font-mono text-emerald-400">$20.000 CLP</span>
                </div>
                <div className="text-[10px] text-slate-400">Dudas puntuales, online o domicilio</div>
              </div>
              <button
                onClick={() => copyToClipboard("wa1", waTutoria)}
                className="shrink-0 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold px-2.5 py-1.5 rounded border border-slate-700 flex items-center gap-1 active:scale-95 transition"
              >
                {copiedKey === "wa1" ? (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado
                  </span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>

            {/* Pack PAES: $100k */}
            <div className="bg-[#101b2f] border-2 border-emerald-500/50 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">
                  Pack PAES (6 horas) ·{" "}
                  <span className="font-mono text-emerald-400 font-black">$100.000 CLP</span>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">
                  Ahorro $20k · Ensayos y cazabobos
                </div>
              </div>
              <button
                onClick={() => copyToClipboard("wa2", waPackPaes)}
                className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black px-2.5 py-1.5 rounded flex items-center gap-1 active:scale-95 transition"
              >
                {copiedKey === "wa2" ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado
                  </span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>

            {/* Intensivo Ingeniería: $600k */}
            <div className="bg-[#101b2f] border border-purple-800/40 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">
                  Intensivo Ingeniería (36h) ·{" "}
                  <span className="font-mono text-purple-300 font-bold">$600.000 CLP</span>
                </div>
                <div className="text-[10px] text-slate-400">Mensual · Cálculo, Álgebra y Nivelación</div>
              </div>
              <button
                onClick={() => copyToClipboard("wa3", waIngenieria)}
                className="shrink-0 bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-bold px-2.5 py-1.5 rounded border border-slate-700 flex items-center gap-1 active:scale-95 transition"
              >
                {copiedKey === "wa3" ? (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado
                  </span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* PIE Y ENLACES */}
        <footer className="pt-1 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5"
            >
              🌐 Ver Landing Web
            </Link>
            <a
              href="https://www.superprof.cl/profesor-particular-matematicas-calculo-algebra-fisica-estadistica-preparacion-paes-ingeniero-civil-industrial.html"
              target="_blank"
              rel="noreferrer"
              className="bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 py-2.5 px-3 rounded-lg border border-amber-800/40 flex items-center justify-center gap-1.5"
            >
              ⭐ Superprof 5.0
            </a>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            Semáforo Operativo TPI · 🟢 Listo · 🟡 En Proceso · 🔴 En Alerta
          </div>
        </footer>
      </main>
    </div>
  );
}
