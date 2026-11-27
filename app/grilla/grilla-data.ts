export type DayKey = "mie25" | "jue26" | "vie27" | "sab28" | "dom29";

export type CategoryType = "video" | "story" | "carrusel" | "facebook" | "whatsapp";

export interface CopyAction {
  key: string;
  label: string;
  text: string;
  tone?: "primary" | "default" | "green";
  waShare?: boolean;
}

export interface ActionItem {
  id: string;
  time: string;
  minutesFromMidnight: number;
  category: CategoryType;
  role: "matias" | "agente";
  title: string;
  detail: string;
  copies?: CopyAction[];
  openUrl?: { label: string; url: string };
  videoDownloadUrl?: string;
  videoLabel?: string;
  assetPreview?: {
    url: string;
    downloadUrl: string;
    name: string;
  };
}

export interface CarouselGroup {
  id: string;
  title: string;
  subtitle: string;
  folderPath: string;
  sheetUrl?: string;
  slides: { num: string; name: string; file: string }[];
}

export interface StoryAsset {
  id: string;
  title: string;
  tag: string;
  url: string;
  downloadName: string;
}

export interface VideoAsset {
  id: string;
  time: string;
  title: string;
  duration: string;
  mp4Url: string;
  mp4Name: string;
  coverUrl: string;
  coverName: string;
}

export interface DaySchedule {
  key: DayKey;
  shortLabel: string;
  fullLabel: string;
  isoDate: string;
  actions: ActionItem[];
  videos: VideoAsset[];
  carousels: CarouselGroup[];
  stories: StoryAsset[];
  storiesSheetUrl?: string;
}

export const SUPERPROF_URL =
  "https://www.superprof.cl/ingeniero-industrial-diplomado-docencia-innovacion-educacion-superior-clases-calculo-algebra-fisica.html";

export const WEB_URL = "https://tuprofeindustrial-web.vercel.app/";
export const WHATSAPP_URL = "https://wa.me/56957936649";
export const FORMULARIO_MAESTRO_PDF = "/formulario_maestro_ingenieria.pdf";
export const SIMULACRO_M1_PDF = "/simulacro-paes-m1.pdf";

export const QUICK_APPS = [
  { label: "📱 TikTok", url: "https://www.tiktok.com/@tuprofeindustrial" },
  { label: "📸 Instagram", url: "https://www.instagram.com/tuprofeindustrial/" },
  { label: "👥 Facebook", url: "https://www.facebook.com/people/Tuprofeindustrial/61596403543170/" },
  { label: "🚀 Metricool", url: "https://app.metricool.com" },
] as const;

const SLIDE_NAMES_6 = [
  { num: "01", name: "Portada", file: "slide_01_portada.png" },
  { num: "02", name: "Enunciado", file: "slide_02_enunciado.png" },
  { num: "03", name: "Desarrollo", file: "slide_03_desarrollo.png" },
  { num: "04", name: "Descarte", file: "slide_04_descarte.png" },
  { num: "05", name: "Formulario", file: "slide_05_formulario.png" },
  { num: "06", name: "Cierre DM", file: "slide_06_cta_dm.png" },
];

const SLIDE_NAMES_8 = [
  { num: "01", name: "Portada", file: "slide_01_portada.png" },
  { num: "02", name: "2do Gancho", file: "slide_02_segundo_gancho.png" },
  { num: "03", name: "Enunciado", file: "slide_03_enunciado.png" },
  { num: "04", name: "Paso 1", file: "slide_04_paso_1.png" },
  { num: "05", name: "Desarrollo", file: "slide_05_desarrollo_final.png" },
  { num: "06", name: "Descarte", file: "slide_06_descarte.png" },
  { num: "07", name: "Formulario", file: "slide_07_formulario.png" },
  { num: "08", name: "Cierre DM", file: "slide_08_cta_dm.png" },
];

