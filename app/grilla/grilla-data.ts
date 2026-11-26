export type DayKey = "mie25" | "jue26";

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
  "https://www.superprof.cl/ingeniero-industrial-docente-scuola-italiana-preparacion-intensiva-paes-matematica-calculo-domicilio-santiago.html";

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
