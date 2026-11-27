# Estándar de Animación Visual y Prueba del Mudo — @tuprofeindustrial

Este archivo define las reglas obligatorias e inquebrantables de pedagogía visual, diseño y producción para todo contenido generado en este repositorio.

---

## 1. Principio Rector: Superar la «Prueba del Mudo»
- **La animación es el profesor visual (demuestra, no decora):** Si un estudiante mira el video en **silencio absoluto (sin audio)**, debe entender visualmente el 100% de la explicación: qué problema se plantea, qué propiedad se aplica, cómo se transforma cada paso y cuál es el resultado final.
- **Prohibidas las fórmulas desnudas:** Ninguna ecuación puede quedar flotando sola en la pizarra sin su modelo visual completo y dinámico.

---

## 2. Los 6 Componentes Obligatorios de TODA Animación (Universal)

Sin importar la materia (álgebra, cálculo, geometría, física, ingeniería o estadística), toda animación debe portar sus 6 componentes explicativos:

1. **Marco de Referencia y Escala Real:** Ejes graduados con unidades ($X-Y$, tiempo, altura), límites de escala (`−∞`, `+∞`), orígenes y planos de referencia explícitos.
2. **Diferenciación Visual Dato vs Incógnita:** Lo conocido en color base; lo que se busca (incógnita) en color de alerta o con etiqueta explícita (`¿?`); el valor resuelto en color de éxito (`col.exito`).
3. **Zona o Estado Activo Delimitado:** La región matemática de interés debe estar físicamente resaltada (franja con rayado diagonal *hatching* en intervalos, área sombreada bajo la curva en integrales, caras activas en 3D).
4. **Guías Direccionales y de Sentido:** Flechas vectoriales de sentido, vectores de velocidad/fuerza rotulados o flechas sobre el eje que indiquen explícitamente hacia dónde fluye o se proyecta la solución.
5. **Puntos Críticos y Singularidades con Tratamiento Especial:** Vértices, raíces, puntos cerrados `[` vs abiertos `]`, apoyos o singularidades destacados con **halos concéntricos y etiquetas semánticas claras** (ej: `cerrado [`, `vértice (h, k)`).
6. **Rótulo Dinámico Flotante (Ecuación Viva):** Cartela matemática limpia con el valor o expresión formal de lo que se muestra (ej: `x ≤ -3`, `V = 8 m³`), que muta visualmente con cada paso.

---

## 3. Cinemática y Física del Movimiento en Toda Transformación
Los cambios de regla, signo o estado nunca deben ocurrir como un corte estático:
- **Inversión de signo o polaridad (ej: dividir por negativo):** Giro físico 3D de $360^\circ$ sobre el eje vertical (`Rotate(mob, angle=2*PI, axis=UP)`), escala al $140\%$ en color cian y destello radial brillante (`Flash`).
- **Errores y trampas:** Tacha cruzada en rojo + temblor sísmico (`Wiggle`).
- **Derivadas e integrales:** Tangente que se desliza mostrando la pendiente en vivo; área que se llena progresivamente.
- **Cuerpos 3D e ingeniería:** Rotación suave axonométrica, cotas y despiece rotativo (*exploded view*).
- **Vectores y fuerzas:** Descomposición proyectada viva sobre los ejes del plano.

---

## 4. Sincronización Léxica Dinámica Universal (`registrar_parte`)
- Toda función de dibujo debe asociar sus piezas a palabras clave del lenguaje mediante `dib.registrar_parte("palabra", mob)`.
- El motor (`_indicar_partes_del_dibujo`) detecta los *timestamps* de audio de la locución y resalta automáticamente (`Indicate` + micro-encuadre de cámara) la pieza visual exacta en el milisegundo en que se pronuncia.

---

## 5. Estándar de Tipografía y Glifos Matemáticos
- **Prohibido el LaTeX crudo en textos:** Nunca imprimir textos literales como `\leq`, `\geq`, `\infty` o `\le`.
- **Usar siempre glifos limpios:** `≤`, `≥`, `−∞`, `+∞`, `≠`, `≈`, `∈`, `√`.

---

## 6. Proceso de Admisión Vigente
- Todas las menciones, historias, carruseles y copys deben señalar formalmente: **`ADMISIÓN PAES 2027`**.
