# Tu Profe Industrial · Web de captacion

Landing page publica orientada a alumnos para **captar trafico desde redes sociales**, ofrecer una **calculadora de notas interactiva** (escala chilena 1.0 - 7.0) y **cerrar alumnos por WhatsApp**.

Este repositorio es un producto de software autonomo, **solo frontend/web**. No contiene codigo Python, no renderiza videos y no depende de Manim ni FFmpeg.

## Que incluye

- **Hero** orientado a conversion con CTA principal a WhatsApp.
- **Calculadora de notas** con dos modos:
  - **Mi promedio**: promedio ponderado de tus evaluaciones y si apruebas (desde 4.0).
  - **Que nota necesito**: la nota que necesitas en la evaluacion restante para llegar a tu meta, con mensajes claros cuando es imposible o cuando ya la tienes asegurada.
- **CTA de WhatsApp** destacado y fijo (sticky) en mobile.

## Stack tecnologico

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (configurado via CSS en `app/globals.css`, sin `tailwind.config`)
- [Shadcn UI](https://ui.shadcn.com) (estilo new-york)
- Despliegue sugerido: [Vercel](https://vercel.com)

## Estructura relevante

```
app/
  layout.tsx         # metadata en espanol, lang="es"
  page.tsx           # landing (hero + calculadora + beneficios + CTA)
  globals.css        # Tailwind v4 + tokens de tema
components/
  grade-calculator.tsx   # calculadora interactiva (client component)
  whatsapp-cta.tsx       # boton CTA de WhatsApp
  ui/                    # primitivas de Shadcn UI
lib/
  grades.ts          # logica pura de la calculadora (escala 1.0 - 7.0)
  grades.test.ts     # pruebas unitarias de la logica
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

## Como desplegar en Vercel

1. Sube este repositorio a GitHub/GitLab.
2. En [Vercel](https://vercel.com/new), importa el repositorio. Vercel detecta
   Next.js automaticamente (no requiere configuracion especial de build).
3. En **Environment Variables** agrega `NEXT_PUBLIC_WHATSAPP_PHONE` con tu
   numero real.
4. Deploy. Cada push a la rama de produccion genera un nuevo despliegue.

El build de produccion usado por Vercel es `npm run build`.
