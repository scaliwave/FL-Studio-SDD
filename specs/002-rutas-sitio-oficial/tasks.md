# Tareas — Spec 002: Rutas del sitio oficial, galerías animadas de instrumentos y aviso de enlaces externos
Plan: `specs/002-rutas-sitio-oficial/plan.md` · Spec: `specs/002-rutas-sitio-oficial/spec.md` (v3, aprobada)

Ciclo por tarea: test en rojo → código → `node --test` en verde → marcar → parar. Ninguna tarea depende de que la anterior esté "terminada de verdad": basta con que su suite esté verde.

- [x] **T1. Tests en rojo del contenido de las dos franjas.** En `tests/helpers.js` sustituir `getSynthCards` por `getStrips`, `getStripBlocks`, `getStripCards`, `getCardName`, `getCardNotice`, `getCardImage` e `isDecorative`; reescribir `tests/sintetizadores.test.js` para que exija 14 instrumentos y 13 efectos en el orden de RF-6 y RF-7, 14+13 copias de relleno que no se cuentan, el destino del anexo en cada tarjeta enlazada, 3xOSC sin `href`/sin aviso/sin `tabindex`, una imagen `https://` de dominio de Image-Line por tarjeta con `alt` que la nombre, el aviso en el texto de cada tarjeta enlazada y ningún párrafo de descripción. RF-6, RF-7, RF-13, RF-15, RF-16, RF-N4, RF-N5
  - Hecho cuando: `node --test` falla solo en los tests nuevos de `tests/sintetizadores.test.js` porque `index.html` todavía tiene `.synths-grid` con 3 tarjetas, y los ficheros `enlaces`, `contenido`, `responsive`, `entorno` y `secciones` siguen en verde.

- [x] **T2. Tests en rojo de la mecánica del bucle.** Crear `tests/franjas.test.js`: los dos `<h3>` con `aria-labelledby`, las copias con `aria-hidden="true"` y sin `href` ni `tabindex`, dos animaciones de sentidos opuestos con la misma duración, reglas de pausa con `:hover` y `:focus-within`, aviso con `opacity: 0` revelado con `:hover` y `:focus-visible`, y bloque `@media (prefers-reduced-motion: reduce)` con `animation: none` y `overflow-x: auto`. RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-14
  - Hecho cuando: `node --test` falla en los tests de `tests/franjas.test.js` contra el CSS y el HTML actuales, y el recuento de fallos es mayor que cero sin errores de sintaxis.

- [x] **T3. Franja de instrumentos en el HTML.** Eliminar `.synths-grid`; reescribir subtítulo e intro sin cantidades y manteniendo "FL Studio"; añadir `<h3 id="strip-instrumentos">Instrumentos incluidos</h3>` y `.strip-scroll` con 14 tarjetas originales (imagen del anexo, nombre, aviso) más sus 14 copias decorativas; la de 3xOSC sin `<a>`. RF-6, RF-8, RF-12, RF-13, RF-15, RF-16, RF-N3, RF-N4
  - Hecho cuando: los tests de contenido de instrumentos de `tests/sintetizadores.test.js` pasan y los que dependen del CSS siguen en rojo; el HTML no contiene ningún `.synths-grid` ni ninguna tarjeta con párrafo `<p>`.

- [x] **T4. Franja de efectos en el HTML.** Añadir debajo `<h3 id="strip-efectos">Efectos incluidos</h3>` y su `.strip-scroll` con 13 tarjetas originales y sus 13 copias decorativas, en el orden de RF-7, sin entrada nueva en la navbar. RF-7, RF-8, RF-13, RF-15, RF-N3, RF-N4
  - Hecho cuando: `tests/sintetizadores.test.js` pasa entero y `tests/franjas.test.js` solo falla en lo que depende del CSS.

- [x] **T5. CSS de las franjas.** Borrar `.synths-grid`, `.synth-card`, `.synth-image`, `.synth-external` y su regla ≤768 px; añadir `.strip`, `.strip-scroll`, `.strip-track`, `.strip-card`, `.strip-card--filler`, los `@keyframes strip-left`/`strip-right` hacia `-50%`, `--strip-duration: 30s`, la pausa con `:hover` y `:focus-within`, el aviso con `opacity`, el bloque `prefers-reduced-motion` y los anchos por rango. RF-9, RF-10, RF-11, RF-14, RF-N2
  - Hecho cuando: `node --test` pasa entero por primera vez con la sección de Sintetizadores nueva, y en el navegador la franja de instrumentos gira a la derecha y la de efectos a la izquierda.

- [x] **T6. JS y su test invertido.** Quitar `.synth-card` de los selectores de `initScrollAnimations` en `js/main.js`; en `tests/entorno.test.js` invertir la comprobación para que exija que ni `.synth-card` ni `.strip-card` aparezcan ahí, conservando las de cero dependencias y de que el JS no pinta contenido. RF-20, RF-N1, RF-N3
  - Hecho cuando: `tests/entorno.test.js` pasa entero y `js/main.js` no ha ganado ninguna función nueva.

