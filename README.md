# Tu Profe Industrial · Web de captacion

Landing page publica orientada a alumnos para **captar trafico desde redes sociales**, ofrecer una **calculadora de notas interactiva** (escala chilena 1.0 - 7.0) y **cerrar alumnos por WhatsApp**.

Este repositorio es un producto de software autonomo, **solo frontend/web**. No contiene codigo Python, no renderiza videos y no depende de Manim ni FFmpeg.

## Que incluye

Landing de conversion completa, dividida en secciones (una por componente en
`components/sections/`, con `app/page.tsx` como raiz de composicion):

- **Cabecera sticky** con wordmark, navegacion por anclas, enlace "saltar al contenido" y CTA compacto de WhatsApp.
- **Hero** con la propuesta de valor (Ingeniero Industrial + diplomado en Docencia e innovacion + Innovador en productos digitales con IA), el eslogan **"Aprender es para todos"** y CTA principal.
- **Calculadora de notas** con dos modos:
  - **Mi promedio**: promedio ponderado de tus evaluaciones y si apruebas (desde 4.0).
  - **Que nota necesito**: la nota que necesitas en la evaluacion restante para llegar a tu meta, con mensajes claros cuando es imposible o cuando ya la tienes asegurada.
- **Diagnostico interactivo PAES / Ingenieria**: test de 5 preguntas que entrega un plan recomendado (clases personalizadas, Intensivo PAES, nivelacion de Ingenieria o asesoria) y abre WhatsApp con ese plan ya pre-escrito.
- **Servicios/Clases**: clases personalizadas, intensivo PAES y nivelacion de ingenieria (tarjetas diferenciadas), materias (matematica, fisica, ingenieria) y niveles (1° medio hasta ultimo año de ingenieria). CTA de WhatsApp al final.
- **Simulador de meta PAES**: compara tu puntaje actual con tu puntaje objetivo, calcula cuanto debes subir y recomienda el intensivo o refuerzo que mas te conviene, con su propio CTA de WhatsApp.
- **Ruta de aprendizaje visual**: roadmap que muestra el camino desde tu nivel actual hasta tu meta, etapa por etapa.
- **Asesorias e Innovacion**: seccion aparte de las clases que refuerza su faceta de **Innovador en productos digitales con IA** y presenta los proyectos que asesora, tanto digitales como PYME: **paginas web, aplicaciones, pizzerias, confiterias saludables, innovacion en comidas y fundaciones**. Tiene su propio CTA de WhatsApp con un mensaje de asesoria distinto al del resto del sitio.
- **Quien soy / Tu profe**: bio profesional + placeholder accesible de foto (reemplazar por imagen real).
- **Testimonios/Resultados**: 4 slots marcados como placeholders para reemplazar por reseñas reales (ver abajo).
- **Preguntas frecuentes (FAQ)**: acordeon accesible (shadcn + Radix) con modalidad, precios, horarios, agenda y niveles.
- **CTA final** + footer con el wordmark.
- **CTA de WhatsApp** destacado y fijo (sticky) en mobile.

## Identidad visual

La identidad se creo desde cero (el negocio no tenia logo). Se documenta en el
bloque de comentarios al inicio de [`app/globals.css`](app/globals.css):

- **Paleta** en tokens `oklch`: primario *teal de ingenieria* (~hue 195) y acento *ambar señal* (~hue 72), con neutros frios intencionales. Sin AI-purple ni grises planos.
- **Tipografia** (via `next/font`): **Sora** (titulos/wordmark), **IBM Plex Sans** (cuerpo) e **IBM Plex Mono** (numerico).
- **Wordmark**: componente accesible en [`components/brand/wordmark.tsx`](components/brand/wordmark.tsx).

## Placeholders por reemplazar

- **Numero de WhatsApp**: `NEXT_PUBLIC_WHATSAPP_PHONE` (ver seccion mas abajo).
- **Foto del profesor**: caja marcada en la seccion "Quien soy" (`components/sections/about.tsx`).
- **Testimonios**: edita el arreglo `TESTIMONIALS` en `components/sections/testimonials.tsx`. Pon `placeholder: false` y completa `quote`, `name` y `context` por cada reseña real (instrucciones en el comentario del archivo).