export const DAYS_DATA: Record<DayKey, DaySchedule> = {
  mie25: {
    key: "mie25",
    shortLabel: "Mié 25",
    fullLabel: "Miércoles 25 Nov",
    isoDate: "2026-11-25",
    storiesSheetUrl: "/motor-assets/MIERCOLES-1230-historias-hoja-completa.jpg",
    actions: [
      {
        id: "mie-1230-video",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Álgebra: Discriminante Δ = b² - 4ac",
        detail: "52.9s · Test de 5s para saber si hay 2, 1 o 0 soluciones. Subir a Reels y TikTok.",
        videoDownloadUrl: "/motor-assets/videos/MIERCOLES-1230-video-discriminante.mp4",
        videoLabel: "MIERCOLES-1230-video-discriminante.mp4 (4.8 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/MIERCOLES-1230-portada-discriminante.jpg",
          downloadUrl: "/motor-assets/portadas/MIERCOLES-1230-portada-discriminante.jpg",
          name: "Portada 12:30 Discriminante",
        },
        copies: [
          {
            key: "mie1230-ig",
            label: "📸 Copy Instagram Reels",
            tone: "primary",
            text: `¿2, 1 o 0 soluciones reales en la cuadrática? ⚡ ¡El truco de 5 segundos para la PAES M1!

En x² - 4x + 3 = 0, casi todos pierden minutos aplicando la fórmula completa.
Basta con calcular el discriminante:
Δ = b² - 4ac = (-4)² - 4(1)(3) = 16 - 12 = 4.

Como Δ = 4 > 0, la parábola corta el eje X en DOS puntos reales distintos (x = 1 y x = 3).
• Si Δ > 0 ➔ 2 soluciones reales distintas.
• Si Δ = 0 ➔ 1 solución real única (doble).
• Si Δ < 0 ➔ 0 soluciones reales (no corta el eje).

✍️ RETO: En x² - 6x + 9 = 0, ¿cuántas soluciones reales hay? ¿2, 1 o 0?
📩 Compártelo con tu compa para que ahorre tiempo en la prueba.

Creado con IA. #tuprofeindustrial #paesm1 #algebra #ecuaciones #demre`,
          },
          {
            key: "mie1230-tk",
            label: "📱 Copy Corto TikTok",
            text: `¿Cuántas soluciones tiene x² - 4x + 3 = 0? ⚡ ¡Ahorra 3 minutos en la PAES con el discriminante Δ = b² - 4ac! En x² - 6x + 9 = 0, ¿cuántas soluciones hay? Coméntalo 👇 Creado con IA. #tuprofeindustrial #paesm1 #algebra #ecuaciones #demre`,
          },
          {
            key: "mie1230-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 ¿Quieres asegurar sobre 800 puntos en la PAES M1? Últimos cupos para tutorías personalizadas intensivas ($20.000/h · Pack PAES 6h $100.000, online todo Chile y presencial en RM). Escríbeme por DM para coordinar 📩`,
          },
        ],
      },
      {
        id: "mie-1300-story",
        time: "13:00",
        minutesFromMidnight: 13 * 60,
        category: "story",
        role: "matias",
        title: "Story Encuesta Discriminante",
        detail: "Pregunta en Instagram Stories / Estado WhatsApp sobre x² - 6x + 9 = 0.",
        assetPreview: {
          url: "/motor-assets/historias/miercoles-1230-historia-01-encuesta.png",
          downloadUrl: "/motor-assets/historias/miercoles-1230-historia-01-encuesta.png",
          name: "Historia 12:30 Encuesta PNG",
        },
        copies: [
          {
            key: "mie1300-st",
            label: "📸 Texto Story / Estado WA",
            text: `¿Cuántas soluciones tiene x² - 6x + 9 = 0? ⚡ ¡Ahorra 3 minutos en la PAES! Respóndeme a la encuesta 👇`,
          },
        ],
      },
      {
        id: "mie-1730-video",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Geometría 3D: Duplica la Arista (2³ = 8)",
        detail: "62.8s · Trampa mortal de volumen PAES con cubo 3D de 8 subcubos. Subir a Reels y TikTok.",
        videoDownloadUrl: "/motor-assets/videos/MIERCOLES-1730-video-duplica-arista.mp4",
        videoLabel: "MIERCOLES-1730-video-duplica-arista.mp4 (4.7 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg",
          downloadUrl: "/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg",
          name: "Portada 17:30 Duplica Arista",
        },
        copies: [
          {
            key: "mie1730-ig",
            label: "📸 Copy Instagram Reels",
            tone: "primary",
            text: `Si duplicas la arista de un cubo, ¿su volumen se duplica? ⚠️ ¡La trampa clásica de geometría 3D en la PAES!

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

Creado con IA. #tuprofeindustrial #paesm1 #geometria #cuerposgeometricos #demre`,
          },
          {
            key: "mie1730-tk",
            label: "📱 Copy Corto TikTok (5 tags)",
            text: `¿Duplicas la arista de un cubo? ⚠️ ¡No es el doble! El volumen crece 8 veces (2³ = 8). Si triplicas la arista, ¿cuántas veces crece? Déjamelo en comentarios 👇 Creado con IA. #tuprofeindustrial #paesm1 #geometria #cuerposgeometricos #demre`,
          },
          {
            key: "mie1730-pin",
            label: "📌 1er Comentario Fijado (Tutorías)",
            tone: "green",
            text: `📌 Tutorías personalizadas 1 a 1 de Geometría y PAES M1 ($20.000/h · Pack PAES 6h $100.000). Envíame un mensaje interno (DM) para revisar cupos disponibles 📲`,
          },
        ],
      },
      {
        id: "mie-1800-story",
        time: "18:00",
        minutesFromMidnight: 18 * 60,
        category: "story",
        role: "matias",
        title: "Story Reto Arista vs Volumen (Sticker Encuesta)",
        detail: "Subir lámina 9:16 con sticker interactivo: ¿El volumen crece x2 o x8?",
        assetPreview: {
          url: "/motor-assets/historias/miercoles-1730-historia-01-encuesta.png",
          downloadUrl: "/motor-assets/historias/miercoles-1730-historia-01-encuesta.png",
          name: "Historia 17:30 Encuesta PNG",
        },
        copies: [
          {
            key: "mie1800-st",
            label: "📸 Texto Story Encuesta",
            text: `🚨 RETO RÁPIDO PAES:\nSi duplicas la arista de un cubo, su volumen:\nA) Se duplica (x2)\nB) Se cuadruplica (x4)\nC) Crece 8 veces (x8)\n👇 Vota en la encuesta (¡El 85% cae en el cazabobos!)`,
          },
        ],
      },
      {
        id: "mie-1830-fb",
        time: "18:30",
        minutesFromMidnight: 18 * 60 + 30,
        category: "facebook",
        role: "matias",
        title: "Postear en Grupos Facebook de Apoderados",
        detail: "Compartir truco Geometría 3D + enlaces directos clickeables (Web + WhatsApp) en grupos de Las Condes, Providencia, Maipú y PAES Chile.",
        openUrl: {
          label: "👥 Abrir Grupos PAES en Facebook",
          url: "https://www.facebook.com/groups/search/groups/?q=PAES%20Chile",
        },
        copies: [
          {
            key: "mie1830-fb",
            label: "📋 Copiar Post Grupos FB (con links)",
            tone: "primary",
            text: `¡Hola a todos! 👋 Para quienes están en la recta final de la PAES M1 (o apoderados con hijos rindiéndola el lunes 30), les dejo esta cápsula rápida sobre una de las trampas clásicas de Geometría 3D: ¿si duplicas la arista de un cubo, se duplica su volumen? ❌ No: crece 8 veces (2³ = 8).

🎯 En mi web pueden practicar gratis con la Calculadora PAES y descargar el Simulacro M1 (20 ítems con solucionario paso a paso):
👉 ${WEB_URL}

Como Ingeniero Civil Industrial y docente diplomado (ex-profesor Scuola Italiana), abrí los últimos cupos de tutorías personalizadas intensivas de última semana ($20.000/h o Pack PAES 6 horas por $100.000, online u a domicilio en Santiago).

📲 Escríbeme directo al WhatsApp: ${WHATSAPP_URL}

¡Mucho éxito a todos en esta recta final!`,
          },
        ],
      },
      {
        id: "mie-1900-wa",
        time: "19:00",
        minutesFromMidnight: 19 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Compartir en Comunidades de WhatsApp",
        detail: "Mensaje de valor sin spam con enlace directo a Simulacro PDF y WhatsApp.",
        copies: [
          {
            key: "mie1900-wa",
            label: "💬 Enviar / Copiar para Grupos WhatsApp",
            tone: "green",
            waShare: true,
            text: `Buenas gente, ojo con esta pregunta cazabobos típica del DEMRE en Cuerpos 3D ⚠️

*Si duplicas la arista de un cubo, ¿su volumen se duplica?*
El 70% dice que sí al tiro. ❌ ¡Error fatal!
• Arista ➔ factor 2
• Área de caras ➔ factor 2² = *4 veces*
• Volumen ➔ factor 2³ = *8 veces* 📦

De paso les dejo gratis la Calculadora PAES y un Simulacro M1 de 20 preguntas con solucionario para repasar esta semana 👉 ${WEB_URL}

Si alguien necesita tutorías personalizadas de refuerzo ($20k/h o Pack PAES 6h $100k), me escribe directo acá: ${WHATSAPP_URL} 📲`,
          },
        ],
      },
      {
        id: "mie-2115-video",
        time: "21:15",
        minutesFromMidnight: 21 * 60 + 15,
        category: "video",
        role: "matias",
        title: "Dato Nocturno 05: ¿Por qué 1 / 0 rompe las matemáticas?",
        detail: "53.3s · Asíntota hiperbólica 1/x (+∞ y -∞ opuestos). Ideal para reflexión nocturna.",
        videoDownloadUrl: "/motor-assets/videos/MIERCOLES-2115-noche05-dividir-por-cero.mp4",
        videoLabel: "MIERCOLES-2115-noche05-dividir-por-cero.mp4 (4.4 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/MIERCOLES-2115-portada-dividir-por-cero.jpg",
          downloadUrl: "/motor-assets/portadas/MIERCOLES-2115-portada-dividir-por-cero.jpg",
          name: "Portada 21:15 Dividir por 0",
        },
        copies: [
          {
            key: "mie2115-ig",
            label: "📸 Copy Instagram Reels",
            tone: "primary",
            text: `¿Por qué está estrictamente prohibido dividir por cero en matemáticas? 🌙✨

Desde el colegio te dicen que no se puede, pero casi nadie te muestra qué ocurre en el plano cartesiano.
Al graficar f(x) = 1/x:
1. Si te acercas al cero por la derecha (+0,1; +0,01), la curva explota hacia +∞.
2. Si te acercas por la izquierda (-0,1; -0,01), se desploma hacia -∞.
¡Dos direcciones totalmente opuestas que jamás se encuentran!

Dividir por cero no da infinito: es una INDEFINICIÓN (asíntota vertical). Si se permitiera, podrías demostrar que 1 = 2 y toda la ciencia colapsaría.

✍️ RETO NOCTURNO: ¿Cuánto da 0 / 0? ¿Cero, uno o infinito? Coméntalo antes de dormir.
📩 Compártelo con tu compa de trasnoche de estudio.

Creado con IA. #tuprofeindustrial #datosnocturnos #calculo #algebra #cienciachile`,
          },
          {
            key: "mie2115-tk",
            label: "📱 Copy TikTok",
            text: `¿Por qué 1 / 0 rompe las matemáticas? 🌙 La gráfica de 1/x explota a +infinito y -infinito al mismo tiempo. ¿Cuánto da 0 / 0? Comenta tu teoría 👇 Creado con IA. #tuprofeindustrial #datosnocturnos #calculo #algebra #cienciachile`,
          },
          {
            key: "mie2115-pin",
            label: "📌 1er Comentario Fijado (Ingeniería)",
            tone: "green",
            text: `📌 Tutorías personalizadas de Cálculo I, Álgebra y Nivelación Universitaria ($20.000/h · Intensivo 36h/mes $600.000). Escríbeme por DM para evaluar tu certamen 📩`,
          },
        ],
      },
      {
        id: "mie-2130-story",
        time: "21:30",
        minutesFromMidnight: 21 * 60 + 30,
        category: "story",
        role: "matias",
        title: "Story Nocturna Cierre de Conversión (Pack PAES $100k)",
        detail: "Subir lámina 21:15 de captación con enlace directo a WhatsApp o sticker de DM.",
        assetPreview: {
          url: "/motor-assets/historias/miercoles-2115-historia-02-clases.png",
          downloadUrl: "/motor-assets/historias/miercoles-2115-historia-02-clases.png",
          name: "Historia 21:15 Captación PNG",
        },
        copies: [
          {
            key: "mie2130-st",
            label: "📸 Texto Story Cierre",
            text: `Últimos cupos antes del lunes 30 ⏳ Pack PAES (6 horas de tutorías 1 a 1) a $100.000 CLP. Escríbeme por aquí y aseguramos tus puntos clave 👇`,
          },
        ],
      },
    ],
    videos: [
      {
        id: "v-mie-1230",
        time: "12:30",
        title: "Discriminante Cuadrática (Δ = b² - 4ac)",
        duration: "52.9s",
        mp4Url: "/motor-assets/videos/MIERCOLES-1230-video-discriminante.mp4",
        mp4Name: "MIERCOLES-1230-video-discriminante.mp4",
        coverUrl: "/motor-assets/portadas/MIERCOLES-1230-portada-discriminante.jpg",
        coverName: "MIERCOLES-1230-portada-discriminante.jpg",
      },
      {
        id: "v-mie-1730",
        time: "17:30",
        title: "Geometría 3D: Duplica la Arista (2³ = 8)",
        duration: "62.8s",
        mp4Url: "/motor-assets/videos/MIERCOLES-1730-video-duplica-arista.mp4",
        mp4Name: "MIERCOLES-1730-video-duplica-arista.mp4",
        coverUrl: "/motor-assets/portadas/MIERCOLES-1730-portada-duplica-arista.jpg",
        coverName: "MIERCOLES-1730-portada-duplica-arista.jpg",
      },
      {
        id: "v-mie-2115",
        time: "21:15",
        title: "Dato Nocturno 05: Dividir por Cero (1/x)",
        duration: "53.3s",
        mp4Url: "/motor-assets/videos/MIERCOLES-2115-noche05-dividir-por-cero.mp4",
        mp4Name: "MIERCOLES-2115-noche05-dividir-por-cero.mp4",
        coverUrl: "/motor-assets/portadas/MIERCOLES-2115-portada-dividir-por-cero.jpg",
        coverName: "MIERCOLES-2115-portada-dividir-por-cero.jpg",
      },
    ],
    carousels: [
      {
        id: "c-mie-1730",
        title: "📸 Carrusel 17:30 · Duplica la Arista (3D)",
        subtitle: "6 Láminas HD (1080×1350 px · 4:5)",
        folderPath: "/motor-assets/carrusel-1730",
        slides: SLIDE_NAMES_6,
      },
      {
        id: "c-mie-1230",
        title: "📸 Carrusel 12:30 · El Secreto del Discriminante",
        subtitle: "6 Láminas HD (1080×1350 px · 4:5)",
        folderPath: "/motor-assets/carrusel-1230",
        sheetUrl: "/motor-assets/MIERCOLES-1230-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_6,
      },
    ],
    stories: [
      {
        id: "st-mie-1730-1",
        title: "17:30 Encuesta Arista",
        tag: "Quiz 9:16",
        url: "/motor-assets/historias/miercoles-1730-historia-01-encuesta.png",
        downloadName: "miercoles-1730-historia-01-encuesta.png",
      },
      {
        id: "st-mie-1730-2",
        title: "17:30 Flyer Tutorías",
        tag: "Venta 9:16",
        url: "/motor-assets/historias/miercoles-1730-historia-02-clases.png",
        downloadName: "miercoles-1730-historia-02-clases.png",
      },
      {
        id: "st-mie-2115-1",
        title: "21:15 Encuesta 1/0",
        tag: "Quiz 9:16",
        url: "/motor-assets/historias/miercoles-2115-historia-01-encuesta.png",
        downloadName: "miercoles-2115-historia-01-encuesta.png",
      },
      {
        id: "st-mie-2115-2",
        title: "21:15 Flyer Noche",
        tag: "Venta 9:16",
        url: "/motor-assets/historias/miercoles-2115-historia-02-clases.png",
        downloadName: "miercoles-2115-historia-02-clases.png",
      },
      {
        id: "st-mie-1230-1",
        title: "12:30 Encuesta Δ",
        tag: "Quiz 9:16",
        url: "/motor-assets/historias/miercoles-1230-historia-01-encuesta.png",
        downloadName: "miercoles-1230-historia-01-encuesta.png",
      },
      {
        id: "st-mie-1230-2",
        title: "12:30 Flyer Tutorías",
        tag: "Venta 9:16",
        url: "/motor-assets/historias/miercoles-1230-historia-02-clases.png",
        downloadName: "miercoles-1230-historia-02-clases.png",
      },
    ],
  },
  jue26: {
    key: "jue26",
    shortLabel: "Jue 26",
    fullLabel: "Jueves 26 Nov",
    isoDate: "2026-11-26",
    storiesSheetUrl: "/motor-assets/JUEVES-historias-hoja-completa.jpg",
    actions: [
      {
        id: "jue-1230-video",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Funciones: ¿Parábola y Recta se cortan?",
        detail: "Calibrado 20:43 · Video 9:16 + Carrusel 8 láminas (zona 3:4). Copy Opción A (3 líneas Algoritmo 2026) o B (SEO).",
        videoDownloadUrl: "/motor-assets/videos/JUEVES-1230-video-parabola-recta.mp4",
        videoLabel: "JUEVES-1230-video-parabola-recta.mp4 (4.1 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/JUEVES-1230-portada-parabola-recta.jpg",
          downloadUrl: "/motor-assets/portadas/JUEVES-1230-portada-parabola-recta.jpg",
          name: "Portada 12:30 Parábola-Recta",
        },
        copies: [
          {
            key: "jue1230-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `¿Cuántas veces se cortan esta parábola y esta recta en la PAES? 📐
No grafiques a mano alzada: iguala las ecuaciones y calcula el discriminante Δ en 15 segundos.
Comenta «TANGENTE» y te envío al DM el paso a paso formal y el formulario oficial en PDF.

#tuprofeindustrial #paesm1 #matematicas #funciones #demre`,
          },
          {
            key: "jue1230-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `Uno de los ejercicios clásicos de álgebra y funciones en la PAES M1 es determinar si una recta y una parábola se intersectan en dos puntos, si son tangentes o si no se tocan.

El error típico: intentar graficar a mano alzada en el ensayo y perder 3 minutos valiosos.

La técnica analítica infalible:
1. Igualas ambas ecuaciones: x² = 2x - 1
2. Formas la cuadrática igualada a cero: x² - 2x + 1 = 0
3. Calculas el discriminante: Δ = b² - 4ac = (-2)² - 4(1)(1) = 0
4. Si Δ = 0, son TANGENTES y se tocan en un único punto (1, 1).

💬 RETO: ¿Y si la recta fuera y = 2x - 5? ¿Cuántos puntos de corte tendrían? Déjamelo en los comentarios.
📩 Comenta «TANGENTE» y te envío al DM la guía práctica con los 3 casos de intersección de cónicas para la PAES.

#tuprofeindustrial #paesm1 #matematicas #funciones #demre`,
          },
          {
            key: "jue1230-pin",
            label: "📌 1er Comentario Fijado (Tutorías)",
            tone: "green",
            text: `📌 ¿Quieres asegurar tus últimos puntos en PAES M1? Últimos cupos para tutorías personalizadas intensivas ($20.000/h · Pack PAES 6h $100.000, online todo Chile y presencial en RM). Escríbeme por DM para coordinar 📩`,
          },
        ],
      },
      {
        id: "jue-1300-story",
        time: "13:00",
        minutesFromMidnight: 13 * 60,
        category: "story",
        role: "matias",
        title: "Story Encuesta Parábola vs Recta (Zona Meta 35%)",
        detail: "Lámina recalibrada a zona segura Meta 35% (Y=960–1220 px para pulgar).",
        assetPreview: {
          url: "/motor-assets/historias/jueves-1230-historia-01-encuesta.png",
          downloadUrl: "/motor-assets/historias/jueves-1230-historia-01-encuesta.png",
          name: "Historia 12:30 Encuesta (35% Meta)",
        },
        copies: [
          {
            key: "jue1300-st",
            label: "📸 Texto Story",
            text: `📐 ¿Cuántos puntos de corte tienen y = x² e y = 2x - 5? Vota en la encuesta sin graficar a mano 👇`,
          },
        ],
      },
      {
        id: "jue-1730-video",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Álgebra: Truco de las Raíces de Viète",
        detail: "Calibrado 20:43 · Video 9:16 + Carrusel 8 láminas HD. CTA al Formulario Maestro PDF.",
        videoDownloadUrl: "/motor-assets/videos/JUEVES-1730-video-viete-propiedades.mp4",
        videoLabel: "JUEVES-1730-video-viete-propiedades.mp4 (4.0 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/JUEVES-1730-portada-viete-propiedades.jpg",
          downloadUrl: "/motor-assets/portadas/JUEVES-1730-portada-viete-propiedades.jpg",
          name: "Portada 17:30 Viète",
        },
        copies: [
          {
            key: "jue1730-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `Halla el parámetro k en 5 segundos sin aplicar la fórmula cuadrática ⚡
Con las propiedades de Viète (suma = -b/a y producto = c/a) lo resuelves en 3 pasos mentales.
Comenta «VIETE» y te mando por mensaje privado el formulario maestro imprimible en PDF.

#tuprofeindustrial #paesm1 #algebra #ecuaciones #demre`,
          },
          {
            key: "jue1730-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `En la ecuación x² - 5x + k = 0, te dicen que una raíz es 2 y te piden hallar el valor de k.

El atajo con las Relaciones de Viète:
1. Suma de raíces: x₁ + x₂ = -b/a = -(-5)/1 = 5 ➔ 2 + x₂ = 5 ➔ x₂ = 3
2. Producto de raíces: x₁ · x₂ = c/a ➔ k = 2 · 3 = 6

¡Listo! k = 6 en menos de 20 segundos y sin tocar una sola raíz cuadrada.

💬 RETO RÁPIDO: En x² - 7x + k = 0, si una raíz es 3, ¿cuánto vale k?
📩 Comenta «VIETE» y te envío el formulario maestro imprimible en PDF.

#tuprofeindustrial #paesm1 #algebra #ecuaciones #demre`,
          },
          {
            key: "jue1730-pin",
            label: "📌 1er Comentario Fijado (Tutorías)",
            tone: "green",
            text: `📌 Últimos cupos para tutorías personalizadas PAES M1 ($20.000/h · Pack PAES 6h $100.000). Escríbeme directo por DM para coordinar horarios 📲`,
          },
        ],
      },
      {
        id: "jue-1800-story",
        time: "18:00",
        minutesFromMidnight: 18 * 60,
        category: "story",
        role: "matias",
        title: "Story Reto Viète (Zona Meta 35%)",
        detail: "Lámina recalibrada con espacio exacto para sticker entre Y=960–1220 px.",
        assetPreview: {
          url: "/motor-assets/historias/jueves-1730-historia-01-encuesta.png",
          downloadUrl: "/motor-assets/historias/jueves-1730-historia-01-encuesta.png",
          name: "Historia 17:30 Encuesta (35% Meta)",
        },
        copies: [
          {
            key: "jue1800-st",
            label: "📸 Texto Story Viète",
            text: `⚡ En x² - 7x + k = 0, si una raíz es 3, ¿cuánto vale k?\nA) 4 · B) 10 · C) 12\n👇 Vota en 5 segundos usando Viète`,
          },
        ],
      },
      {
        id: "jue-1830-fb",
        time: "18:30",
        minutesFromMidnight: 18 * 60 + 30,
        category: "facebook",
        role: "matias",
        title: "Postear Truco Viète en Grupos de Facebook",
        detail: "Post optimizado para grupos de apoderados y PAES Chile con enlaces a Web y WhatsApp.",
        openUrl: {
          label: "👥 Abrir Grupos PAES en Facebook",
          url: "https://www.facebook.com/groups/search/groups/?q=PAES%20Chile",
        },
        copies: [
          {
            key: "jue1830-fb",
            label: "📋 Copiar Post Grupos FB",
            tone: "primary",
            text: `Hola a todos quienes preparan la PAES M1/M2 (o apoderados acompañando esta última semana). Les dejo un tip concreto de ahorro de tiempo para ecuaciones cuadráticas con parámetro k:

En x² - 5x + k = 0 con raíz x₁ = 2, no apliquen fórmula larga. Usen Relaciones de Viète:
• Suma x₁ + x₂ = -b/a = 5 ➔ x₂ = 3
• Producto x₁ · x₂ = c/a ➔ k = 2 · 3 = 6.

🎯 Practiquen gratis con la Calculadora PAES y descarguen el Simulacro M1 (20 ítems con solucionario) aquí: ${WEB_URL}

Como Ingeniero Civil Industrial y docente, tengo últimos horarios para tutorías personalizadas ($20.000/h o Pack PAES 6h $100.000).
📲 WhatsApp directo: ${WHATSAPP_URL}`,
          },
        ],
      },
      {
        id: "jue-1900-wa",
        time: "19:00",
        minutesFromMidnight: 19 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Compartir Truco Viète en WhatsApp de Grupos",
        detail: "Botón directo abre WhatsApp para elegir grupo o copiar mensaje + Formulario Maestro.",
        copies: [
          {
            key: "jue1900-wa",
            label: "💬 Enviar / Copiar para Grupos WhatsApp",
            tone: "green",
            waShare: true,
            text: `🔥 *¿Cuánto te demoras en sacar este ejercicio PAES?*
En *x² - 5x + k = 0*, si una raíz es *x₁ = 2*, ¿cuánto vale *k*?
⚡ *Atajo de Viète en 15 seg:*
1️⃣ Suma = -b/a = 5 ➔ x₂ = 3
2️⃣ Producto = c/a ➔ k = 2 · 3 = *6*

Les dejo el Simulacro M1 gratis (20 ítems + solucionario) y Calculadora PAES acá 👉 ${WEB_URL}
Por tutorías personalizadas de última semana ($20k/h o Pack 6h $100k): ${WHATSAPP_URL} 📲`,
          },
        ],
      },
      {
        id: "jue-2115-video",
        time: "21:15",
        minutesFromMidnight: 21 * 60 + 15,
        category: "video",
        role: "matias",
        title: "Dato Nocturno 06: Identidad de Euler e^(iπ) + 1 = 0",
        detail: "Calibrado 20:43 · Blackprint Nocturno · Opción A (3 líneas) u Opción B (Euler completo).",
        videoDownloadUrl: "/motor-assets/videos/JUEVES-2115-noche06-identidad-euler.mp4",
        videoLabel: "JUEVES-2115-noche06-identidad-euler.mp4 (4.3 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/JUEVES-2115-portada-identidad-euler.jpg",
          downloadUrl: "/motor-assets/portadas/JUEVES-2115-portada-identidad-euler.jpg",
          name: "Portada 21:15 Identidad Euler",
        },
        copies: [
          {
            key: "jue2115-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `La fórmula más bella de la ciencia: cómo e, i y π se unen para dar cero 🌙
Elevar e a una potencia imaginaria es un giro en el plano complejo: a 180° llegas a -1.
Comenta «EULER» si vas a dar la PAES M2 o entraste a primer año de ingeniería para enviarte la demostración.

#tuprofeindustrial #matematicas #euler #ciencia #ingenieria`,
          },
          {
            key: "jue2115-b",
            label: "📚 Opción B: Copy Extenso Educativo",
            text: `En 1748, Leonhard Euler logró conectar en una sola línea los 5 números más fundamentales: e, i, π, 1 y 0.

Elevar e a una potencia imaginaria representa un GIRO en el plano complejo: e^(iθ) = cos(θ) + i·sen(θ).
Al girar media vuelta (θ = π = 180°): cos(180°) = -1 y sen(180°) = 0 ➔ e^(iπ) = -1.
Le sumas 1... ¡y cierra en cero!

💬 RETO NOCTURNO: Si giras un cuarto de vuelta (90° = π/2), ¿qué número obtienes?
📩 Comenta «EULER» si vas a dar la PAES M2 o entraste a primer año de ingeniería.

#tuprofeindustrial #matematicas #euler #ciencia #ingenieria`,
          },
          {
            key: "jue2115-pin",
            label: "📌 1er Comentario Fijado (Ingeniería)",
            tone: "green",
            text: `📌 Tutorías personalizadas de Cálculo I, Álgebra Lineal y PAES M1 ($20.000/h · Intensivo 36h/mes $600.000). Envíame un mensaje interno por DM para revisar temarios y cupos 📩`,
          },
        ],
      },
      {
        id: "jue-2130-story",
        time: "21:30",
        minutesFromMidnight: 21 * 60 + 30,
        category: "story",
        role: "matias",
        title: "Story Nocturna Cierre Tutorías Ingeniería & PAES",
        detail: "Lámina 9:16 recalibrada (zona Meta 35% inferior protegida) para cierre nocturno.",
        assetPreview: {
          url: "/motor-assets/historias/jueves-2115-historia-02-clases.png",
          downloadUrl: "/motor-assets/historias/jueves-2115-historia-02-clases.png",
          name: "Historia 21:15 Captación (35% Meta)",
        },
        copies: [
          {
            key: "jue2130-st",
            label: "📸 Texto Story Noche",
            text: `¿Ramos complejos de Ingeniería o recta final PAES? Tutorías 1 a 1 ($20k/h · Pack PAES $100k · Intensivo U $600k). Escríbeme por DM 👇`,
          },
        ],
      },
    ],
    videos: [
      {
        id: "v-jue-1230",
        time: "12:30",
        title: "Intersección Parábola y Recta (Tangencia)",
        duration: "~55s",
        mp4Url: "/motor-assets/videos/JUEVES-1230-video-parabola-recta.mp4",
        mp4Name: "JUEVES-1230-video-parabola-recta.mp4",
        coverUrl: "/motor-assets/portadas/JUEVES-1230-portada-parabola-recta.jpg",
        coverName: "JUEVES-1230-portada-parabola-recta.jpg",
      },
      {
        id: "v-jue-1730",
        time: "17:30",
        title: "Relaciones de Viète (Parámetro k en 20s)",
        duration: "~55s",
        mp4Url: "/motor-assets/videos/JUEVES-1730-video-viete-propiedades.mp4",
        mp4Name: "JUEVES-1730-video-viete-propiedades.mp4",
        coverUrl: "/motor-assets/portadas/JUEVES-1730-portada-viete-propiedades.jpg",
        coverName: "JUEVES-1730-portada-viete-propiedades.jpg",
      },
      {
        id: "v-jue-2115",
        time: "21:15",
        title: "Dato Nocturno 06: Identidad de Euler",
        duration: "~55s",
        mp4Url: "/motor-assets/videos/JUEVES-2115-noche06-identidad-euler.mp4",
        mp4Name: "JUEVES-2115-noche06-identidad-euler.mp4",
        coverUrl: "/motor-assets/portadas/JUEVES-2115-portada-identidad-euler.jpg",
        coverName: "JUEVES-2115-portada-identidad-euler.jpg",
      },
    ],
    carousels: [
      {
        id: "c-jue-1230",
        title: "📸 Carrusel 12:30 · Parábola y Recta (Calibrado)",
        subtitle: "8 Láminas HD (1080×1350 px · Zona Segura 3:4 + Re-serve)",
        folderPath: "/motor-assets/carrusel-jueves-1230",
        sheetUrl: "/motor-assets/JUEVES-1230-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
      {
        id: "c-jue-1730",
        title: "📸 Carrusel 17:30 · Truco de Viète (Calibrado)",
        subtitle: "8 Láminas HD (1080×1350 px · Zona Segura 3:4 + Re-serve)",
        folderPath: "/motor-assets/carrusel-jueves-1730",
        sheetUrl: "/motor-assets/JUEVES-1730-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
    ],
    stories: [
      {
        id: "st-jue-1230-1",
        title: "12:30 Encuesta Recta",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-1230-historia-01-encuesta.png",
        downloadName: "jueves-1230-historia-01-encuesta.png",
      },
      {
        id: "st-jue-1230-2",
        title: "12:30 Flyer Tutorías",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-1230-historia-02-clases.png",
        downloadName: "jueves-1230-historia-02-clases.png",
      },
      {
        id: "st-jue-1730-1",
        title: "17:30 Encuesta Viète",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-1730-historia-01-encuesta.png",
        downloadName: "jueves-1730-historia-01-encuesta.png",
      },
      {
        id: "st-jue-1730-2",
        title: "17:30 Flyer Tutorías",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-1730-historia-02-clases.png",
        downloadName: "jueves-1730-historia-02-clases.png",
      },
      {
        id: "st-jue-2115-1",
        title: "21:15 Encuesta Euler",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-2115-historia-01-encuesta.png",
        downloadName: "jueves-2115-historia-01-encuesta.png",
      },
      {
        id: "st-jue-2115-2",
        title: "21:15 Flyer Noche",
        tag: "Meta 35%",
        url: "/motor-assets/historias/jueves-2115-historia-02-clases.png",
        downloadName: "jueves-2115-historia-02-clases.png",
      },
    ],
  },
  vie27: {
    key: "vie27",
    shortLabel: "Vie 27",
    fullLabel: "Viernes 27 Nov (72h PAES)",
    isoDate: "2026-11-27",
    storiesSheetUrl: "/motor-assets/VIERNES-historias-hoja-completa.jpg",
    actions: [
      {
        id: "vie-1230-video",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Álgebra: Trampa del Signo en Inecuaciones",
        detail: "54.2s · Molde consola_error (#EF4444 -> Cian). Por qué al multiplicar o dividir por -3 se invierte el sentido.",
        videoDownloadUrl: "/motor-assets/videos/VIERNES-1230-video-inecuaciones-signo.mp4",
        videoLabel: "VIERNES-1230-video-inecuaciones-signo.mp4 (4.5 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/VIERNES-1230-portada-inecuaciones-signo.jpg",
          downloadUrl: "/motor-assets/portadas/VIERNES-1230-portada-inecuaciones-signo.jpg",
          name: "Portada 12:30 Inecuaciones Signo",
        },
        copies: [
          {
            key: "vie1230-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `El 85% se equivoca en la PAES al dividir por un número negativo en inecuaciones ⚠️\nSi divides o multiplicas por -3, ¡EL SIGNO DE LA DESIGUALDAD SE INVIERTE! 📐\nComenta «DESIGUALDAD» y te envío al DM la guía práctica con las 5 trampas de inecuaciones y valor absoluto.\n\n#tuprofeindustrial #paesm1 #inecuaciones #algebra #demre`,
          },
          {
            key: "vie1230-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `Uno de los errores más costosos en el eje de Álgebra de la PAES M1 es olvidar la regla de oro de las desigualdades.\n\nEn la inecuación: -3x + 6 >= 15\n1. Restas 6 a ambos lados: -3x >= 9\n2. Y aquí cae la mayoría: dividen por -3 y mantienen el mismo signo (x >= -3) ❌ ¡ERROR GRAVE!\n\nLA REGLA DEL INGENIERO:\nAl multiplicar o dividir por un número negativo en ambos miembros, el sentido de la desigualdad cambia obligatoriamente:\nx <= 9 / (-3)\nx <= -3 ✅\n\nEl conjunto solución son todos los reales menores o iguales a -3: ]-infinito, -3].\n\n💬 RETO: Si la inecuación fuera 4 - 2x < 10, ¿cuál es el intervalo solución para x? Déjamelo en los comentarios.\n\n📩 Comenta «DESIGUALDAD» y te mando por mensaje privado el formulario oficial imprimible en PDF.\n\n#tuprofeindustrial #paesm1 #inecuaciones #algebra #demre`,
          },
          {
            key: "vie1230-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 ¿Invertiste el signo en el reto? Comenta «DESIGUALDAD» para enviarte el formulario de álgebra PAES M1 al DM 📩 Últimos cupos tutorías intensivas.`,
          },
          {
            key: "vie1230-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `🚨 *ALERTA PAES M1 — INECUACIONES* 🚨\nMuchos pierden puntos por esto: si divides por un número negativo, ¡el signo se da vuelta! ⚠️\nRevisa el video de 50 segundos aquí: https://www.instagram.com/tuprofeindustrial/\n¿Dudas con tu ensayo? Escríbeme directo.`,
          },
        ],
      },
      {
        id: "vie-1230-carrusel",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "carrusel",
        role: "matias",
        title: "Carrusel 8 Láminas: Inecuaciones Paso a Paso",
        detail: "8 láminas 4:5 HD con Slide 7 Formulario de Bolsillo y Slide 8 Cierre DM palabra clave DESIGUALDAD.",
      },
      {
        id: "vie-1230-story",
        time: "12:45",
        minutesFromMidnight: 12 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Encuesta Inversión de Signo",
        detail: "Sticker de encuesta: '¿Invertiste el signo al dividir por negativo?' (Opciones: Sí, obvio / Caí 😱).",
      },
      {
        id: "vie-1230-wa",
        time: "13:00",
        minutesFromMidnight: 13 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Tip Inecuaciones",
        detail: "Enviar recordatorio con audio corto y resumen en texto a listas de difusión PAES.",
      },
      {
        id: "vie-1730-video",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Funciones: Máxima Ganancia sin Derivar (El Vértice)",
        detail: "48.7s · Molde consola_pasos / Manim 3D parábola. Vértice xv = -b / (2a) en 15 segundos sin derivadas.",
        videoDownloadUrl: "/motor-assets/videos/VIERNES-1730-video-maxima-ganancia-vertice.mp4",
        videoLabel: "VIERNES-1730-video-maxima-ganancia-vertice.mp4 (4.3 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/VIERNES-1730-portada-maxima-ganancia-vertice.jpg",
          downloadUrl: "/motor-assets/portadas/VIERNES-1730-portada-maxima-ganancia-vertice.jpg",
          name: "Portada 17:30 Máxima Ganancia Vértice",
        },
        copies: [
          {
            key: "vie1730-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `Halla el precio de máxima ganancia en 15 segundos sin usar derivadas ⚡\nEn una función cuadrática cóncava hacia abajo, el punto óptimo siempre vive en el vértice xv = -b / (2a).\nComenta «VERTICE» y te envío al DM el Formulario Maestro en PDF con todos los modelos de optimización.\n\n#tuprofeindustrial #paesm1 #funciones #optimizacion #demre`,
          },
          {
            key: "vie1730-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `En la PAES M1 los problemas de contexto económico son un clásico: te dan una función de ganancia G(x) = -2x² + 40x - 50 (en miles de pesos) y te piden el precio x que maximiza el beneficio.\n\nMuchos estudiantes intentan probar alternativa por alternativa o se confunden buscando fórmulas largas.\n\nEL ATAJO ANALÍTICO:\n1. Identificas los coeficientes: a = -2, b = 40, c = -50.\n2. Como a < 0, la parábola abre hacia abajo y su punto más alto es el VÉRTICE.\n3. Calculas la coordenada x del vértice en 1 paso:\n   xv = -b / (2a) = -40 / (2 · (-2)) = -40 / -4 = 10.\n4. El precio óptimo es x = 10 (miles de pesos).\n\nPara saber la ganancia máxima, solo evalúas G(10):\nG(10) = -2(10)² + 40(10) - 50 = -200 + 400 - 50 = 150 (miles de pesos).\n\n📩 Comenta «VERTICE» y te envío al DM el Formulario Maestro con la guía de parábolas para la PAES.\n\n#tuprofeindustrial #paesm1 #funciones #optimizacion #demre`,
          },
          {
            key: "vie1730-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 ¿Te dio 10 el vértice? Comenta «VERTICE» para recibir la guía completa de optimización de funciones al DM 📩`,
          },
          {
            key: "vie1730-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `📐 *TRUCO DE INGENIERÍA PARA LA PAES* 📐\n¿Problemas de ganancia máxima o costo mínimo? No uses derivadas ni tanteo: el vértice xv = -b/(2a) te da la respuesta en 1 paso.\nVideo explicativo: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "vie-1730-carrusel",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "carrusel",
        role: "matias",
        title: "Carrusel 8 Láminas: Optimización Cuadrática PAES",
        detail: "8 láminas 4:5 HD con Slide 7 Formulario de Bolsillo y Slide 8 Cierre DM palabra clave VERTICE.",
      },
      {
        id: "vie-1730-story",
        time: "17:45",
        minutesFromMidnight: 17 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Convocatoria Tutorías Intensivas",
        detail: "Sticker de DM 17:45: '¿Quieres asegurar 800+ en PAES M1? Escríbeme y coordinamos tutoría intensiva'.",
      },
      {
        id: "vie-1730-wa",
        time: "18:00",
        minutesFromMidnight: 18 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Alerta Cupos Tutoría",
        detail: "Informar últimos 2 cupos para Pack PAES de fin de semana ($100.000 / 6 horas).",
      },
      {
        id: "vie-2115-video",
        time: "21:15",
        minutesFromMidnight: 21 * 60 + 15,
        category: "video",
        role: "matias",
        title: "Dato Nocturno 07: El Copo de Koch (Fractales)",
        detail: "51.3s · Molde dato_nocturno (Negro Carbón satinado #080F18 e Índigo Lunar). Perímetro infinito y área finita.",
        videoDownloadUrl: "/motor-assets/videos/VIERNES-2115-noche07-copo-koch.mp4",
        videoLabel: "VIERNES-2115-noche07-copo-koch.mp4 (4.6 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/VIERNES-2115-portada-copo-koch.jpg",
          downloadUrl: "/motor-assets/portadas/VIERNES-2115-portada-copo-koch.jpg",
          name: "Portada 21:15 Copo de Koch",
        },
        copies: [
          {
            key: "vie2115-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `¿Puede una figura geométrica tener área finita pero perímetro infinito? ❄️\nEl Copo de Nieve de Koch demuestra que el infinito cabe perfectamente dentro de la palma de tu mano.\nComenta «FRACTAL» y te envío al DM el desglose matemático formal para Cálculo y Álgebra Lineal.\n\n#tuprofeindustrial #calculo #ingenieria #geometria #fractales`,
          },
          {
            key: "vie2115-b",
            label: "📚 Opción B: Copy Extenso Educativo",
            text: `DATO NOCTURNO: En 1904, el matemático Helge von Koch describió una curva que desafió la intuición geométrica de su época.\n\nComienzas con un triángulo equilátero. En cada iteración, divides cada lado en tres partes iguales y levantas un nuevo triángulo sobre el tercio medio.\n\nLA PARADOJA:\n• En cada paso, el número de lados se multiplica por 4 y su longitud se reduce a 1/3.\n• El perímetro total se multiplica por (4/3) en cada iteración.\n• Como (4/3)ⁿ crece indefinidamente cuando n tiende a infinito, ¡su perímetro es estrictamente INFINITO!\n• Sin embargo, la figura jamás sale de un círculo delimitador cerrado: su área es FINITA (exactamente 8/5 del triángulo original).\n\nEl infinito matemático no siempre está a millones de kilómetros: puede estar plegado en la superficie de un copo de nieve.\n\n📩 Si eres estudiante de Ingeniería, Cálculo o Física, comenta «FRACTAL» y te envío el apunte universitario completo.\n\n#tuprofeindustrial #calculo #ingenieria #geometria #fractales`,
          },
          {
            key: "vie2115-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `🌙 ¿Te apasiona la matemática universitaria? Comenta «FRACTAL» para recibir el paper en PDF de geometría fractal.`,
          },
          {
            key: "vie2115-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `🌙 *DATO NOCTURNO — FRACTALES* 🌙\n¿Una figura con perímetro infinito en un área finita? Descubre el copo de Koch en nuestro video nocturno: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "vie-2115-story",
        time: "21:30",
        minutesFromMidnight: 21 * 60 + 30,
        category: "story",
        role: "matias",
        title: "Story 9:16: Apunte Universitario Fractales",
        detail: "Muestra visual del fractal animado y enlace a descarga de PDF para alumnos de Ingeniería.",
      },
      {
        id: "vie-2115-wa",
        time: "21:45",
        minutesFromMidnight: 21 * 60 + 45,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Cierre de Jornada",
        detail: "Mensaje de buenas noches y cuenta regresiva: Faltan 3 días para la PAES M1.",
      },
    ],
    videos: [
      {
        id: "vie-1230-video",
        time: "12:30",
        title: "PAES M1: Trampa del Signo en Inecuaciones",
        duration: "54.2s",
        mp4Url: "/motor-assets/videos/VIERNES-1230-video-inecuaciones-signo.mp4",
        mp4Name: "VIERNES-1230-video-inecuaciones-signo.mp4",
        coverUrl: "/motor-assets/portadas/VIERNES-1230-portada-inecuaciones-signo.jpg",
        coverName: "VIERNES-1230-portada-inecuaciones-signo.jpg",
      },
      {
        id: "vie-1730-video",
        time: "17:30",
        title: "PAES M1: Máxima Ganancia sin Derivar (El Vértice)",
        duration: "48.7s",
        mp4Url: "/motor-assets/videos/VIERNES-1730-video-maxima-ganancia-vertice.mp4",
        mp4Name: "VIERNES-1730-video-maxima-ganancia-vertice.mp4",
        coverUrl: "/motor-assets/portadas/VIERNES-1730-portada-maxima-ganancia-vertice.jpg",
        coverName: "VIERNES-1730-portada-maxima-ganancia-vertice.jpg",
      },
      {
        id: "vie-2115-video",
        time: "21:15",
        title: "Dato Nocturno: El Copo de Koch (Fractales)",
        duration: "51.3s",
        mp4Url: "/motor-assets/videos/VIERNES-2115-noche07-copo-koch.mp4",
        mp4Name: "VIERNES-2115-noche07-copo-koch.mp4",
        coverUrl: "/motor-assets/portadas/VIERNES-2115-portada-copo-koch.jpg",
        coverName: "VIERNES-2115-portada-copo-koch.jpg",
      },
    ],
    carousels: [
      {
        id: "c-vie-1230",
        title: "📸 Carrusel 12:30 · Inecuaciones: trampa del signo",
        subtitle: "8 Láminas HD (Slide 7 Formulario de Bolsillo)",
        folderPath: "/motor-assets/carrusel-viernes-1230",
        sheetUrl: "/motor-assets/VIERNES-1230-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
      {
        id: "c-vie-1730",
        title: "📸 Carrusel 17:30 · Máxima Ganancia sin derivar",
        subtitle: "8 Láminas HD (Slide 7 Formulario de Bolsillo)",
        folderPath: "/motor-assets/carrusel-viernes-1730",
        sheetUrl: "/motor-assets/VIERNES-1730-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
    ],
    stories: [
      {
        id: "st-vie-1230-1",
        title: "12:45 Encuesta Inecuación",
        tag: "Interacción 9:16",
        url: "/motor-assets/historias/viernes-1230-inecuaciones-trampa-signo-historia-01-encuesta.png",
        downloadName: "viernes-1230-inecuaciones-trampa-signo-historia-01-encuesta.png",
      },
      {
        id: "st-vie-1230-2",
        title: "12:45 Formulario DM",
        tag: "Conversión 9:16",
        url: "/motor-assets/historias/viernes-1230-inecuaciones-trampa-signo-historia-02-clases.png",
        downloadName: "viernes-1230-inecuaciones-trampa-signo-historia-02-clases.png",
      },
      {
        id: "st-vie-1730-1",
        title: "17:45 Parábola Vértice",
        tag: "Visual 9:16",
        url: "/motor-assets/historias/viernes-1730-maxima-ganancia-vertice-historia-01-encuesta.png",
        downloadName: "viernes-1730-maxima-ganancia-vertice-historia-01-encuesta.png",
      },
      {
        id: "st-vie-1730-2",
        title: "17:45 Cupos Tutoría",
        tag: "Venta 9:16",
        url: "/motor-assets/historias/viernes-1730-maxima-ganancia-vertice-historia-02-clases.png",
        downloadName: "viernes-1730-maxima-ganancia-vertice-historia-02-clases.png",
      },
      {
        id: "st-vie-2115-1",
        title: "21:30 Fractal Koch",
        tag: "Ciencia 9:16",
        url: "/motor-assets/historias/viernes-2115-fractal-copo-koch-historia-01-encuesta.png",
        downloadName: "viernes-2115-fractal-copo-koch-historia-01-encuesta.png",
      },
      {
        id: "st-vie-2115-2",
        title: "21:30 Buenas Noches",
        tag: "Comunidad 9:16",
        url: "/motor-assets/historias/viernes-2115-fractal-copo-koch-historia-02-clases.png",
        downloadName: "viernes-2115-fractal-copo-koch-historia-02-clases.png",
      },
    ],
  },
  sab28: {
    key: "sab28",
    shortLabel: "Sáb 28",
    fullLabel: "Sábado 28 Nov (48h PAES)",
    isoDate: "2026-11-28",
    storiesSheetUrl: "/motor-assets/SABADO-historias-hoja-completa.jpg",
    actions: [
      {
        id: "sab-1230-video",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Álgebra: 3 Errores en Función Inversa f⁻¹(x)",
        detail: "52.0s · Molde tres_errores. No confundir con 1/f(x). Despejar x e intercambiar variables paso a paso.",
        videoDownloadUrl: "/motor-assets/videos/SABADO-1230-video-funcion-inversa.mp4",
        videoLabel: "SABADO-1230-video-funcion-inversa.mp4 (4.4 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/SABADO-1230-portada-funcion-inversa.jpg",
          downloadUrl: "/motor-assets/portadas/SABADO-1230-portada-funcion-inversa.jpg",
          name: "Portada 12:30 Función Inversa",
        },
        copies: [
          {
            key: "sab1230-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `¡No confundas f⁻¹(x) con 1/f(x)! ❌ El 80% cae en esta confusión de notación en la PAES.\nDespeja x y luego intercambia variables.\nComenta «INVERSA» y te envío la chuleta oficial al DM.\n\n#tuprofeindustrial #paesm1 #funciones #algebra #demre`,
          },
          {
            key: "sab1230-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `Uno de los errores más frecuentes en la PAES M1/M2 es asumir que f⁻¹(x) es el inverso multiplicativo 1/f(x).\n\nPara hallar la función inversa de f(x) = (2x + 1) / (x - 3):\n1. Cambias f(x) por y: y = (2x + 1) / (x - 3)\n2. Despejas la incógnita x: y(x - 3) = 2x + 1 -> yx - 2x = 3y + 1 -> x(y - 2) = 3y + 1 -> x = (3y + 1) / (y - 2)\n3. Intercambias variables para la notación formal: f⁻¹(x) = (3x + 1) / (x - 2) ✅\n\n📩 Comenta «INVERSA» y te mando por DM la chuleta oficial en PDF con todos los tipos de inversa.\n\n#tuprofeindustrial #paesm1 #funciones #algebra #demre`,
          },
          {
            key: "sab1230-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 ¿Despejaste bien la x? Comenta «INVERSA» para recibir la chuleta oficial en PDF al DM 📩`,
          },
          {
            key: "sab1230-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `🚨 *ERROR CLÁSICO EN FUNCIONES PAES* 🚨\nNo confundas la función inversa con 1/f(x). Despeja x e intercambia variables.\nVideo explicativo de 50s: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "sab-1230-carrusel",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "carrusel",
        role: "matias",
        title: "Carrusel 8 Láminas: Función Inversa PAES",
        detail: "8 láminas 4:5 HD con Slide 7 Formulario de Bolsillo y Slide 8 Cierre DM palabra clave INVERSA.",
      },
      {
        id: "sab-1230-story",
        time: "12:45",
        minutesFromMidnight: 12 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Encuesta Notación Inversa",
        detail: "Sticker de encuesta: '¿Confundes f⁻¹(x) con 1/f(x)?' (Opciones: Jamás / A veces 😅).",
      },
      {
        id: "sab-1230-wa",
        time: "13:00",
        minutesFromMidnight: 13 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Tip Función Inversa",
        detail: "Broadcast con audio y recordatorio de notación matemática para PAES.",
      },
      {
        id: "sab-1730-video",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Geometría: Intersección con los Ejes en 10s",
        detail: "47.5s · Molde consola_pasos. Para cortar al eje Y haz x=0; para cortar al eje X haz y=0. Pregunta fija.",
        videoDownloadUrl: "/motor-assets/videos/SABADO-1730-video-interseccion-ejes.mp4",
        videoLabel: "SABADO-1730-video-interseccion-ejes.mp4 (4.2 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/SABADO-1730-portada-interseccion-ejes.jpg",
          downloadUrl: "/motor-assets/portadas/SABADO-1730-portada-interseccion-ejes.jpg",
          name: "Portada 17:30 Intersección Ejes",
        },
        copies: [
          {
            key: "sab1730-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `No te compliques buscando cortes con los ejes en la PAES 📐\nPara cortar al eje Y haz x=0; para cortar al eje X haz y=0.\nComenta «EJES» y te mando el formulario imprimible.\n\n#tuprofeindustrial #paesm1 #geometria #graficos #demre`,
          },
          {
            key: "sab1730-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `Pregunta fija de la PAES M1: ¿dónde intersecta la recta o parábola a los ejes coordenados?\n\nREGLA RÁPIDA DE 10 SEGUNDOS:\n1. Corte con el Eje Y: La coordenada x SIEMPRE vale 0. En y = mx + n, el corte es (0, n).\n2. Corte con el Eje X: La coordenada y SIEMPRE vale 0. Resuelves 0 = mx + n -> x = -n/m.\n\nEn una parábola y = ax² + bx + c:\n• Corte con eje Y: (0, c) directo en 1 segundo.\n• Corte con eje X: Resuelves la cuadrática (las raíces x₁ y x₂).\n\n📩 Comenta «EJES» y te envío al DM el formulario imprimible de bolsillo.\n\n#tuprofeindustrial #paesm1 #geometria #graficos #demre`,
          },
          {
            key: "sab1730-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 Eje Y es x=0, Eje X es y=0. Comenta «EJES» para recibir la guía completa imprimible al DM 📩`,
          },
          {
            key: "sab1730-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `📐 *PAES M1: CORTES CON LOS EJES EN 10 SEGUNDOS* 📐\nPara cortar al eje Y haz x=0; para cortar al eje X haz y=0. ¡Pregunta asegurada en la prueba!\nVideo paso a paso: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "sab-1730-carrusel",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "carrusel",
        role: "matias",
        title: "Carrusel 8 Láminas: Cortes con los Ejes en el Plano",
        detail: "8 láminas 4:5 HD con Slide 7 Formulario de Bolsillo y Slide 8 Cierre DM palabra clave EJES.",
      },
      {
        id: "sab-1730-story",
        time: "17:45",
        minutesFromMidnight: 17 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Regla de los Ejes",
        detail: "Guarda este post: Eje Y es x=0, Eje X es y=0. Pregunta fija de la prueba.",
      },
      {
        id: "sab-1730-wa",
        time: "18:00",
        minutesFromMidnight: 18 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Recordatorio Ejes",
        detail: "Compartir lámina resumen de cortes en el plano cartesiano.",
      },
      {
        id: "sab-2115-video",
        time: "21:15",
        minutesFromMidnight: 21 * 60 + 15,
        category: "video",
        role: "matias",
        title: "Dato Nocturno 08: Identidad de Euler (e^(iπ) + 1 = 0)",
        detail: "53.8s · Molde dato_nocturno (Blackprint). Los 5 números supremos unidos en una sola ecuación.",
        videoDownloadUrl: "/motor-assets/videos/SABADO-2115-noche08-identidad-euler.mp4",
        videoLabel: "SABADO-2115-noche08-identidad-euler.mp4 (4.7 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/SABADO-2115-portada-identidad-euler.jpg",
          downloadUrl: "/motor-assets/portadas/SABADO-2115-portada-identidad-euler.jpg",
          name: "Portada 21:15 Identidad de Euler",
        },
        copies: [
          {
            key: "sab2115-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `Los 5 números más importantes de las matemáticas unidos en una sola ecuación 🌙\ne, i, π, 1 y 0 en e^(iπ) + 1 = 0.\nComenta «EULER» y te envío el poster de alta resolución en PDF.\n\n#tuprofeindustrial #matematicas #calculo #euler #ciencia`,
          },
          {
            key: "sab2115-b",
            label: "📚 Opción B: Copy Extenso Educativo",
            text: `DATO NOCTURNO: Considerada la fórmula más bella de la historia matemática, la Identidad de Euler conecta cinco constantes fundamentales:\n• e: la base de los logaritmos naturales y el crecimiento orgánico.\n• i: la unidad imaginaria raíz de -1.\n• π: la razón universal entre la circunferencia y su diámetro.\n• 1: el elemento neutro de la multiplicación.\n• 0: el origen de la recta numérica.\n\nSurge de la fórmula de Euler: e^(ix) = cos(x) + i·sen(x). Evaluando en x = π: e^(iπ) = -1 + 0 = -1 -> e^(iπ) + 1 = 0.\n\n📩 Comenta «EULER» para recibir el poster de alta resolución en PDF.\n\n#tuprofeindustrial #matematicas #calculo #euler #ciencia`,
          },
          {
            key: "sab2115-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `🌙 ¿Cuál es tu constante favorita entre e, i y π? Comenta «EULER» para enviarte el poster de estudio al DM.`,
          },
          {
            key: "sab2115-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `🌙 *DATO NOCTURNO: IDENTIDAD DE EULER* 🌙\nLos 5 números supremos de la ciencia en una sola línea: e^(iπ) + 1 = 0.\nVideo: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "sab-2115-story",
        time: "21:30",
        minutesFromMidnight: 21 * 60 + 30,
        category: "story",
        role: "matias",
        title: "Story 9:16: Poster de Euler",
        detail: "Muestra del poster HD de la Identidad de Euler disponible para descarga de estudiantes.",
      },
      {
        id: "sab-2115-wa",
        time: "21:45",
        minutesFromMidnight: 21 * 60 + 45,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: A 48h de la PAES",
        detail: "Mensaje motivacional de cierre de sábado.",
      },
    ],
    videos: [
      {
        id: "sab-1230-video",
        time: "12:30",
        title: "PAES M1/M2: 3 Errores en Función Inversa f⁻¹(x)",
        duration: "52.0s",
        mp4Url: "/motor-assets/videos/SABADO-1230-video-funcion-inversa.mp4",
        mp4Name: "SABADO-1230-video-funcion-inversa.mp4",
        coverUrl: "/motor-assets/portadas/SABADO-1230-portada-funcion-inversa.jpg",
        coverName: "SABADO-1230-portada-funcion-inversa.jpg",
      },
      {
        id: "sab-1730-video",
        time: "17:30",
        title: "PAES M1: Intersección con los Ejes en 10 Segundos",
        duration: "47.5s",
        mp4Url: "/motor-assets/videos/SABADO-1730-video-interseccion-ejes.mp4",
        mp4Name: "SABADO-1730-video-interseccion-ejes.mp4",
        coverUrl: "/motor-assets/portadas/SABADO-1730-portada-interseccion-ejes.jpg",
        coverName: "SABADO-1730-portada-interseccion-ejes.jpg",
      },
      {
        id: "sab-2115-video",
        time: "21:15",
        title: "Dato Nocturno: La Identidad de Euler (e^(iπ) + 1 = 0)",
        duration: "53.8s",
        mp4Url: "/motor-assets/videos/SABADO-2115-noche08-identidad-euler.mp4",
        mp4Name: "SABADO-2115-noche08-identidad-euler.mp4",
        coverUrl: "/motor-assets/portadas/SABADO-2115-portada-identidad-euler.jpg",
        coverName: "SABADO-2115-portada-identidad-euler.jpg",
      },
    ],
    carousels: [
      {
        id: "c-sab-1230",
        title: "📸 Carrusel 12:30 · 3 Errores en Función Inversa",
        subtitle: "8 Láminas HD (Slide 7 Formulario de Bolsillo)",
        folderPath: "/motor-assets/carrusel-sabado-1230",
        sheetUrl: "/motor-assets/SABADO-1230-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
      {
        id: "c-sab-1730",
        title: "📸 Carrusel 17:30 · Intersección con los Ejes",
        subtitle: "8 Láminas HD (Slide 7 Formulario de Bolsillo)",
        folderPath: "/motor-assets/carrusel-sabado-1730",
        sheetUrl: "/motor-assets/SABADO-1730-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
    ],
    stories: [
      {
        id: "st-sab-1230-1",
        title: "12:45 Encuesta Inversa",
        tag: "Interacción 9:16",
        url: "/motor-assets/historias/sabado-1230-tres-errores-funcion-inversa-historia-01-encuesta.png",
        downloadName: "sabado-1230-tres-errores-funcion-inversa-historia-01-encuesta.png",
      },
      {
        id: "st-sab-1230-2",
        title: "12:45 Formulario Inversa",
        tag: "Conversión 9:16",
        url: "/motor-assets/historias/sabado-1230-tres-errores-funcion-inversa-historia-02-clases.png",
        downloadName: "sabado-1230-tres-errores-funcion-inversa-historia-02-clases.png",
      },
      {
        id: "st-sab-1730-1",
        title: "17:45 Cortes en Plano",
        tag: "Visual 9:16",
        url: "/motor-assets/historias/sabado-1730-interseccion-ejes-10s-historia-01-encuesta.png",
        downloadName: "sabado-1730-interseccion-ejes-10s-historia-01-encuesta.png",
      },
      {
        id: "st-sab-1730-2",
        title: "17:45 Formulario Ejes",
        tag: "Conversión 9:16",
        url: "/motor-assets/historias/sabado-1730-interseccion-ejes-10s-historia-02-clases.png",
        downloadName: "sabado-1730-interseccion-ejes-10s-historia-02-clases.png",
      },
      {
        id: "st-sab-2115-1",
        title: "21:30 Poster Euler",
        tag: "Ciencia 9:16",
        url: "/motor-assets/historias/sabado-2115-identidad-euler-poster-historia-01-encuesta.png",
        downloadName: "sabado-2115-identidad-euler-poster-historia-01-encuesta.png",
      },
      {
        id: "st-sab-2115-2",
        title: "21:30 Buenas Noches Sábado",
        tag: "Comunidad 9:16",
        url: "/motor-assets/historias/sabado-2115-identidad-euler-poster-historia-02-clases.png",
        downloadName: "sabado-2115-identidad-euler-poster-historia-02-clases.png",
      },
    ],
  },
  dom29: {
    key: "dom29",
    shortLabel: "Dom 29",
    fullLabel: "Domingo 29 Nov (Víspera PAES)",
    isoDate: "2026-11-29",
    storiesSheetUrl: "/motor-assets/DOMINGO-historias-hoja-completa.jpg",
    actions: [
      {
        id: "dom-1230-video",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Estrategia: Las 5 Trampas del DEMRE que más se repiten",
        detail: "55.0s · Molde consola_error. Los 5 errores de lectura y signos que cuestan 100 puntos en la PAES M1.",
        videoDownloadUrl: "/motor-assets/videos/DOMINGO-1230-video-5-trampas-demre.mp4",
        videoLabel: "DOMINGO-1230-video-5-trampas-demre.mp4 (4.8 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/DOMINGO-1230-portada-5-trampas-demre.jpg",
          downloadUrl: "/motor-assets/portadas/DOMINGO-1230-portada-5-trampas-demre.jpg",
          name: "Portada 12:30 5 Trampas DEMRE",
        },
        copies: [
          {
            key: "dom1230-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `Si vas a repasar algo hoy antes de la PAES, que sean estas 5 trampas clásicas ⚠️\nGuarda este video para revisar antes de entrar a la sala.\nComenta «REPASO» para el PDF completo con el Formulario de Bolsillo.\n\n#tuprofeindustrial #paesm1 #paes2026 #tipsdemre #demre`,
          },
          {
            key: "dom1230-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `A 24 horas de la PAES M1, el 90% de los puntos que se pierden no son por falta de materia, sino por trampas de lectura del DEMRE:\n1. Preguntan por 2x y marcas x.\n2. Olvidar que x² = 9 tiene dos soluciones (3 y -3).\n3. Inecuaciones: dividir por negativo invierte la desigualdad.\n4. Porcentajes: '¿Qué porcentaje es A de B?' no es lo mismo que '¿Qué porcentaje es B de A?'.\n5. Te piden la incorrecta y marcas la primera correcta que ves.\n\n📩 Comenta «REPASO» y te envío la guía de 5 trampas en PDF para repasar en tu celular.\n\n#tuprofeindustrial #paesm1 #paes2026 #tipsdemre #demre`,
          },
          {
            key: "dom1230-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 Guarda este video para revisar en el trayecto mañana. Comenta «REPASO» para el PDF con las 5 trampas al DM 📩`,
          },
          {
            key: "dom1230-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `⚠️ *ÚLTIMO REPASO PAES M1 — 5 TRAMPAS CLÁSICAS* ⚠️\nNo caigas en las trampas de lectura de mañana. Revisa los 5 errores típicos aquí: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "dom-1230-carrusel",
        time: "12:30",
        minutesFromMidnight: 12 * 60 + 30,
        category: "carrusel",
        role: "matias",
        title: "Carrusel 8 Láminas: Formulario de Bolsillo 5 Trampas",
        detail: "8 láminas 4:5 HD con Slide 7 Formulario de Bolsillo y Slide 8 Cierre DM palabra clave REPASO.",
      },
      {
        id: "dom-1230-story",
        time: "12:45",
        minutesFromMidnight: 12 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Último Repaso de Bolsillo",
        detail: "¡Último repaso! Repasa estas 5 trampas antes de guardar los cuadernos hoy.",
      },
      {
        id: "dom-1230-wa",
        time: "13:00",
        minutesFromMidnight: 13 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: 5 Trampas",
        detail: "Broadcast masivo de alerta y prevención de errores.",
      },
      {
        id: "dom-1730-video",
        time: "17:30",
        minutesFromMidnight: 17 * 60 + 30,
        category: "video",
        role: "matias",
        title: "Video Métodos: Gestión de Tiempos (Regla de los 45s)",
        detail: "49.1s · Molde pov (Ingeniería de Métodos). 65 preguntas en 140 min. Si en 45s no ves el camino, marca y salta.",
        videoDownloadUrl: "/motor-assets/videos/DOMINGO-1730-video-ingenieria-de-tiempos.mp4",
        videoLabel: "DOMINGO-1730-video-ingenieria-de-tiempos.mp4 (4.1 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/DOMINGO-1730-portada-ingenieria-de-tiempos.jpg",
          downloadUrl: "/motor-assets/portadas/DOMINGO-1730-portada-ingenieria-de-tiempos.jpg",
          name: "Portada 17:30 Gestión de Tiempos",
        },
        copies: [
          {
            key: "dom1730-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `En la PAES no gana el que hace los cálculos más largos, sino el que mejor gestiona sus tiempos ⏱️\nSi en 45s no ves el camino, márcala y sigue.\nComenta «TIEMPO» y te envío el plan estratégico de examen.\n\n#tuprofeindustrial #paesm1 #estrategia #gestiondetiempo #demre`,
          },
          {
            key: "dom1730-b",
            label: "📚 Opción B: Copy Extenso Educativo (SEO)",
            text: `La PAES M1 tiene 65 preguntas y 140 minutos. Eso te da un promedio exacto de 2 minutos y 9 segundos por ejercicio.\n\nLA REGLA DEL INGENIERO (45 SEGUNDOS):\n1. Lees la pregunta y subrayas qué piden exactamente.\n2. Si a los 45 segundos no tienes clara la estrategia de resolución, ponle un círculo al número y SALTA INMEDIATAMENTE.\n3. Asegura primero todas las preguntas fáciles y medias (las de lectura directa y cálculo simple).\n4. Vuelve en la segunda vuelta con los minutos ahorrados a resolver las preguntas marcadas.\n\nNo dejes que una sola pregunta difícil te robe 5 minutos y te deje sin responder 3 fáciles al final.\n\n📩 Comenta «TIEMPO» y te mando el protocolo de gestión de examen en PDF.\n\n#tuprofeindustrial #paesm1 #estrategia #gestiondetiempo #demre`,
          },
          {
            key: "dom1730-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `📌 Aplica la regla de los 45s y asegura tu puntaje. Comenta «TIEMPO» para recibir el protocolo de examen al DM 📩`,
          },
          {
            key: "dom1730-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `⏱️ *ESTRATEGIA PAES: LA REGLA DE LOS 45 SEGUNDOS* ⏱️\nSi te trabas en una pregunta, marca y salta. No regales minutos. Guía rápida: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "dom-1730-story",
        time: "17:45",
        minutesFromMidnight: 17 * 60 + 45,
        category: "story",
        role: "matias",
        title: "Story 9:16: Regla de los 45 Segundos",
        detail: "No te quedes pegado en una pregunta: si pasas 1 minuto sin rumbo, marca y salta.",
      },
      {
        id: "dom-1730-wa",
        time: "18:00",
        minutesFromMidnight: 18 * 60,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Gestión Tiempos",
        detail: "Estrategia de dos vueltas al folleto para asegurar puntaje.",
      },
      {
        id: "dom-2115-video",
        time: "21:15",
        minutesFromMidnight: 21 * 60 + 15,
        category: "video",
        role: "matias",
        title: "Dato Nocturno Especial: Ritual de Calma y Confianza",
        detail: "58.4s · Molde dato_nocturno (Cierre Tranquilidad). Cierra los cuadernos, prepara tus materiales y confía en tu trabajo.",
        videoDownloadUrl: "/motor-assets/videos/DOMINGO-2115-noche09-ritual-confianza.mp4",
        videoLabel: "DOMINGO-2115-noche09-ritual-confianza.mp4 (4.9 MB)",
        assetPreview: {
          url: "/motor-assets/portadas/DOMINGO-2115-portada-ritual-confianza.jpg",
          downloadUrl: "/motor-assets/portadas/DOMINGO-2115-portada-ritual-confianza.jpg",
          name: "Portada 21:15 Ritual Confianza",
        },
        copies: [
          {
            key: "dom2115-a",
            label: "⚡ Opción A: Copy 3 Líneas (Algoritmo 2026)",
            tone: "primary",
            text: `Ya estudiaste lo necesario. Esta noche se cierran los cuadernos 🌙\nPrepara tus materiales, respira hondo y confía en tu trabajo. ¡Todo el éxito mañana en la PAES!\n\n#tuprofeindustrial #paesm1 #paes2026 #confianza #motivacion`,
          },
          {
            key: "dom2115-b",
            label: "📚 Opción B: Copy Extenso Educativo",
            text: `MENSAJE DEL PROFE: Esta noche antes de la PAES no es para aprender fórmulas nuevas ni para amanecerse resolviendo ensayos.\n\nTu lista de preparación para hoy:\n• Cédula de identidad vigente (o pasaporte).\n• Tarjeta de identificación impresa.\n• Lápices grafito N°2 o HB y goma de borrar limpia.\n• Botella de agua sin etiqueta.\n• Desayuno liviano planificado y acostarse temprano.\n\nEl trabajo duro ya lo hiciste durante todo el año. Mañana entra a esa sala con la cabeza fría, paso a paso y confiando en tu preparación. ¡Vamos con todo!\n\n#tuprofeindustrial #paesm1 #paes2026 #confianza #motivacion`,
          },
          {
            key: "dom2115-pin",
            label: "📌 1er Comentario Fijado",
            tone: "green",
            text: `🌙 Todo el equipo de TuProfeIndustrial te desea el mayor de los éxitos mañana. ¡Respira hondo y confía en ti!`,
          },
          {
            key: "dom2115-wa",
            label: "🟢 Difusión WhatsApp",
            waShare: true,
            text: `🎓 *MENSAJE FINAL ANTES DE LA PAES M1* 🎓\nCierra los cuadernos, prepara tu cédula y lápiz, y descansa. Ya hiciste el trabajo duro. Mañana a dar lo mejor: https://www.instagram.com/tuprofeindustrial/`,
          },
        ],
      },
      {
        id: "dom-2115-story",
        time: "21:30",
        minutesFromMidnight: 21 * 60 + 30,
        category: "story",
        role: "matias",
        title: "Story 9:16: Checklist de Materiales",
        detail: "Prepara tu carnet, lápiz grafito, goma y tarjeta de identificación. Hoy se duerme temprano.",
      },
      {
        id: "dom-2115-wa",
        time: "21:45",
        minutesFromMidnight: 21 * 60 + 45,
        category: "whatsapp",
        role: "matias",
        title: "Difusión Comunidad WhatsApp: Abrazo y Éxito Total",
        detail: "Último mensaje de audio de Matías para toda la comunidad antes de rendir la prueba.",
      },
    ],
    videos: [
      {
        id: "dom-1230-video",
        time: "12:30",
        title: "PAES M1: Las 5 Trampas del DEMRE que más se Repiten",
        duration: "55.0s",
        mp4Url: "/motor-assets/videos/DOMINGO-1230-video-5-trampas-demre.mp4",
        mp4Name: "DOMINGO-1230-video-5-trampas-demre.mp4",
        coverUrl: "/motor-assets/portadas/DOMINGO-1230-portada-5-trampas-demre.jpg",
        coverName: "DOMINGO-1230-portada-5-trampas-demre.jpg",
      },
      {
        id: "dom-1730-video",
        time: "17:30",
        title: "PAES M1: Gestión de Tiempos (Regla de los 45 Segundos)",
        duration: "49.1s",
        mp4Url: "/motor-assets/videos/DOMINGO-1730-video-ingenieria-de-tiempos.mp4",
        mp4Name: "DOMINGO-1730-video-ingenieria-de-tiempos.mp4",
        coverUrl: "/motor-assets/portadas/DOMINGO-1730-portada-ingenieria-de-tiempos.jpg",
        coverName: "DOMINGO-1730-portada-ingenieria-de-tiempos.jpg",
      },
      {
        id: "dom-2115-video",
        time: "21:15",
        title: "Dato Nocturno: Ritual de Calma y Confianza del Profe",
        duration: "58.4s",
        mp4Url: "/motor-assets/videos/DOMINGO-2115-noche09-ritual-confianza.mp4",
        mp4Name: "DOMINGO-2115-noche09-ritual-confianza.mp4",
        coverUrl: "/motor-assets/portadas/DOMINGO-2115-portada-ritual-confianza.jpg",
        coverName: "DOMINGO-2115-portada-ritual-confianza.jpg",
      },
    ],
    carousels: [
      {
        id: "c-dom-1230",
        title: "📸 Carrusel 12:30 · 5 Trampas DEMRE que más se repiten",
        subtitle: "8 Láminas HD (Formulario Maestro de Bolsillo)",
        folderPath: "/motor-assets/carrusel-domingo-1230",
        sheetUrl: "/motor-assets/DOMINGO-1230-carrusel-hoja-completa.jpg",
        slides: SLIDE_NAMES_8,
      },
    ],
    stories: [
      {
        id: "st-dom-1230-1",
        title: "12:45 Trampas Lectura",
        tag: "Alerta 9:16",
        url: "/motor-assets/historias/domingo-1230-cinco-trampas-demre-historia-01-encuesta.png",
        downloadName: "domingo-1230-cinco-trampas-demre-historia-01-encuesta.png",
      },
      {
        id: "st-dom-1230-2",
        title: "12:45 Formulario Bolsillo",
        tag: "Conversión 9:16",
        url: "/motor-assets/historias/domingo-1230-cinco-trampas-demre-historia-02-clases.png",
        downloadName: "domingo-1230-cinco-trampas-demre-historia-02-clases.png",
      },
      {
        id: "st-dom-1730-1",
        title: "17:45 Regla 45s",
        tag: "Método 9:16",
        url: "/motor-assets/historias/domingo-1730-gestion-tiempos-45s-historia-01-encuesta.png",
        downloadName: "domingo-1730-gestion-tiempos-45s-historia-01-encuesta.png",
      },
      {
        id: "st-dom-1730-2",
        title: "17:45 Gestión Examen",
        tag: "Estrategia 9:16",
        url: "/motor-assets/historias/domingo-1730-gestion-tiempos-45s-historia-02-clases.png",
        downloadName: "domingo-1730-gestion-tiempos-45s-historia-02-clases.png",
      },
      {
        id: "st-dom-2115-1",
        title: "21:30 Materiales Listos",
        tag: "Checklist 9:16",
        url: "/motor-assets/historias/domingo-2115-ritual-calma-paes-historia-01-encuesta.png",
        downloadName: "domingo-2115-ritual-calma-paes-historia-01-encuesta.png",
      },
      {
        id: "st-dom-2115-2",
        title: "21:30 Mucho Éxito",
        tag: "Motivación 9:16",
        url: "/motor-assets/historias/domingo-2115-ritual-calma-paes-historia-02-clases.png",
        downloadName: "domingo-2115-ritual-calma-paes-historia-02-clases.png",
      },
    ],
  },
};

export const QUOTES_WA = [
  {
    key: "wa1",
    name: "Tutoría individual (1 hora)",
    price: "$20.000 CLP",
    sub: "Online o domicilio Santiago",
    featured: false,
    purple: false,
    message: `¡Hola! Con mucho gusto te puedo apoyar. La tutoría personalizada de 1 hora tiene un valor de $20.000 CLP (online o a domicilio en Santiago). Revisamos dudas puntuales, ejercicios tipo PAES y reforzamos la base paso a paso. ¿Qué día y horario te acomoda más coordinar?`,
  },
  {
    key: "wa2",
    name: "Pack PAES (6 horas)",
    price: "$100.000 CLP",
    sub: "Ahorro $20k · Ensayos y cazabobos intensivos",
    featured: true,
    purple: false,
    message: `¡Hola! Para esta recta final te recomiendo directamente el Pack PAES: son 6 horas de tutorías personalizadas intensivas por $100.000 CLP (ahorras $20.000 frente a la hora individual). Trabajamos resolución de ensayos, trampas clásicas DEMRE y manejo de tiempo pregunta a pregunta. ¿Te gustaría agendar la primera sesión esta semana?`,
  },
  {
    key: "wa3",
    name: "Intensivo Ingeniería (36h)",
    price: "$600.000 CLP",
    sub: "Mensual · Cálculo, Álgebra y Nivelación",
    featured: false,
    purple: true,
    message: `¡Hola! El programa Intensivo de Ingeniería incluye 36 horas mensuales de acompañamiento integral (Cálculo diferencial/integral, Álgebra Lineal, Física y Nivelación universitaria) por $600.000 CLP al mes, con soporte continuo por WhatsApp para resolución de dudas. Cuéntame qué ramos estás cursando para diseñar tu plan de estudio.`,
  },
];

export const CONVOCATORIAS_BASE = [
  {
    nombre: "Rendición PAES Regular 2026",
    entidad: "DEMRE / Mineduc",
    fechaIso: "2026-11-30",
    fechaLabel: "30-Nov-2026",
    monto: "Ingreso Universidad 2027",
    estado: "alerta" as const,
    accion: "Captación intensiva de última semana ($100k Pack PAES).",
  },
  {
    nombre: "CORFO: Semilla Inicia",
    entidad: "CORFO (Llamado Nacional)",
    fechaIso: "2027-03-20",
    fechaLabel: "20-Mar-2027",
    monto: "$15.000.000 CLP",
    estado: "proceso" as const,
    accion: "Validar tracción de descargas del Formulario Maestro y métricas de carruseles 8 láminas.",
  },
  {
    nombre: "Start-Up Chile: Build (Cohorte 1)",
    entidad: "Start-Up Chile / CORFO",
    fechaIso: "2027-04-15",
    fechaLabel: "15-Abr-2027",
    monto: "$15.000.000 CLP",
    estado: "proceso" as const,
    accion: "Video pitch de 90s mostrando el motor automatizado EdTech (6 videos + 1 carrusel 8 slides + historias).",
  },
  {
    nombre: "Sercotec: Capital Semilla Emprende",
    entidad: "Sercotec Santiago",
    fechaIso: "2027-04-25",
    fechaLabel: "25-Abr-2027",
    monto: "$3.500.000 CLP",
    estado: "listo" as const,
    accion: "Cotizaciones de equipamiento y formalización de empresa.",
  },
  {
    nombre: "Santander X Award Chile",
    entidad: "Banco Santander",
    fechaIso: "2027-05-01",
    fechaLabel: "01-May-2027",
    monto: "Capital + Aceleración",
    estado: "listo" as const,
    accion: "Registrar perfil del proyecto en la plataforma Santander X.",
  },
];

export function getSantiagoNow(): { isoDate: string; minutes: number; timeStr: string } {
  const now = new Date();
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
