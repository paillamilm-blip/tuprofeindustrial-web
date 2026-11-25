"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Share2,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldAlert,
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
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans pb-16 antialiased selection:bg-cyan-500 selection:text-black">
      {/* Barra Superior Minimalista */}
      <header className="sticky top-0 z-50 bg-[#0b1322]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
            @tuprofeindustrial
          </span>
          <span className="text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
            Cockpit Móvil
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
          <Clock className="w-3 h-3" />
          <span>PAES: 5 DÍAS</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* TARJETA 1: DECISIÓN URGENTE (17:30) */}
        <section className="bg-gradient-to-b from-amber-950/30 via-[#0e1726] to-[#0a101d] border-2 border-amber-500/60 rounded-xl p-4 shadow-lg shadow-amber-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1 tracking-wider">
            <AlertTriangle className="w-3 h-3 fill-black" />
            Acción Inmediata
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold mb-1">
            <span>HOY 17:30 HRS</span>
            <span>·</span>
            <span>DIURNO 2</span>
          </div>

          <h2 className="text-base font-extrabold text-white leading-snug mb-2">
            Duplica la arista: ¿crece el doble o 8 veces?
          </h2>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Trampa mortal PAES de Geometría 3D. Video 62.8s con cubo y 8 subcubos
            (<span className="font-mono font-semibold text-amber-300">2³ = 8</span>).
            Listo en tu Mac.
          </p>

          {/* Botones de Copiado 1-Tap */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => copyToClipboard("ig1730", copyIg1730)}
              className="w-full flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] transition border border-amber-500/40 text-amber-200 text-xs font-bold py-2.5 px-3 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                Copiar Copy Completo Instagram (Reels)
              </span>
              {copiedKey === "ig1730" ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-extrabold">
                  <Check className="w-3.5 h-3.5" /> ¡Copiado!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-amber-400/70" />
              )}
            </button>

            <button
              onClick={() => copyToClipboard("tk1730", copyTikTok1730)}
              className="w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 active:scale-[0.98] transition border border-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copiar Copy Corto TikTok
              </span>
              {copiedKey === "tk1730" ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-extrabold">
                  <Check className="w-3.5 h-3.5" /> ¡Copiado!
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">5 tags</span>
              )}
            </button>

            <button
              onClick={() => copyToClipboard("pin1730", comment1730)}
              className="w-full flex items-center justify-between bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-[0.98] transition border border-emerald-700/50 text-emerald-300 text-xs font-semibold py-2 px-3 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Copiar 1er Comentario Fijado (Captación)
              </span>
              {copiedKey === "pin1730" ? (
                <span className="text-[11px] text-emerald-300 font-extrabold">¡Listo!</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">$20k/$100k</span>
              )}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <a
              href="https://www.tiktok.com/@tuprofeindustrial"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
            >
              Abrir TikTok <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.instagram.com/tuprofeindustrial/"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 font-semibold flex items-center gap-1 hover:underline"
            >
              Abrir Instagram <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>

        {/* TARJETA 2: CIERRE RÁPIDO WHATSAPP / DMs (TOMA DE DECISIONES DE VENTAS) */}
        <section className="bg-[#0b1322] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Respuestas Rápidas para DMs & WhatsApp
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
              3 Tarifas
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Toca cualquier plan para copiar la respuesta oficial lista para enviar al
            apoderado o alumno:
          </p>

          <div className="space-y-2">
            {/* Opción 1: Tutoría $20k */}
            <div className="bg-[#101b2f] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Tutoría Individual (1h)
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    $20.000 CLP
                  </span>
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

            {/* Opción 2: Pack PAES $100k */}
            <div className="bg-[#101b2f] border-2 border-emerald-500/40 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Pack PAES (6 horas)
                  <span className="text-[11px] font-mono text-emerald-400 font-extrabold">
                    $100.000 CLP
                  </span>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">
                  Ahorro $20k · Recta final intensiva
                </div>
              </div>
              <button
                onClick={() => copyToClipboard("wa2", waPackPaes)}
                className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-extrabold px-2.5 py-1.5 rounded flex items-center gap-1 active:scale-95 transition"
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

            {/* Opción 3: Intensivo Ingeniería $600k */}
            <div className="bg-[#101b2f] border border-purple-800/40 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Intensivo Ingeniería (36h)
                  <span className="text-[11px] font-mono text-purple-300 font-bold">
                    $600.000 CLP
                  </span>
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

        {/* TARJETA 3: ESTADO DEL DÍA (MIÉRCOLES 25) */}
        <section className="bg-[#0b1322] border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Turnos Miércoles 25 Nov
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">1 / 3 Publicado</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {/* 12:30 */}
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-400">12:30</span>
                <span className="text-slate-300">Discriminante Cuadrática</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Publicado</span>
            </div>

            {/* 17:30 */}
            <div className="p-2 rounded bg-amber-950/30 border border-amber-600/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-mono text-amber-300 font-bold">17:30</span>
                <span className="text-white font-semibold">Arista 3D y Volumen</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold">En ~30 min</span>
            </div>

            {/* 21:15 */}
            <div className="p-2 rounded bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="font-mono text-purple-300">21:15</span>
                <span className="text-slate-300">Dato 05: Dividir por 0</span>
              </div>
              <button
                onClick={() => copyToClipboard("noche2115", copyNoche2115)}
                className="text-[10px] text-purple-300 font-bold hover:underline flex items-center gap-1"
              >
                {copiedKey === "noche2115" ? "¡Copiado!" : "Copiar copy"}
              </button>
            </div>
          </div>
        </section>

        {/* PIE Y ENLACES EJECUTIVOS */}
        <footer className="pt-2 flex flex-col gap-2">
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

          <div className="text-center text-[10px] font-mono text-slate-500 pt-2">
            TuProfeIndustrial · Motor TPI V2 · Santiago de Chile
          </div>
        </footer>
      </main>
    </div>
  );
}