- [x] **T7. Responsive.** En `tests/responsive.test.js` sustituir las reglas de `.synths-grid` por las de las franjas en ≤768 px y ≤480 px y añadir la franja a ancho completo y el pie de cuatro bloques en >768 px; conservar las comprobaciones de Características, Galería, `:root` y ausencia de estilos obsoletos de Flex. RF-17, RF-18, RF-19, RF-N2
  - Hecho cuando: `tests/responsive.test.js` pasa entero y sigue comprobando que `.flex-section`, `.image-frame`, `.check-icon` y `.synths-grid` no existen.

- [x] **T8. Tests en rojo del pie y del idioma.** En `tests/enlaces.test.js` añadir `getOfficialLinks` y `getFooterBlocks` y comprobar el bloque "Sitio oficial": 7 enlaces con los destinos de RF-2, `target="_blank"`, `rel`, icono en cada uno y posición entre "Enlaces" y "Síguenos"; en `tests/secciones.test.js` ampliar `NOMES_PROPIOS` con los 14 instrumentos, los 13 efectos y "FL Cloud", quitar "Toxic Bio" y exigir que `#sintetizadores` siga mencionando FL Studio. RF-1, RF-2, RF-3, RF-5, RF-12, RF-N5
  - Hecho cuando: `node --test` falla en los tests nuevos del pie porque el bloque todavía no existe, y ya no falla por los nombres de instrumentos nuevos.

- [x] **T9. Bloque "Sitio oficial" del pie.** Insertar en `index.html` el bloque entre "Enlaces" y "Síguenos" con los 7 enlaces de RF-2, `target="_blank"`, `rel="noopener noreferrer"` y el icono `svg` con `aria-hidden="true"`; en `css/styles.css` poner `.footer-content` a `grid-template-columns: 2fr 1fr 1fr 1fr` (≤768 px ya baja a `1fr`) y reutilizar los estilos de `.footer-links a` más el color de acento al pasar el ratón. RF-1, RF-2, RF-3, RF-5, RF-17, RF-19, RF-N2
  - Hecho cuando: `node --test` pasa entero y el pie muestra los cuatro bloques en una fila a 1280 px y en una columna a 375 px.

- [x] **T10. Verificación final y documentación.** Revisar en Chrome DevTools a 1280 px, 640 px y 375 px: consola y red limpias, 27 imágenes cargadas, vuelta de 25 a 35 s por franja, parada con puntero y reanudación sin salto, aviso visible con puntero y con teclado, 3xOSC sin tabular pero con parada por puntero, aviso anunciado a lectores de pantalla, "reducir movimiento" sin desplazamiento automático y sin desbordes horizontales; actualizar `AGENTS.md` y `MEMORY.md` con el resultado. RF-9, RF-10, RF-11, RF-14, RF-16, RF-17, RF-18, RF-19, RF-21, RF-N2
  - Hecho cuando: `node --test` está en verde con más de 45 tests, `MEMORY.md` anota qué se comprobó a cada ancho, el estado de la consola y la comprobación con "reducir movimiento", y `AGENTS.md` describe las dos franjas y el bloque nuevo del pie.

---

# Cambio 003 — Tarjeta de solo imagen con el texto al interactuar

Plan: sección "Cambio 003" de `specs/002-rutas-sitio-oficial/plan.md` · Spec: v7, Cambio 003 (RF-22…RF-26 nuevos; RF-6, RF-7, RF-11, RF-13, RF-14, RF-16, RF-17 y RF-18 enmendados).
La suite parte de **127/127 verde**. Ningún test descarga imágenes ni usa `fetch` contra image-line.com. T13 y T15 tocan `css/styles.css` y van seguidas a propósito; T14 puede ir en paralelo con ellas solo si se coordina el fichero del HTML.

- [x] **T11. Tests en rojo del marcado de las tarjetas.** En `tests/helpers.js` añadir `getCardMeta(card)`; en `tests/sintetizadores.test.js` exigir que toda tarjeta original y toda copia de relleno lleven bloque `.strip-card__meta`, que el bloque de cada copia repita el nombre y el aviso de su original, y que 3xOSC tenga bloque con su nombre y siga sin enlace, sin aviso ni `tabindex`. RF-13, RF-16, RF-22, RF-26
  - Hecho cuando: `node --test` falla en los tests nuevos de `tests/sintetizadores.test.js` porque el HTML todavía no tiene ningún bloque de texto, y los otros seis ficheros siguen en verde.