## Stack tecnologico

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (configurado via CSS en `app/globals.css`, sin `tailwind.config`)
- [Shadcn UI](https://ui.shadcn.com) (estilo new-york)
- Despliegue sugerido: [Vercel](https://vercel.com)

## Estructura relevante

```
app/
  layout.tsx         # metadata en espanol, lang="es", fuentes next/font
  page.tsx           # raiz de composicion de la landing (ordena las secciones)
  globals.css        # Tailwind v4 + tokens de marca (oklch) + Design Read
components/
  brand/
    wordmark.tsx         # wordmark/logo accesible "Tu Profe Industrial"
  sections/              # una seccion de la landing por archivo
    site-header.tsx, hero.tsx, calculator-section.tsx,
    diagnostico-section.tsx, services.tsx, paes-section.tsx,
    roadmap-section.tsx, advisory.tsx (Asesorias e Innovacion),
    about.tsx, testimonials.tsx, faq.tsx, closing-cta.tsx,
    site-footer.tsx, reveal.tsx (entrada sutil respetando reduced-motion)
  grade-calculator.tsx   # calculadora interactiva (client component)
  diagnostico.tsx        # diagnostico interactivo PAES/Ingenieria (client)
  paes-simulator.tsx     # simulador de meta PAES (client)
  roadmap.tsx            # ruta de aprendizaje visual (client)
  whatsapp-cta.tsx       # boton CTA de WhatsApp
  ui/                    # primitivas de Shadcn UI (incluye accordion)
lib/
  grades.ts          # logica pura de la calculadora (escala 1.0 - 7.0)
  grades.test.ts     # pruebas unitarias de la logica
  calculator-input.ts / calculator-input.test.ts  # parseo de entradas
  diagnostico.ts / diagnostico.test.ts  # logica del diagnostico + mensaje WA
  paes.ts / paes.test.ts            # logica del simulador de meta PAES
  roadmap.ts / roadmap.test.ts      # etapas de la ruta de aprendizaje
  whatsapp.ts        # constructor del enlace wa.me + numero placeholder
  utils.ts           # helper cn (clsx + tailwind-merge)
.env.example         # variables de entorno de ejemplo
```

## Requisitos

- Node.js 22+ (probado con v22) y npm.

## Como ejecutar en local

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional pero recomendado) configurar el numero de WhatsApp
cp .env.example .env.local
# edita .env.local y reemplaza NEXT_PUBLIC_WHATSAPP_PHONE por tu numero real

# 3. Levantar el servidor de desarrollo
npm run dev
# abre http://localhost:3000

# Build de produccion
npm run build

# Servir el build de produccion
npm start
```

## Como correr las pruebas

Las pruebas de la logica de la calculadora (`lib/grades.ts`) usan el runner nativo
de Node (`node --test`) ejecutado con `tsx`:

```bash
npm test
```

Cubren: promedio ponderado, limite de aprobacion en 4.0 (aprueba/reprueba),
calculo de la nota requerida, caso imposible (nota necesaria > 7.0) y caso ya
asegurado (nota necesaria <= 1.0).

## Donde se cambia el numero de WhatsApp

El numero se lee desde la variable de entorno **`NEXT_PUBLIC_WHATSAPP_PHONE`**.
Debe ir en **formato internacional, sin el signo `+` y sin espacios ni guiones**.
Ejemplo para Chile: `56912345678` (56 = codigo pais, 9 + numero movil).

Hay dos lugares relacionados:

1. **Variable de entorno (lo que debes configurar).**
   - En local: en `.env.local` (copiado desde `.env.example`).
   - En Vercel: en **Project Settings -> Environment Variables**, define
     `NEXT_PUBLIC_WHATSAPP_PHONE` con tu numero real y vuelve a desplegar.
2. **Fallback placeholder en el codigo.** En
   [`lib/whatsapp.ts`](lib/whatsapp.ts) la constante `WHATSAPP_PHONE` usa
   `56900000000` solo como respaldo cuando la variable de entorno no esta
   definida (marcado con el comentario `REEMPLAZAR con el numero real`). En
   produccion siempre debe primar la variable de entorno; el fallback existe
   para que la app no se rompa en desarrollo.

> Importante: `NEXT_PUBLIC_WHATSAPP_PHONE` se inyecta en tiempo de build. Si la
> cambias en Vercel, vuelve a desplegar para que tome efecto.

> Aviso en desarrollo: si la variable no esta definida y se usa el numero
> PLACEHOLDER, la app imprime una advertencia en consola (solo fuera de
> produccion) desde `warnIfPlaceholderPhone` en
> [`lib/whatsapp.ts`](lib/whatsapp.ts). Es un recordatorio barato para no
> publicar con el numero equivocado; no aparece en produccion.

## Como desplegar en Vercel

1. Sube este repositorio a GitHub/GitLab.
2. En [Vercel](https://vercel.com/new), importa el repositorio. Vercel detecta
   Next.js automaticamente (no requiere configuracion especial de build).
3. En **Environment Variables** agrega `NEXT_PUBLIC_WHATSAPP_PHONE` con tu
   numero real.
4. Deploy. Cada push a la rama de produccion genera un nuevo despliegue.

El build de produccion usado por Vercel es `npm run build`.
