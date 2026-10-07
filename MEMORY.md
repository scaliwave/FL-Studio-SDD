# MEMORY.md - Registro de Cambios y Decisiones

## 2026-09-29 - Proyecto Inicial

### Decisión: Tipo de proyecto
- **Decisión**: Crear una landing page para FL Studio / Flex
- **Razón**: El usuario quería algo visualmente impactante con tonos negros y verdes, relacionado con producción musical
- **Alternativa descartada**: Portfolio personal (el usuario prefirió algo sobre FL Studio)

### Decisión: Paleta de colores
- **Colores elegidos**: Negros (#0a0a0a, #111111) + Verdes (#00ff88, #39ff14)
- **Razón**: Estética característica de FL Studio, moderna y tecnológica

### Decisión: Estructura de archivos
- HTML + CSS + JS vanilla (sin frameworks)
- Estructura modular con carpetas separadas para css y js
- Fuentes de Google Fonts: Inter y Orbitron

### Archivos creados
1. `index.html` - Estructura HTML completa con todas las secciones
2. `css/styles.css` - Estilos completos con variables CSS, animaciones y responsive
3. `js/main.js` - JavaScript para interactividad (menú móvil, animaciones, scroll)
4. `AGENTS.md` - Instrucciones y documentación del proyecto
5. `MEMORY.md` - Este archivo de registro

### Pendientes
- [ ] Reemplazar placeholders SVG con imágenes reales de FL Studio/Flex
- [ ] Añadir más secciones si el usuario lo solicita
- [ ] Optimizar rendimiento (minificación, lazy loading)
- [ ] Añadir tests

### Notas técnicas
- Se utilizó CSS variables para facilitar cambios de colores
- IntersectionObserver para animaciones al scroll
- Efecto parallax implementado con scroll listener
- Diseño mobile-first con breakpoints en 768px y 480px

## 2026-10-02 - Prueba con Chrome DevTools y corrección de bugs

### Decisión: Estrategia de testing
- **Decisión**: No hay tests automatizados; las pruebas se hacen abriendo `index.html` en el navegador con el MCP de Chrome DevTools (registrado en `AGENTS.md` sección "Testing")
- **Viewport de prueba**: Emulación móvil 375×812 (DPR 2, touch) + comprobación en escritorio 1280×800

### Bugs encontrados y corregidos
1. **Menú móvil no abría** (`css/styles.css`)
   - El JS añadía la clase `active`, pero no existía ninguna regla `.active` en el CSS y el `@media (max-width: 768px)` solo definía `.nav-links { display: none; }`
   - **Fix**: `.nav-links.active { display: flex; }` + panel desplegable full-width bajo la navbar + animación de hamburguesa a X con `.menu-toggle.active span`
2. **Error de consola al pulsar enlaces `href="#"`** (`js/main.js`)
   - `document.querySelector('#')` lanzaba `Uncaught SyntaxError: '#' is not a valid selector` (afectaba al logo, botones de descarga y redes sociales)
   - **Fix**: validar `href` antes de hacer `preventDefault()` y envolver `querySelector` en `try/catch`
3. **Overlay de la galería invisible en táctiles** (`css/styles.css`)
   - `.gallery-overlay` solo se mostraba en `:hover`, inaccesible en móvil
   - **Fix**: `@media (hover: none) { .gallery-overlay { opacity: 1; } }`
4. **Solapamiento texto del overlay con label del placeholder** (`css/styles.css`)
   - **Fix**: ocultar `.placeholder-content span` al mostrar el overlay (en `:hover` y en `hover: none`)
5. **Accesibilidad del botón de menú** (`index.html` + `js/main.js`)
   - **Fix**: `aria-label`, `aria-expanded`, `aria-controls="navLinks"` (con `id="navLinks"` en el `<ul>`), actualizados por el JS al abrir/cerrar

### Verificación posterior
- Menú abre/cierra correctamente, cierra al elegir enlace y hace smooth scroll con offset de 80px
- Consola y red limpias (0 mensajes, 0 errores, todas las peticiones 200)
- Sin overflow horizontal en 375px ni en 1280px
- Escritorio sin regresiones: nav horizontal y hamburguesa oculta

### Pendientes
- [ ] Reemplazar placeholders SVG con imágenes reales de FL Studio/Flex
- [ ] Añadir más secciones si el usuario lo solicita
- [ ] Optimizar rendimiento (minificación, lazy loading)
- [ ] Añadir tests automatizados

## 2026-10-02 - Spec 001: Sintetizadores y landing centrada en FL Studio

### Fase SDD: Spec (borrador)
- Creado `specs/001-sintetizadores-fl/spec.md` con 12 RF en EARS + 2 RF no funcionales, `Estado: borrador`.
- **Decisiones del usuario** (5 preguntas de `/sdd-spec`):
  - Toda la landing se reorienta a FL Studio: hero, navegación, descarga, Características y Galería.
  - Sintetizadores v1: Flex, Toxic Bio y Sytrus, con enlace a su página oficial en image-line.com (pestaña nueva).
  - El contenido "¿Qué es Flex?" (título + checklist de 4 puntos) se sustituye por párrafo introductorio + 3 tarjetas.
  - Características: 6 tarjetas de FL Studio (Piano Roll, Mixer, Playlist, Plugins, Grabación, Comunidad); Galería: 4 elementos de la interfaz de FL Studio.
  - Imágenes: placeholders SVG + descripciones cortas en español.
- **Dudas resueltas**: botón "Saber Más" y enlaces del pie que apuntaban a Flex → ahora apuntan a `#sintetizadores`.
- **Fuera de alcance**: imágenes reales, páginas de detalle por sintetizador, redirección de anclas antiguas `#flex`.
- **Siguiente paso**: `/sdd-clarify 001-sintetizadores-fl`.

## 2026-10-02 - Clarify de la Spec 001 resuelta + spec aprobada

### Fase SDD: Clarificación (QA) → spec aprobada
- Revisión QA detectó 14 puntos (8 ambigüedades, 3 contradicciones, 4 casos límite, 2 conflictos con la constitución); todos resueltos en `specs/001-sintetizadores-fl/spec.md` → **`Estado: aprobada`**.
- **URLs oficiales verificadas una a una en el navegador** (la web de Image-Line devuelve 200 para cualquier slug, así que se comprobó contenido real):
  - FLEX → `https://www.image-line.com/flex` (página con contenido completo).
  - Toxic Bio → `https://www.image-line.com/fl-studio/plugins/toxic-biohazard` (en el archivo oficial de 30 plugins).
  - Sytrus → `https://www.image-line.com/fl-studio/features#instruments` (**no tiene página propia**: su slug renderiza vacío, igual que uno inventado).
- **Resoluciones clave**: "enlace interno" definido en la spec (el logo pasa a enlazar al inicio y las redes quedan fuera de alcance); excepción de nombres propios en inglés (Piano Roll, Playlist…) para no chocar con el principio 6; RF-9 ahora cubre todas las secciones con tarjetas y >768 px; nuevo RF-13 (menú); nuevo RF-N3 (contenido fijo, no generado por JS → principio 3).
- **Siguiente paso**: `/sdd-plan 001-sintetizadores-fl`.

## 2026-10-02 - Plan de la Spec 001 generado

### Fase SDD: Plan (pendiente de aprobación)
- Creado `specs/001-sintetizadores-fl/plan.md`: 6 ficheros con responsabilidades, funciones puras en `tests/helpers.js` (sin fechas → no aplica "hoy"), pseudocódigo de 10 pasos, interfaz estática, 6 decisiones con alternativa descartada y estrategia de tests `node --test` (5 ficheros de tests + verificación manual con Chrome DevTools) con su mapa RF → test.
- **Siguiente paso**: aprobación del plan → `/sdd-tasks 001-sintetizadores-fl`.

## 2026-10-02 - Spec 001 implementada (T1-T8)

### Fase SDD: Implementación
- Las 8 tareas completadas con ciclo test rojo → código → `node --test` verde. Total: **38 tests, 0 fallos** (Node v24, sin dependencias).
- **Tests creados** (`fs` + regex, funciones puras en `tests/helpers.js`): `enlaces` (RF-2), `sintetizadores` (RF-3/4/5), `responsive` (RF-9, RF-N2), `entorno` (RF-N1/N3, RF-13), `contenido` (RF-1/6/7/8/12), `secciones` (RF-11/12).
- **Código**: `index.html` (sección `#sintetizadores`, copy del hero y descarga, 6 tarjetas de Características, galería, enlaces), `css/styles.css` (`.synths-*` sustituyen a `.flex-*`), `js/main.js` (selectores `.synth-card`), `AGENTS.md` (descripción, estructura, secciones, testing).

### Decisiones durante la implementación
- **Galería**: el label del placeholder (Playlist, Mixer, Piano Roll, Navegador) es la etiqueta visible y el overlay solo añade la descripción; con título en ambos sitios el texto se duplicaba y se solapaba. El label se coloca encima del icono con CSS, sin tocar el HTML.
- **Copy**: eliminados anglicismos ("presets", "pads", "leads") para cumplir RF-11; se mantienen los nombres oficiales (Piano Roll, Playlist, Mixer, Plugins, VST3, DAW).
- **Interpretación de RF-2**: los `href="#"` de descarga y redes son marcadores de posición permitidos; solo se exige que los enlaces internos apunten a secciones existentes. Los dos logos enlazan al inicio.

### Verificación manual (Chrome DevTools)
- 375×812: una columna en Sintetizadores/Características/Galería, sin scroll horizontal, menú abre y cierra con `aria-expanded` sincronizado.
- 1280×800: tres tarjetas en fila, navegación horizontal, hamburguesa oculta.
- Consola y red limpias. Smooth scroll deja la sección a 80 px (navbar de 71 px).

### Incidencias corregidas
- Al borrar los `<h4>` duplicados de la galería se cayeron también los del pie ("Enlaces", "Síguenos"): restaurados.
- Dos tests pasaban en vacío y otro leía el `querySelectorAll` equivocado: corregidos.
- Un comando de PowerShell corrompió las etiquetas T2-T8 de `tasks.md`: fichero reescrito.

### Pendientes
- [ ] Reemplazar placeholders SVG por capturas reales del sitio oficial de Image-Line
- [ ] Añadir más sintetizadores (Harmor, Sakura, Poizone…)
- [ ] Destino real para botones de descarga y redes sociales

## 2026-10-02 - Cambio 002: imágenes oficiales, logo oficial y enlaces de descarga

### Fase SDD: Cambio → Plan → Tareas → Implementación → Validación
- Aprobado el cambio en `specs/001-sintetizadores-fl/spec.md` (RF-14…RF-17 y RF-N4 nuevos; "Toxic Bio" → "Toxic Biohazard"), añadido el bloque del cambio en `plan.md` y las tareas T9-T12 en `tasks.md`.
- **Tests**: 45 en total, 0 fallos (`node --test`). Ciclo rojo→verde por tarea; helpers nuevos `getAttr`, `getImageSources`, `getImageDomains`.

### URLs oficiales adoptadas (verificadas una a una)
| Uso | URL |
|---|---|
| Botones de descarga (ambos) | `image-line.com/fl-studio/download` |
| Flex | `…/innovaeditor/assets/plugins/t_FLEX-main.jpg` (300 px) |
| Toxic Biohazard | `…/innovaeditor/assets/plugins/p_ToxicBiohazard-fullSize.jpg` (700 px) |
| Sytrus | `…/innovaeditor/assets/plugins/plugin240-sytrus.jpg` (240 px, no hay captura mayor) |
| Logotipo | `abassets.image-line.com/unified-navigation/fruit-logo@2x.png` (218×54, blanco sobre transparente) |

### Decisiones
- **Descartado** enlazar al instalador directo: `support.image-line.com/redirect/flstudio_win_installer` y `…_mac_installer` son reales (200, 1,03 GB y 1,10 GB) pero una landing no debe lanzar 1 GB sin que el visitante lo decida.
- **Descartado** el logo de la página de prensa (`thumb_FLStudio-logo.png` = solo la fresa sobre fondo gris; `FL_Studio_2024Logo_LightThumb.png` = caja blanca). Se usa el logotipo que la propia web de Image-Line emplea en su navegación.
- Imágenes remotas por URL (RF-N4), con `loading="lazy"` y `alt` descriptivo; CSS `.synth-image { object-fit: cover; aspect-ratio: 4/3 }` para no alterar el grid.
- El test exige el **dominio** de las imágenes, no el fichero exacto, para no depender de la ruta.

### Verificación (Chrome DevTools)
- Las 5 imágenes cargan (2 logos 218×54, Flex 300×199, Toxic 700×457, Sytrus 240×240) sin bloqueos por referrer.
- 1280 px: 3 tarjetas en fila, sin scroll horizontal. 375 px: una columna, sin scroll horizontal.
- Consola limpia (0 mensajes).

### Pendientes
- [ ] Imágenes reales en la galería (siguen placeholders SVG)
- [ ] Destino real para los enlaces de redes sociales
- [ ] Más sintetizadores (Harmor, Sakura, Poizone…)

## 2026-10-02 - Spec 002: rutas oficiales y galerías animadas

### Fase SDD: Spec → Clarificación (aprobada)
- Spec 002 unificada y **aprobada**: `specs/002-rutas-sitio-oficial/spec.md` con **21 RF + 6 RF no funcionales**. Cubre el bloque "Sitio oficial" del pie (7 rutas), dos galerías animadas (14 instrumentos y 13 efectos) que sustituyen la rejilla de 3 tarjetas, y el aviso de "pestaña nueva" visible solo con puntero o foco.
- **Revisión QA en dos vueltas**: la primera devolvió 37 hallazgos y veredicto CAMBIOS NECESARIOS; la segunda dejó **un único punto bloqueante** (RF-16 se contradecía con RF-10 sobre si una tarjeta sin enlace puede parar la franja) y siete observaciones menores. Todo resuelto en la v3.
- **Decisiones del usuario**: los efectos viven en la misma sección con subtítulo propio; las tarjetas llevan solo nombre + imagen (sin descripciones); se puede reescribir el texto introductorio; aviso solo con hover + foco de teclado.
- **Corrección de dato verificada en el navegador**: `image-line.com/fl-studio/plugins/<slug>` devuelve 200 con esqueleto vacío también para slugs inventados, así que **el código de respuesta no vale**: hay que leer el contenido. Resultado: **Transistor Bass sí tiene página oficial** (H1 real, 3 655 caracteres), mientras que **3xOSC es el único instrumento sin página** (843 caracteres, sin H1).
- **Enmiendas expresas a la spec 001**: RF-3, RF-4, RF-9, RF-11 y su "Fuera de alcance · añadir sintetizadores allá de los tres iniciales".
- **Tests afectados**: `sintetizadores`, `responsive`, `entorno`, `secciones` y `helpers.js` (los que hoy comprueban la rejilla de 3 tarjetas se sustituyen).
- **Siguiente paso**: `/sdd-plan 002-rutas-sitio-oficial` → `tasks.md` → implementación con @implementer → validación con @reviewer.

## 2026-10-02 - Spec 002 implementada (T1-T10)

### Fase SDD: Plan → Tareas → Implementación
- Las 10 tareas completadas en orden, con ciclo test rojo → código → `node --test` en verde. **80 tests, 0 fallos** (Node v24, sin dependencias).
- **Código**: `index.html` (las dos franjas con 14 + 13 tarjetas originales y sus 27 copias de relleno, subtítulo e intro reescritos, tarjeta de 3xOSC sin enlace, bloque "Sitio oficial" del pie), `css/styles.css` (`.strip*`, las dos animaciones, la pausa, el aviso con `opacity`, `prefers-reduced-motion`, anchos por rango, `.footer-content` a cuatro columnas; borrados `.synths-grid`, `.synth-card`, `.synth-image`, `.synth-external`), `js/main.js` (`.synth-card` fuera de los selectores de `initScrollAnimations`, sin funciones nuevas), `AGENTS.md` y `MEMORY.md`.
- **Tests**: `helpers.js` (funciones puras de franjas), `franjas.test.js` (nuevo), `sintetizadores.test.js`, `enlaces.test.js`, `responsive.test.js`, `entorno.test.js` y `secciones.test.js` reescritos o ampliados. Los destinos y las imágenes se leen del **anexo de la spec**, no se escriben a mano.
- **Enmienda de la spec en marcha (v4)**: cuatro direcciones de imagen del anexo venían mal por el prefijo (`plugin240-` en vez de `plugins240-`) y Chrome las bloqueaba con `net::ERR_BLOCKED_BY_ORB`; corregidas en la spec y en las 8 apariciones del HTML. Las 27 imágenes cargan.

### Revisión con Chrome DevTools
| Comprobación | 1280 px | 640 px | 375 px |
|---|---|---|---|
| Consola | limpia | limpia | limpia |
| Red | 34 peticiones, todas 200/304 | sin errores | sin errores |
| 27 imágenes | 27/27 | 27/27 | 27/27 |
| Sentido de las franjas | instrumentos izquierda (−110 px/s), efectos derecha (+102 px/s) | idem | instrumentos −71 px/s, efectos +66 px/s |
| Vuelta | 30 s (`30000 ms`, `infinite`) | 30 s | 30 s |
| Pausa con puntero y con teclado | sí, y reanuda sin salto | idem | idem |
| Aviso | oculto en reposo (`opacity: 0`), aparece con puntero y con `Tab` | idem | idem |
| 3xOSC | no alcanzable con `Tab`, pero la franja sí se detiene con el puntero encima | idem | idem |
| Scroll horizontal | ninguno | ninguno (`625 ≤ 640`) | ninguno (`375 = 375`) |
| Tarjetas completas a la vista | 5 | 2 (3 en el mejor momento) | 1 (2 en el mejor momento) |

- **Aviso accesible**: el texto "Ver en image-line.com · se abre en una pestaña nueva" sigue en el árbol de accesibilidad aunque esté oculto; el árbol lo anuncia dentro del nombre de cada enlace.
- **`Tab` recorre 14 + 13 enlaces y se salta 3xOSC** (Secuencia observada: Flex → Sytrus → Harmor, saltándose 3xOSC).
- **Reanudación sin salto**: al retirar el puntero la tarjeta pasó de −2297,6 a −2319,6 px, que son los ~200 ms transcurridos a 110 px/s; un salto real serían cientos de píxeles.

### Fallo encontrado y **no** corregido (queda pendiente)
- **RF-11 roto**: con "reducir movimiento" activo **las franjas siguen moviéndose**. El bloque `@media (prefers-reduced-motion: reduce)` declara `.strip-track { animation: none; transform: none; }` (especificidad 0,1,0) y las reglas que asignan la animación, `.strip--instrumentos .strip-track` y `.strip--efectos .strip-track` (0,2,0), la ganan; los media queries no suman especificidad. Comprobado en el navegador inyectando la regla del media query: la animación sigue corriendo; con selector de dos clases (`animationName: none`) sí se detiene. Lo demás del bloque sí funciona: `overflow-x: auto` convierte la franja en zona recorrible a mano y la página no desborda. `tests/franjas.test.js` no lo detecta porque solo comprueba que el bloque **contenga** `animation: none`.
- **Limitación de la herramienta**: el MCP de Chrome DevTools no expone `prefers-reduced-motion` en `emulate`, así que la preferencia del sistema no se pudo activar de verdad; se verificó el efecto de las declaraciones inyectándolas en caliente, y el defecto de especificidad se deduce de esa misma medición.
- **RF-18 al límite**: a 640 px solo 2 tarjetas originales se ven **completas** de forma sostenida (la tercera aparece según la fase) porque 3 × 176 + 2 × 16 = 560 deja 1 px de holgura sobre los 561 px disponibles una vez descontada la barra de desplazamiento; a 375 px hay 2 o 3 tarjetas **visibles** en todo momento, pero solo 1 o 2 completas. El test de `responsive.test.js` pasa porque calcula el ancho útil sin descontar la barra de scrolls.

## 2026-10-02 - Spec 002: correcciones tras la validación (RF-11 y RF-18)

### Qué se corrigió
- **RF-11 · CSS**: el bloque `@media (prefers-reduced-motion: reduce)` usaba `.strip-track { animation: none; transform: none; }` (0,1,0) y perdía contra `.strip--instrumentos .strip-track` y `.strip--efectos .strip-track` (0,2,0), porque un media query no suma especificidad. Ahora usa **los mismos selectores compuestos** que asignan la animación y se mantiene al final de la hoja. Medido en el navegador inyectando ese bloque en caliente: `animationName: none` y `transform: none` en las dos pistas, `overflow-x: auto` y desplazamiento manual funcionando (`scrollLeft = 200`); al quitarlo vuelven a animarse.
- **RF-11 · test**: `tests/franjas.test.js` ya no se conforma con que el bloque **contenga** `animation: none`. Ahora calcula la especificidad de los selectores, localiza qué reglas **asignan** la animación a `.strip-track` fuera del media query y exige que dentro haya una regla con **especificidad igual o superior** que las anule, además de que el bloque aparezca después en la hoja.
- **RF-18 · tests y CSS**: la spec v5 reenreda el recuento ("con la franja **detenida**", ancho útil descontando `padding` **y** barra de desplazamiento). `tests/responsive.test.js` descuenta ahora 15px de barra y comprueba la aritmética correcta: como la posición de parada es arbitraria, para ver siempre N tarjetas completas hay que afirmar que caben **N + 1** (cuatro a 640px, tres a 375px). Los anchos de tarjeta bajaron a **124px hasta 768px** y **88px hasta 480px** (hueco 16px y 8px), con `padding: 0.5rem` en la tarjeta a 480px.

### Comprobaciones en el navegador después del arreglo
| Punto | 640 px | 375 px |
|---|---|---|
| Ancho de franja / tarjeta | 561 px / 124 px | 311 px / 88 px (296 px si hay barra) |
| Tarjetas completas visibles con la franja detenida | **mínimo 3** en las 12 posiciones | **mínimo 2** en las 12 posiciones |
| Nombre legible | 16 px / 20 px | 15,2 px / 20 px |
| Sentidos opuestos y 30 s | instrumentos −65 px/s, efectos +60 px/s | instrumentos −45 px/s, efectos +42 px/s |
| Pausa con puntero | sí | sí (instrumentos `paused`, efectos `running`) |
| Scroll horizontal | ninguno | ninguno |

> Nota: estas mediciones se hicieron contando **solo las tarjetas originales**, con un proxy de N+1 para aproximar el criterio. La spec v6 aclaró que cuentan **originales y copias por igual** (una copia es indistinguible de su original para quien mira), de modo que el mínimo real es de 3 y 2 tarjetas completas visibles.

## 2026-10-02 - Spec 002: alineación de RF-18 con la v6

### Qué se ajustó
- **Criterio v6**: con la franja **detenida**, dentro del ancho útil (que descuenta el `padding` del contenedor y la barra de desplazamiento horizontal de 15px), se cuentan **tarjetas completas visibles**, originales y copias de relleno por igual: **3 a 640 px** y **2 a 375 px**.
- **`tests/responsive.test.js`**: los dos tests de RF-18 ya no exigen el proxy de N+1 (4 tarjetas a 640 px y 3 a 375 px) sino **3** y **2**; se reescribieron el encabezado de sección, los nombres de los tests y los mensajes de fallo para hablar de "tarjetas completas visibles con la franja detenida". El descuento de la barra horizontal y la medición con la franja detenida se mantienen, igual que las comprobaciones de nombre legible.
- **Sin tocar el CSS**: los anchos reales (124px con hueco 16px hasta 768px; 88px con hueco 8px hasta 480px) siguen cuadrando con el criterio v6 y con el ancho útil medido, con holgura de sobra: 3 × 124 + 2 × 16 = 404 px de los 561 útiles a 640 px, y 2 × 88 + 8 = 184 px de los 296 útiles a 375 px.

### Comprobación en el navegador (franja detenida, 12 posiciones por ancho)
| Ancho | Tarjetas completas visibles por posición | Mínimo | Cumple |
|---|---|---|---|
| 640 px | 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3 | **3** | ✅ |
| 375 px | 3, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3 | **2** | ✅ |

- Con el puntero encima de la franja (como pide RF-18) y la animación en `paused`: **3 tarjetas completas a 640 px** y **2 a 375 px**.
- `node --test`: **80 tests, 0 fallos**.

- Antes del ajuste el recuento con la franja detenida era de 1 a 3 tarjetas a 640 px y de 1 a 2 a 375 px; ahora el mínimo cumple RF-18 en las doce posiciones de parada medidas.
- **RF-9 y RF-10 intactos**: 1280, 640 y 375 px siguen con `strip-left` y `strip-right`, 30 s, direcciones opuestas y pausa con `:hover` (y el aviso del enlace hovered pasa a `opacity: 1`).

### Tests que detectan los fallos si vuelven
Comprobado sobre una copia temporal del proyecto: al volver a poner `.strip-track` a secas en el media query **falla** el test de RF-11; al mover ese bloque antes de las animaciones **falla** también; al subir la tarjeta a 176px o 140px **fallan** los dos tests de RF-18. Con el CSS correcto, **80 tests y 0 fallos**.

## 2026-10-02 - Spec 002 validada (APROBADO)

### Fase SDD: Validación → Correcciones → Cierre
- Validación en tres vueltas con @reviewer. La primera dio **CAMBIOS NECESARIOS** por dos puntos: **RF-11** (el bloque `@media (prefers-reduced-motion: reduce)` declaraba `.strip-track` con especificidad 0,1,0 y perdía contra las reglas que asignan la animación, así que con "reducir movimiento" las franjas seguían moviéndose) y **RF-18** (el recuento de tarjetas medía sobre un ancho útil que ignoraba la barra de desplazamiento).
- Correcciones: el media query pasó a usar los selectores compuestos (`.strip--instrumentos .strip-track`, `.strip--efectos .strip-track`) y el test de RF-11 se hizo **consciente de la cascada**, de modo que vuelve a fallar si el defecto regresa; el ancho de tarjeta quedó en 124 px hasta 768 px y 88 px hasta 480 px.
- **Reenmienda de RF-18 dos veces**: primero para que el recuento se mida con la franja detenida, y después (v6) para que cuente **tarjetas completas visibles** y no solo originales, porque la pista es una lista duplicada y para quien mira una copia es indistinguible de su original.
- **Veredicto final**: APROBADO. `node --test` con **80 tests, 0 fallos**; 21 RF y 6 RF no funcionales comprobados a 1280 px, 640 px y 375 px con Chrome DevTools, consola y red limpias, 27 imágenes oficiales cargando y sin scroll horizontal.
- **Pendiente conocido (no bloqueante)**: la costura del bucle queda 8 px desajustada por vuelta (`translateX(-50%)` es 3296 px y el periodo real 3304 px); el hueco entre tarjetas sí es constante.
- Nota para próximas revisiones: `resize_page` no baja de unos 500 px; para 375 px hay que usar `emulate` con viewport `375x812x1,mobile,touch`.

## 2026-10-04 - Spec 003: revisión con el navegador de la galería del hero (T8)

La galería vertical del hero sustituyó a los dos orbes, al glow del título y al parallax. Esta es la revisión con Chrome DevTools a los tres anchos que pedía RF-18, y queda registrada aquí porque la spec pedía anotar en `MEMORY.md` lo que muestra cada «captura de función», que era el punto que faltaba por comprobar.

### Qué se ve en cada ancho

| Comprobación | 1280 px | 640 px | 375 px (emulación) |
|---|---|---|---|
| Imágenes de la galería | 66/66 cargadas, 33 originales distintos, 0 rotas | 66/66, 33 distintos | 66/66, 33 distintos |
| Columnas visibles | **4** de 304,25 px, hueco 16 px | **3** de 200,33 px, hueco 12 px (la 4.ª oculta) | **2** de 183,5 px, hueco 8 px (la 3.ª y la 4.ª ocultas) |
| Media pista / alto del hero | 2155,5 px / 820 px = **2,62** | 1454 px / 900 px = **1,62** | 1341 px / 812 px = **1,65** |
| Duraciones por columna | 30 / 34 / 38 / 42 s | 30 / 34 / 38 s | 30 / 34 s |
| Velocidades medidas | −71,9 / −56,3 / −50,4 / −45,6 px/s | −49 / −39 / −35 px/s | −45 / −36 px/s |
| Texto del hero | título, subtítulo, los dos botones y la flecha del indicador, todos legibles | igual | igual |
| Scroll horizontal | ninguno | ninguno | ninguno (`scrollWidth` 375) |
| Consola | sin errores ni avisos | sin errores ni avisos | sin errores ni avisos |

Los tres anchos cumplen el mínimo de 1,5 veces el alto del hero para la media pista, con holgura. Las columnas cuadran con la tabla de RF-10 a 1280 y a 640 px.

> **A 375 px las columnas miden 183,5 px, no los 176 px de la tabla de RF-10, y no es un defecto**: la tabla descuenta la barra de desplazamiento vertical de 15 px, y en emulación de dispositivo móvil el navegador no reserva barra (es una superposición). Comprobado: a 1280 y a 640 px, que sí usan barra clásica, salen exactamente los 304,25 y los 200,33 px de la tabla. En un móvil real la barra se superpone y las columnas salen más anchas, que es lo mejor para las tarjetas.

### El bucle no tiene costura

- Las cuatro pistas repiten tarjeta y hueco: todas las tarjetas miden lo mismo (228,19 px a 1280 px) y el hueco vertical es de 12 px en las cuatro columnas.
- La mitad real de cada pista coincide con la teórica (9 tarjetas más 8,5 huecos para las 18 tarjetas de la primera columna; 8 y 8 para las de 16) con una diferencia de **0,21 px o menos**, que es redondeo de subpíxel.
- Las copias coinciden con sus originales en las cuatro columnas.
- **Los fotogramas del origen del bucle y de su mitad exacta son idénticos.** Se comprobó congelando las pistas con `transform: translateY(0)` y con `transform: translateY(-50%)` y comparando las dos capturas: no hay banda vacía, ni salto, ni cambio de imagen en el borde.

### Pausa: solo con el teclado

- Con el puntero encima de la galería: las cuatro pistas siguen en `running` y avanzan −86 / −68 / −60 / −55 px en 1,2 s. La galería **no** se para al pasar el puntero, como decided el usuario, porque el hero ocupa la primera pantalla entera.
- Con el teclado: enfocando el último enlace del menú («Descargar») y pulsando `Tab`, el foco cae en «Descargar Gratis» (`btn btn-primary`), `.hero` cumple `:focus-within` y **las cuatro pistas pasan a `paused` con desplazamiento 0**.
- Al quitar el foco vuelven a `running` y **reanudan sin salto**: siguen desde −1013 px y avanzan −6 px en los 100 ms siguientes, donde lo esperado son 7 px; en los 500 ms siguientes, −37 px frente a los 36 esperados. No hay reinicio ni salto de imagen.

### Reducir movimiento

El MCP de este proyecto no puede activar la preferencia del sistema, así que el bloque `@media (prefers-reduced-motion: reduce)` se inyectó en caliente con sus mismos selectores, igual que en la spec 002:

- Las cuatro pistas de la galería quedan con `animationName: none` y `transform: none`, desplazamiento **0**.
- Las dos franjas de Sintetizadores quedan también a `none` y con desplazamiento 0: **un solo bloque sirve para las dos galerías**, que es lo que pedía RF-17.
- **Cero zonas desplazables** dentro del hero (`.hero`, `.hero-bg`, `.hero-gallery` y las cuatro columnas), el alto del hero sigue siendo 820 px y no hay scroll horizontal. Nada de zona desplazable que atrape el scroll de la página.
- Al retirar la inyección, las pistas vuelven a `hero-rise` a −72 px/s.
- El bloque es **único** en la hoja (una sola aparición) y es además el último bloque de la hoja, como exige la cascada.

### Impresión

**El MCP no tiene emulador de medios**: `emulate` rechaza el argumento `media` con «Unknown argument for tool "emulate"», así que no se pudo poner `matchMedia('print')` a true. Lo que sí se comprobó:

- En pantalla `matchMedia('print').matches` es `false` y `.hero-bg` se calcula como `display: block`: la regla de impresión está correctamente inerte y no afecta a la pantalla.
- Inyectando su misma declaración (`.hero-bg { display: none }`) el bloque de decoración desaparece y **el hero conserva título, subtítulo, los dos botones y el indicador**, con el alto intacto (820 px) y sin scroll horizontal. Ese es exactamente el resultado al imprimir: las 66 imágenes no salen.
- El bloque `@media print` es único y está al final de la hoja.
- Aviso para futuras revisiones: con la página servida por `file://` no se puede ni leer `document.styleSheets[].cssRules` ni hacer `fetch('css/styles.css')` (restricción de origen), así que la unicidad del bloque se comprobó sobre el fichero.

### Consola, red y descargas

- Consola sin errores ni avisos en los tres anchos.
- Cada carga pide **34 imágenes**: los 33 originales de la galería más el logo de la navbar. Chrome reutiliza una sola vez cada URL repetida, así que las 66 etiquetas del HTML solo generan 33 peticiones.
- De esas 34 respuestas: **16 con `[200]` (descargadas) y 18 con `[304]` (revalidadas, sin cuerpo)**.
- **No fueron 6 descargas nuevas.** La caché ya estaba caliente de las revisiones de T2 a T5: de las 6 capturas oficiales, cinco respondieron `[304]` y solo `fl-studio-screen-demo-poster` respondió `[200]`. Las 16 descargas reales son 14 imágenes de instrumentos y efectos servidas por `www.image-line.com` (en la spec 002 esas mismas imágenes llegan por `support.image-line.com` y ya estaban en caché), más el póster y el logo.
- Reparto por anfitrión de los 33 originales: 21 en `www.image-line.com` y 12 en `support.image-line.com`.
- `static/assets` sirve **7 imágenes y no 6**. La séptima es `3xosc-800x533-png.ffe5dd0.webp`, que es la imagen oficial de 3xOSC del anexo de la spec 002, no una captura extra: los 33 originales son exactamente los 27 instrumentos y efectos más las 6 capturas. Conviene tenerlo anotado para que no parezca una captura duplicada.

### Qué muestra cada «captura de función»

Las cuatro se descargaron y se miraron a resolución completa:

| # | Fichero | Qué muestra |
|---|---|---|
| 1 | `frame-316129476-1-png.6d4f7bb.webp` (745x700) | El **Channel rack** con sus diez canales (Drums, Synt..elody, Percussion, Kick, Snare, Shaker, Rim, Hand drums, Cymbals), el selector de género «Amapiano» y el botón «Loop Starter…». Detrás, a la izquierda, asoma la **Playlist** con clips verdes y formas de onda. |
| 2 | `frame-316129474-4-png.e37824a.webp` (745x700) | La ventana del plugin **3xOSC** (tres osciladores con fase y detune por voz, «AM OSC 3», «HQ», «PHASE RAND») flotando sobre el **Piano Roll**, con notas rosa y las pistas «Rever…ch: 1» y «Delay 3 - Vocal Delay - Input wet». |
| 3 | `frame-316129477-png.7f12c5b.webp` (745x700) | La **Playlist** en modo Arrangement con la lista de canales a la izquierda (Bass 01, Plucked, Tempo, AcDrums, Cerbera, Stutter, Dry (M), Wet, Wave..aper, Vocodex) y el **Mixer** abajo, en el preset «Wide». |
| 4 | `frame-316129451-png.9b51205.webp` (700x526) | La ventana del plugin **Square** (el título de la barra dice «Square Sub…») con su teclado de piano a la izquierda y las notas verdes. Va centrada dentro de la imagen, con bastante margen negro alrededor. |

- **Ninguna se parece a otra**: la 1 es el channel rack, la 2 un plugin sobre el piano roll, la 3 la playlist con el mixer y la 4 otro plugin distinto. Se pueden quedar las cuatro.
- Matiz sobre el nombre: las cuatro son recortes de la interfaz de FL Studio, no fotografías de producto. Las 2 y la 4 son ventanas de plugin (3xOSC y Square), así que enseñan una función concreta —sintetizar con tres osciladores y secuenciar con Square—, pero no son lo mismo que las cuatro vistas con su etiqueta de la sección Galería (Playlist, Mixer, Piano Roll, Navegador). La 3 se solapa bastante con «Playlist» y «Mixer» de esa sección y la 2 incluye un piano roll; es solapamiento de contenido, no de imágenes.

### Un apunte sobre el indicador de scroll

El `.scroll-indicator` **no tiene texto**: solo contiene `.scroll-arrow`, una flecha verde de 20x20 px dibujada con bordes y girada 45°. En las reglas de `.scroll-indicator` sobran `font-size`, `text-transform`, `letter-spacing` y `color`, que no pintan nada porque no hay ningún nodo de texto; el HTML nunca tuvo una etiqueta ahí. No es un defecto de esta spec, pero engaña: lo que parece la palabra «SCROLL» en una captura del hero es parte de una de las imágenes de la galería. El único texto del hero son las dos líneas del título, el subtítulo y los dos botones.

## 2026-10-04 - Spec 003 implementada (cierre)

### Decisión: limpiar el indicador de scroll sin devolverle el texto
- **Decisión**: borrar de `.scroll-indicator` las cuatro propiedades muertas (`font-size`, `text-transform`, `letter-spacing` y `color`) y **no** añadir una etiqueta de texto, porque la spec 003 no la pide.
- **Razón**: el elemento solo contiene la flecha, así que esas cuatro reglas no pintaban nada. Se comprobó en el navegador que no hay ningún nodo de texto en el indicador y que lo que parecía la palabra «SCROLL» en las capturas era parte de una imagen de la galería.
- **Alternativa descartada**: poner un `<span>Scroll</span>` para dar sentido a esas reglas. Habría hecho falta tocar `index.html`, que la spec 003 no pedía, y el texto no está en ningún requisito.
- **Excepción**: `text-shadow: var(--shadow-hero)` **se conserva** aunque tampoco haya texto que sombrear, porque RF-9 lo exige expresamente sobre `.scroll-indicator` y hay un test que lo comprueba. Se dejó un comentario en el CSS explicando por qué sigue ahí.

### Ficheros que ha tocado la spec
- `index.html`: dentro de `.hero-bg` la galería con 4 columnas, 33 originales más sus 33 copias y la capa de degradado; fuera los dos orbes.
- `css/styles.css`: las cinco variables de `:root`, las reglas de la galería, el degradado, las sombras de texto, el `z-index`, la pausa con `:focus-within`, el bloque `@media print` y la limpieza de `.scroll-indicator`; fuera los estilos y las tres animaciones de los orbes.
- `js/main.js`: borrado el manejador de scroll del parallax. El hero ya no tiene movimiento propio.
- `tests/helpers.js`, `tests/hero.test.js` (nuevo, 37 tests) y ampliación de `franjas.test.js`, `responsive.test.js`, `entorno.test.js` y `contenido.test.js`.
- `AGENTS.md`, `MEMORY.md` y los ficheros de la propia spec.

### Resultado
- `node --test`: **127 tests, 127 pass, 0 fail**. Eran 80 al empezar la spec 002 y 117 al empezar esta.
- Revisión con Chrome DevTools a 1280, 640 y 375 px: los diez puntos de T8, con las cifras en las tablas de arriba.

### Dos notas honestas de la revisión, sin arreglar
1. **La impresión no se pudo comprobar con emulación de medios.** El MCP de este proyecto no la soporta: `emulate` rechaza el argumento `media` con «Unknown argument for tool "emulate"», de modo que no se pudo poner `matchMedia('print')` a true. En su lugar se comprobó que en pantalla la regla está inerte (`matchMedia('print').matches` falso y `.hero-bg` en `block`) y que su declaración, inyectada, oculta las 66 imágenes y deja el hero con su título, su subtítulo, sus botones y su indicador. El bloque `@media print` es único y está al final de la hoja.
2. **A 375 px las columnas miden 183,5 px, no los 176 px de la tabla de RF-10.** La tabla descuenta los 15 px de la barra vertical de scroll y en emulación de dispositivo móvil el navegador no reserva barra. No es un defecto: a 1280 y a 640 px, que sí usan barra clásica, salen exactamente los 304,25 y los 200,33 px de la tabla, y en un móvil real la barra se superpone y las columnas salen más anchas, que es lo mejor para las tarjetas. Queda anotado para que nadie lo lea como un fallo de la aritmética de RF-10.

### Para la próxima revisión
- `resize_page` no baja de unos 500 px: para 375 px hay que usar `emulate` con viewport `375x812x2,mobile,touch`.
- Con la página servida por `file://` no se pueden leer `document.styleSheets[].cssRules` ni hacer `fetch` de la hoja: las comprobaciones de CSS que necesitan el texto de la hoja se hacen sobre el fichero o inyectando reglas en caliente.
- La caché del navegador se comparte entre revisiones: al contar descargas nuevas hay que tener en cuenta que las revisiones anteriores ya calentaron la caché de las 27 imágenes de instrumentos y efectos.

## 2026-10-04 - Spec 002 Cambio 003: tarjeta de solo imagen con el texto al interactuar

### Qué ha cambiado
La tarjeta de las franjas pasa a ser **solo la imagen oficial**: en reposo no se ve ningún texto. El nombre y el aviso se agrupan en un bloque `.strip-card__meta` que está **fuera del flujo**, sobre la parte baja de la imagen, y se revela entero al pasar el puntero o al enfocar la tarjeta con el teclado mientras la imagen crece un 6 % desde abajo. La tarjeta **no cambia de alto** al hacerlo. En dispositivos **sin puntero** no hay nada que revelar, así que la tarjeta lleva siempre una banda sólida de 44px bajo la imagen con el nombre visible, y el aviso aparece al tocarla. Por debajo de 480px el aviso visible se acorta a «se abre en una pestaña nueva» (RF-27) porque el entero no cabe en una tarjeta de 88px, con el prefijo «Ver en image-line.com ·» oculto solo visualmente.

### Alturas, que es la tabla de RF-25 aplicada
| Rango | Ancho | Con puntero: solo imagen | Sin puntero: imagen + banda de 44px |
|---|---|---|---|
| Más de 768px (1280px) | 220px | **165px** | **209px** |
| De 481 a 768px (640px) | 124px | **93px** | **137px** |
| 480px o menos (375px) | 88px | **66px** | **110px** |

El ancho y el hueco no cambian, así que el recuento de RF-18 sigue siendo **3 tarjetas completas a 640px y 2 a 375px** con la franja detenida.

### Revisión con el navegador
| Comprobación | 1280px | 640px | 375px |
|---|---|---|---|
| Tarjeta en reposo | 209px (rama sin puntero, ver nota) | 137px | 110px |
| Imagen + banda | 165 + 44 | 93 + 44 | 66 + 44 |
| Originales con el nombre visible | 27/27 | 27/27 | 27/27 |
| Copias de relleno con la banda oculta | 27/27 | 27/27 | 27/27 |
| Aviso visible | completo | completo, 72px | corto, 56px, **sin truncar** |
| Prefijo del aviso | visible (126x14) | visible (75x30) | oculto (1x1) |
| Texto completo en el DOM | sí | sí | sí |
| Scroll horizontal | ninguno | ninguno | ninguno |
| Consola | limpia | limpia | limpia |

- **Puntero y teclado**: con el puntero sobre una tarjeta la imagen pasa a escala **1,06** y crece **5px hacia arriba** a 640px, el aviso aparece con `opacity: 1`, y la tarjeta **sigue midiendo lo mismo**. Con `Tab` la tarjeta enfocada cumple `:focus-visible` y el bloque de texto aparece igual que con el puntero.
- **Franja**: se para con el puntero y con el teclado, y reanuda **sin salto**: tras reanudar avanzaba −27px en el primer medio segundo y luego −66px/s, contra los 65px/s nominales.
- **"Reducir movimiento"** inyectado en caliente (el MCP no puede activar la preferencia del sistema): las dos pistas quedan con `animation: none`, `transform: none` y **desplazamiento 0**, `.strip-scroll` con `overflow-x: auto`, los **27 nombres siguen visibles** en la rama táctil y las 27 copias siguen ocultas.
- **Red**: 34 peticiones de imagen, **0 con error**.

### Una nota sobre la revisión, sin ocultar nada
La sesión de navegador quedó **bloqueada en emulación táctil** (`hover: none` y `pointer: coarse`) desde una revisión anterior, y ni `resize_page`, ni `emulate` con un viewport sin `touch`, ni una pestaña nueva la revierten: el MCP no expone cómo limpiar la emulación de medios. Por eso las cifras de la tabla son de la **rama sin puntero**, que es la que se puede medir, y también a 1280px. La **rama con puntero** —solo la imagen en reposo, 165px sin cambio de alto con el puntero encima, el revelado de 3xOSC sin enlace— se comprobó en vivo durante la T15, antes de que la emulación se activara, y su CSS no ha cambiado desde entonces salvo por el bloque `hover: none` y la guarda de las copias. Los 155 tests la cubren de forma estática.

### Resultado
- `node --test`: **155 tests, 155 pass, 0 fail** (eran 127 al empezar el Cambio 003 y 80 antes de la spec 002).
- Se corrigió además un defecto del propio `tests/franjas.test.js`: su predicado `enMedia` solo detectaba la **primera** regla de un bloque `@media`, porque `reglasDe` pega el prefijo `@media` al selector de esa primera regla **y se traga su declaración**. Con el bloque de las franjas, que tiene varias reglas, el test tomaba por revelado de la base una regla que estaba dentro del media query. El fichero trae ahora un parser local con conteo de llaves. Con él arreglado, la guarda de las copias volvió a su sitio natural: después de las reglas de revelado y antes del bloque `hover: none`.
- La copia de la guarda que estaba dentro de `@media (hover: none)` se borró por redundante: la guarda tiene especificidad 0,3,0 frente a la 0,1,0 de `.strip-card__meta { opacity: 1 }` de esa rama, así que gana sin ser posterior.
- Se quitó el `min-height: 2.5rem` de `.strip-card__name`: con el bloque de texto superpuesto hacía que el bloque ocupara 92px de los 165 de la tarjeta, y en la banda de 44px no cabían ni el nombre de dos líneas más el aviso.