- [x] **T12. Tests en rojo de la mecánica del bloque de texto.** En `tests/franjas.test.js` sustituir la comprobación del aviso aislado por la del bloque completo: oculto con `opacity: 0` y no con `visibility: hidden` ni `display: none`; revelado con `:hover` y con `:focus-visible`; posicionado fuera del flujo; la imagen con transición y transformación; la guarda `.strip-card--filler` **después** de las reglas de revelado; y el bloque `@media (hover: none)` con el nombre siempre visible, situado antes del bloque de reducir movimiento. RF-14, RF-23, RF-24, RF-26
  - Hecho cuando: `node --test` falla en esos tests contra el CSS y el HTML actuales, y sigue habiendo 0 errores de sintaxis.

- [x] **T13. Tests en rojo de la aritmética de alturas.** En `tests/responsive.test.js` añadir, sin tocar la aritmética de anchuras: en la rama base, alturas de tarjeta de 165 px por encima de 768 px, 93 px hasta 768 px y 66 px hasta 480 px; en el bloque `(hover: none)`, la suma de la altura de imagen y la banda de 44 px (209 / 137 / 110 px); y que el nombre en ≤480 px siga con fuente ≥14 px y línea ≥20 px. RF-17, RF-18, RF-25
  - Hecho cuando: `node --test` falla en los tests de altura porque la hoja todavía no declara `--strip-card-height` ni `--strip-band-height`, y los de anchuras siguen en verde.

- [x] **T14. Marcado: bloque de texto en las 54 tarjetas.** Con un script de Node de un solo uso que lea el anexo de la spec y reescriba `index.html`, envolver nombre y aviso de las 27 originales y de sus 27 copias en `<span class="strip-card__meta">`, dentro del enlace cuando lo hay y directamente en el `<li>` en 3xOSC; borrar el script al terminar. RF-13, RF-14, RF-16, RF-22, RF-26
  - Hecho cuando: `tests/sintetizadores.test.js` pasa entero, las 54 tarjetas tienen bloque de texto y no queda ningún script temporal en el proyecto.

- [x] **T15. CSS de la rama con puntero.** Declarar `--strip-card-height` (165 / 93 / 66 px) en `.strip`; `.strip-card` con `height` fija, `padding: 0`, `position: relative` y `overflow: hidden`; `.strip-card__image` a `height: 100%` con `transition` y `transform-origin: bottom center`; `.strip-card__meta` absoluto sobre la parte baja, con fondo sólido y `opacity: 0`; revelado con `:hover` y `:focus-visible`; `scale(1.06)` en la imagen al interactuar; y guarda `.strip-card.strip-card--filler .strip-card__meta { opacity: 0 }` escrita al final. RF-22, RF-23, RF-25, RF-26
  - Hecho cuando: `tests/franjas.test.js` pasa entero, y en el navegador la tarjeta de escritorio muestra solo la imagen en reposo y el texto al pasar el puntero sin cambiar de alto.

- [x] **T16. CSS de la rama sin puntero e impresión.** Añadir el bloque `@media (hover: none)` **antes** del bloque `prefers-reduced-motion`, con la altura de tarjeta calculada como imagen más la banda de 44 px, el bloque de texto en el flujo bajo la imagen y el nombre con opacidad 1 permanente; dejar el aviso sujeto al hover pegajoso del toque; añadir el bloque `@media print` que no imprime las tarjetas. RF-24, RF-25
  - Hecho cuando: `tests/responsive.test.js` y `tests/franjas.test.js` pasan enteros, incluido el test que comprueba que `(hover: none)` va antes del bloque de reducir movimiento, y con emulación táctil el nombre se ve sin tocar.

- [x] **T17. Suite completa en verde.** Repasar los siete ficheros de test, ajustar cualquier aritmética que haya cambiado y confirmar que no se ha perdido ninguno de los 127 tests anteriores. RF-13, RF-14, RF-16, RF-17, RF-18, RF-22, RF-23, RF-24, RF-25, RF-26
  - Hecho cuando: `node --test` está en verde con 127 tests o más, y la lectura de los ficheros no muestra ninguna comprobación eliminada.

- [x] **T18. Verificación en Chrome DevTools y documentación.** A 1280 px, 640 px y 375 px, y a 375 px con emulación de dispositivo táctil: en reposo solo la imagen; al pasar el puntero y al tabular aparecen nombre y aviso sin que la tarjeta cambie de alto; en táctil el nombre se ve sin tocar y el aviso al tocar; 3xOSC revela su nombre con el puntero; ninguna copia de relleno muestra texto durante el bucle; el nombre no se recorta a 88 px de ancho; consola y red limpias; al imprimir no salen las tarjetas; actualizar `AGENTS.md` y `MEMORY.md` con el resultado. RF-22, RF-23, RF-24, RF-25, RF-26
  - Hecho cuando: la revisión queda anotada en `MEMORY.md` con lo comprobado en cada ancho y en táctil, el estado de la consola y de la red, y `AGENTS.md` describe la tarjeta de solo imagen con el texto al interactuar.