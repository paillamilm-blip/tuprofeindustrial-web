# Estándar de Animación Visual y Prueba del Mudo — @tuprofeindustrial

Este archivo define las reglas obligatorias e inquebrantables de pedagogía visual, diseño y producción para todo contenido generado en este repositorio.

---

## 1. Principio Rector: Superar la «Prueba del Mudo»
- **La animación demuestra, no decora:** Si un estudiante mira el video en silencio absoluto (sin audio), debe entender visualmente el 100% de la explicación, la trampa matemática y el conjunto solución.
- **Prohibidas las fórmulas desnudas:** Ninguna ecuación puede quedar flotando sola en pantalla sin su acompañamiento visual (recta, gráfico, figura geométrica, cuerpo 3D, circuito o diagrama de fuerzas).

---

## 2. Componentes Obligatorios de la Animación

### A. Inecuaciones y Conjuntos Numéricos (Recta de Intervalos)
Toda recta numérica debe incluir sin excepción:
1. **Eje continuo con extremos infinitos:** Flechas en ambos extremos acompañadas de los símbolos limpios `−∞` y `+∞` (Unicode o MathTex, nunca texto LaTeX crudo como `\infty`).
2. **Graduación completa:** Marcas y números enteros sobre el eje para dar escala real.
3. **Zona de solución (Área del intervalo):** Franja semitransparente con rayado diagonal (*hatching*) en color de acento (`col.acento`) sobre todo el intervalo o rayo.
4. **Flecha direccional del rayo:** Flecha gruesa sobre el eje señalando explícitamente hacia el infinito correspondiente (ej: hacia `−∞`).
5. **Punto crítico diferenciado:**
   - **Cerrado (`[` o `]`):** Punto sólido (`Dot`) + halo concéntrico exterior (`Circle`) + etiqueta superior `cerrado [`.
   - **Abierto (`]` o `[`):** Aro hueco con fondo de papel + etiqueta superior `] abierto`.
6. **Rótulo flotante de la solución:** Cartela matemática destacada sobre la franja sombreada con la expresión formal (ej: `x ≤ -3`).

### B. Movimiento de Giro en Inversión de Signos y Transformaciones
- Cuando una propiedad matemática altere el sentido o naturaleza de un símbolo (ej: **dividir por un negativo invierte la desigualdad** de $\ge$ a $\le$):
  - El signo debe ejecutar un **movimiento de giro físico 3D de $360^\circ$ sobre el eje vertical (`Rotate(mob, angle=2*PI, axis=UP)`)**.
  - Durante el giro, el símbolo se amplía al **$140\%$ de escala en color de acento (`col.acento`)**.
  - Al completar el giro, detona un **destello radial brillante (`Flash`)** para fijar la regla en la memoria visual del espectador.

### C. Funciones, Física e Ingeniería
- **Funciones:** Ejes graduados con unidades, marcado visual de raíces y vértice. Tangente animada en vivo para derivadas, área acumulada sombreada para integrales.
- **Física:** Vectores con flechas rotuladas ($P$, $N$, $f$, $v$, $a$, $T$). Descomposición vectorial explícita en planos inclinados.
- **Ingeniería:** Cuerpos 3D con despiece (*exploded view*), cotas de dimensiones y rotación de cámara controlada.

---

## 3. Sincronización Dinámica Voz-Visual (`registrar_parte`)
- Todo dibujo debe registrar sus piezas pedagógicas en `dib.registrar_parte("termino", mob)`.
- El motor (`_indicar_partes_del_dibujo`) detecta los *timestamps* de audio de palabras clave (*"menos tres"*, *"cerrado"*, *"invierte"*, *"solución"*, *"desigualdad"*) y resalta sincrónicamente la pieza visual en pantalla con `Indicate` y acompañamiento sutil de cámara.

---

## 4. Estándar de Tipografía y Glifos Matemáticos
- **Prohibido el LaTeX crudo en textos:** Nunca imprimir textos literales como `\leq`, `\geq`, `\infty` o `\le`.
- **Usar siempre glifos limpios:** `≤`, `≥`, `−∞`, `+∞`, `≠`, `≈`, `∈`, `√`.

---

## 5. Proceso de Admisión Vigente
- Todas las menciones, badges en historias, carruseles y copys deben señalar formalmente: **`ADMISIÓN PAES 2027`** (para la prueba rendida en 2026 correspondiente al proceso de admisión universitaria 2027).
