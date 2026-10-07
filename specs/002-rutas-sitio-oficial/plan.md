# Plan — Spec 002: Rutas del sitio oficial, galerías animadas de instrumentos y aviso de enlaces externos
Spec: `specs/002-rutas-sitio-oficial/spec.md` (v3, aprobada) · 21 RF + 6 RF no funcionales

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | modificar | Sustituye `.synths-grid` (3 tarjetas) por dos franjas: 14 instrumentos + 14 copias de relleno y 13 efectos + 13 copias; reescribe subtítulo y párrafo introductorio; `<h3>` de cada franja; imágenes remotas del anexo; tarjeta de 3xOSC sin enlace; bloque "Sitio oficial" del pie entre "Enlaces" y "Síguenos" | RF-1, RF-2, RF-5, RF-6, RF-7, RF-8, RF-12, RF-13, RF-15, RF-16, RF-N3, RF-N4 |
| `css/styles.css` | modificar | `.strip`, `.strip-track`, `.strip-card`, `.strip-card--filler`, animación del bucle en sentidos opuestos, pausa con `:hover` y `:focus-within`, aviso con `opacity`, bloque `@media (prefers-reduced-motion: reduce)`, anchos de tarjeta por rango, `.footer-content` a 4 columnas; **borra** `.synths-grid`, `.synth-card`, `.synth-image`, `.synth-external` y sus reglas responsive | RF-9, RF-10, RF-11, RF-14, RF-17, RF-18, RF-19, RF-N2 |
| `js/main.js` | modificar | Quita `.synth-card` (y `.strip-card`) de los selectores de `initScrollAnimations`. **No se añade ninguna función nueva** | RF-20, RF-N3 |
| `tests/helpers.js` | modificar | Sustituye `getSynthCards` por las funciones puras de franjas; añade `getMediaBlock` reutilizado tal cual | soporte de RF-6, RF-7, RF-8, RF-16 |
| `tests/sintetizadores.test.js` | **reescribir** | Contenido de las dos franjas: recuento y orden, destinos del anexo, imágenes por dominio, aviso presente, 3xOSC sin enlace | RF-6, RF-7, RF-13, RF-15, RF-16, RF-N4 |
| `tests/franjas.test.js` | **crear** | Mecánica del bucle en CSS: rótulos, copias decorativas, sentidos opuestos, duración, pausa con puntero y foco, `prefers-reduced-motion` y aviso con `opacity` | RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-14 |
| `tests/responsive.test.js` | modificar | Sustituye las reglas de `.synths-grid` por las de las franjas en ≤768 px, ≤480 px y >768 px, y el pie a 4 columnas; conserva lo de Características, Galería, `:root` y estilos obsoletos | RF-17, RF-18, RF-19, RF-N2 |
| `tests/entorno.test.js` | modificar | Invierte la comprobación de `initScrollAnimations`: las tarjetas de las franjas **no** deben estar en sus selectores; conserva las de cero dependencias y de no pintar contenido | RF-20, RF-N1, RF-N3 |
| `tests/secciones.test.js` | modificar | `NOMES_PROPIOS` con los 14 instrumentos, los 13 efectos y "FL Cloud"; fuera "Toxic Bio"; la sección sigue mencionando FL Studio | RF-12, RF-N5 |
| `tests/enlaces.test.js` | modificar (añadir) | Bloque "Sitio oficial": 7 enlaces, destinos exactos, `target`, `rel`, icono, posición entre "Enlaces" y "Síguenos" | RF-1, RF-2, RF-3, RF-5 |
| `AGENTS.md` | modificar | Sección de Sintetizadores (dos franjas) y pie (nuevo bloque); nota de pruebas | criterios de finalización, principio 2 |
| `MEMORY.md` | modificar | Registro de la implementación, resultados de `node --test` y de la revisión con Chrome DevTools | criterios de finalización, principios 2 y 4 |

## Funciones puras

- **No hay lógica de fechas en esta spec → no aplica el parámetro "hoy".**
- El JavaScript en ejecución no gana lógica nueva (RF-N3, principio 3): todo el comportamiento es CSS. La lógica vive en los tests, como funciones puras sobre cadenas en `tests/helpers.js`:

| Función | Firma | Qué devuelve |
|---|---|---|
| `getStrips` | `(html) → {name, id, label, cards, fillers}[]` | las dos franjas de la sección, con sus tarjetas originales y sus copias de relleno ya separadas |
| `getStripBlocks` | `(html) → string[]` | bloques `<div class="strip-scroll">…</div>` |
| `getStripCards` | `(stripHtml, {decorativas: boolean}) → string[]` | tarjetas originales o de relleno de una franja |
| `getCardName` | `(card) → string \| null` | texto del `.strip-card__name` |
| `getCardNotice` | `(card) → string \| null` | texto del `.strip-card__notice`, `null` si no lo tiene |
| `getCardImage` | `(card) → {src, alt} \| null` | imagen oficial de la tarjeta |
| `isDecorative` | `(tag) → boolean` | `true` si el elemento lleva `aria-hidden="true"` |
| `getOfficialLinks` | `(html) → {text, href, target, rel, hasIcon}[]` | los enlaces del bloque "Sitio oficial" del pie |
| `getFooterBlocks` | `(html) => string[]` | bloques del pie en orden de lectura |
| `getMediaBlock` | `(css, query) => string \| null` | **ya existe**, se reutiliza tal cual (también para `@media (prefers-reduced-motion: reduce)`) |
| `getRule`, `getRootVariables`, `getAttr`, `getImageSources`, `getImageDomains`, `getSection`, `getHeadingText`, `stripTags`, `getFunctionSource` | — | **se conservan sin cambios** |
| `getSynthCards` | — | **se elimina**: su expresión regular `^<a class="synth-card">` ya no corresponde a nada |

- Los tests envuelven estas funciones con lecturas de `fs` (la única parte con E/S, ya presente en `readProjectFile`).

## Algoritmo (pseudocódigo)

```
1. SECCIÓN #sintetizadores
   1.1 Eliminar .synths-grid completo (3 tarjetas) y el <p class="synth-external"> repetido.
   1.2 section-subtitle ← "Instrumentos y efectos que vienen dentro de FL Studio"
       (sigue mencionando FL Studio: RF-12 de la spec 001)
       intro ← párrafo nuevo, sin afirmar ninguna cantidad (RF-12 de la spec 002)

2. FRANJA DE INSTRUMENTOS
   2.1 <h3 id="strip-instrumentos">Instrumentos incluidos</h3>
   2.2 <div class="strip-scroll" role="group" tabindex="0" aria-labelledby="strip-instrumentos">
         <ul class="strip-track">
   2.3 por cada instrumento de INSTRUMENTOS (14, en el orden de RF-6):
         <li class="strip-card">
           <a class="strip-card__link" href=DESTINO target="_blank" rel="noopener noreferrer">
             <img class="strip-card__image" src=IMAGEN alt="<Nombre> en FL Studio,
                  imagen oficial de Image-Line" loading="lazy">
             <span class="strip-card__name">Nombre</span>
             <span class="strip-card__notice">Ver en image-line.com · se abre en una pestaña nueva</span>
           </a>
         </li>
         si DESTINO == null  →  el mismo <li> sin <a>, sin notice y sin tabindex (solo 3xOSC)
   2.4 repetir los 14 <li> como
       <li class="strip-card strip-card--filler" aria-hidden="true">  (sin <a>, sin href)

3. FRANJA DE EFECTOS (debajo, sentido contrario)
   3.1 <h3 id="strip-efectos">Efectos incluidos</h3>
   3.2 mismo patrón con los 13 efectos de RF-7 y sus 13 copias de relleno

4. PIE: insertar entre "Enlaces" y "Síguenos"
   <div class="footer-official">
     <h4>Sitio oficial</h4>
     <ul>
       <li><a href=RUTA target="_blank" rel="noopener noreferrer">
             FL Studio <svg class="external-icon" aria-hidden="true">…</svg></a></li>
       … los 7 de RF-2, con el icono en cada uno …
     </ul>
   </div>

5. CSS
   5.1 borrar .synths-grid, .synth-card, .synth-image, .synth-external y su regla ≤768 px
   5.2 .strip-scroll        → overflow: hidden (por defecto) / overflow-x: auto (reduced motion)
   5.3 .strip-track         → display: flex, width: max-content, gap: var(--strip-gap)
   5.4 @keyframes strip-left  : from translateX(0)            to translateX(-50%)
      @keyframes strip-right : from translateX(-50%)          to translateX(0)
      .strip--instrumentos .strip-track { animation: strip-left  var(--strip-duration) linear infinite }
      .strip--efectos      .strip-track { animation: strip-right var(--strip-duration) linear infinite }
      --strip-duration: 30s  (las dos iguales → la velocidad es proporcional a las tarjetas)
   5.5 PAUSA (RF-10):
        .strip:hover .strip-track,
        .strip:focus-within .strip-track { animation-play-state: paused }
   5.6 AVISO (RF-14):
        .strip-card__notice { opacity: 0 }                       /* sigue en el árbol accesible */
        .strip-card:hover .strip-card__notice,
        .strip-card:focus-visible .strip-card__notice { opacity: 1; color: acento }
   5.7 REDUCIR MOVIMIENTO (RF-11):
        @media (prefers-reduced-motion: reduce) {
          .strip-track  { animation: none; transform: none }
          .strip-scroll { overflow-x: auto }
        }
   5.8 ANCHOS: --strip-card-width: 220px (>768) | 180px (≤768) | 150px (≤480)
       --strip-name-size: 1rem (≥20px de altura de línea) | 0.95rem en ≤480
   5.9 .strip-card--filler { pointer-events: none }
   5.10 .footer-content { grid-template-columns: 2fr 1fr 1fr 1fr }   /* >768, RF-19 */
        (≤768 ya usa grid-template-columns: 1fr → los 4 bloques en una columna, RF-17)

6. JS: initScrollAnimations → la lista de selectores pierde ".synth-card"
   (no aparece ".strip-card"); ninguna función nueva

7. TESTS: rojo → código → verde, una tarea cada vez
```

## Interfaz (cómo se pinta)

- Todo es contenido fijo del HTML (RF-N3): 14 + 13 tarjetas originales y 27 copias de relleno, escritas a mano en `index.html`. Ninguna tarjeta se genera con JavaScript.
- Estructura de cada franja: `<h3>` visible con el rótulo ("Instrumentos incluidos" / "Efectos incluidos") + `<div class="strip-scroll">` con `role="group"` y `aria-labelledby` que apunta al `<h3>` (así el rótulo sirve de etiqueta accesible, RF-8) y `tabindex="0"` para que la franja sea recorrible con el teclado cuando hay desplazamiento manual (RF-11).
- La pista (`.strip-track`) es más ancha que la pantalla y se desplaza con `transform`; la franja recorta con `overflow: hidden`, de modo que la página nunca desplaza lateralmente (RF-9, RF-17).
- Tarjeta original: imagen oficial remota con `alt` que nombra el instrumento, nombre y el aviso. Sin párrafo de descripción (RF-13).
- Tarjeta sin enlace (3xOSC): mismo aspecto con `<span>` en lugar de `<a>`; sin aviso, sin `href`, no enfocable (RF-16).
- Copia de relleno: `<li>` con `aria-hidden="true"` y `pointer-events: none`; visualmente idéntica a la original para que el bucle no se note (RF-6, RF-7).
- Foco visible: las tarjetas enlazadas conservan el anillo de foco del navegador y el aviso se revela con `:focus-visible`, así que se distingue el recorrido con teclado del recorrido con ratón (RF-14).
- El bloque del pie reutiliza los estilos existentes de `.footer-links a` (color secundario, acento verde al pasar el ratón) y añade el icono ↗ como `svg` con `aria-hidden="true"`.

## Decisiones técnicas (alternativa descartada)

1. **Bucle infinito = lista duplicada en el HTML + `translateX` de `0` a `-50%`** en la pista, `linear infinite`. La pista contiene exactamente el doble de tarjetas, así que al.translateX(-50%) la primera tarjeta original queda exactamente donde empezaba la copia: vuelta continua sin hueco, corte ni solape (RF-9).
   - *Duplicar solo con `translateX` sin copias* → descartada: al llegar al final aparece un hueco vacío durante la vuelta.
   - *`animation-delay` negativo con desplazamiento manual* → descartada: el contenedor no puede ser a la vez zona desplazable por el usuario y pista animada; el estado de pausa queda ambiguo y, al reanudar, no hay un punto de retorno estable, lo que rompe el "sin salto visible" de RF-10. Es además la opción que más reglas necesita para cubrir los tres estados.
   - *Bucle en JavaScript con `requestAnimationFrame` o `scrollLeft`* → descartada: viola el principio 3 de la constitución (RF-N3) y añade un bucle de render permanente en una página que debe ser ligera.
   - **Por qué las copias de relleno son `<div>`/`<li>` sin enlace y con `aria-hidden="true"`**: si fueran enlaces, entrarían en el orden de tabulación y el lector de pantalla anunciaría catorce instrumentos dos veces, contradiciendo el recuento de RF-6 y RF-7. Al no ser elementos enfocables no hace falta pelea con `tabindex` (RF-16 para 3xOSC funciona por el mismo mecanismo).

2. **Pausa y reanudación con `animation-play-state: paused`** declarado únicamente bajo `.strip:hover` y `.strip:focus-within`. Al reanudar, la animación continúa desde el mismo instante, así que no hay salto (RF-10).
   - *Alternativa: clase de JavaScript que pone y quita `animation-play-state`* → descartada: la lógica ya la resuelve el navegador con dos pseudo-clases y añadiría JS innecesario.
   - *Alternativa: `animation: none` / borrar y recrear la animación* → descartada: reinicia la animación desde el principio, es decir, produce el salto que RF-10 prohíbe.
   - **Por qué una tarjeta sin enlace para la franja por puntero pero no por foco**: 3xOSC es un `<span>`, no un `<a>`, así que nunca puede ser el elemento enfocado y no activa `:focus-within`; pero está dentro de `.strip`, que sí activa `:hover`. Es exactamente lo que pide RF-16 y lo queRF-10 permite.

3. **"Reducir movimiento" = parar la animación y abrir el desplazamiento manual** con un único bloque `@media (prefers-reduced-motion: reduce)` que anula `animation` en la pista y cambia `.strip-scroll` a `overflow-x: auto` (RF-11).
   - *Alternativa: `animation-duration: 0.01ms`* → descartada: deja la pista desplazada y sin zona recorrible, que es lo contrario de una franja recorrible.
   - *Alternativa: ocultar la franja entera o mostrar un aviso* → descartada: rompe RF-11 y RF-18 (las tarjetas deben seguir visibles y utilizables).
   - **Anchos**: tarjeta de 220 px por encima de 768 px, 180 px hasta 768 px y 150 px hasta 480 px. Con el hueco de 16 px, a 640 px caben tres tarjetas originales y a 375 px caben dos, que es lo que exigen RF-18; el nombre usa 1rem (≈20 px de altura de línea) y baja a 0.95rem en ≤480 px, siempre por encima del mínimo de 14 px del nombre legible (definición de la spec).

4. **Aviso oculto visualmente pero disponible para lectores de pantalla = `opacity: 0`**, revelado con `.strip-card:hover` y `.strip-card:focus-visible` (RF-14).
   - *Alternativa: `visibility: hidden`* → descartada: saca el texto del árbol de accesibilidad, justo lo contrario de lo que pide RF-14.
   - *Alternativa: `display: none`* → descartada: además de sacarlo del árbol, hace saltar el diseño de la tarjeta al hacer hover.
   - *Alternativa: mantenerlo siempre visible* → descartada: es el comportamiento que el usuario pidió eliminar.
   - `opacity` mantiene el hueco reservado, así que la tarjeta no cambia de tamaño al aparecer el aviso.

5. **Las tarjetas de las franjas no usan la animación de entrada al hacer scroll**: se quita `.synth-card` de la lista de `initScrollAnimations` y la tarjeta pasa a llamarse `.strip-card`, que tampoco se añade (RF-20). El `IntersectionObserver` deja de observar 54 tarjetas de una franja que ya se mueve, y la entrada "desde abajo" compite visualmente con el desplazamiento continuo. El test de `tests/entorno.test.js` se invierte: pasa a exigir que esos selectores **no** aparezcan.

6. **Los tests validan las imágenes por dominio y forma de URL, nunca con `fetch`**. Image-Line devuelve `200` con la misma página esqueleto, el mismo título y la misma dirección canónica incluso para rutas inventadas, así que un test de red daría un falso positivo constante (queda registrado en el anexo de la spec).
   - *jsdom o cheerio para parsear el HTML* → descartadas: prohíben el principio 4; se usan `fs` + `node:test` + expresiones regulares, como ya hace el proyecto.
   - *Un test que descargue cada imagen* → descartada: mismo problema que `fetch`, más lentitud y dependencia de la red en cada ejecución.
   - *Playwright o Puppeteer para medir la duración del bucle* → descartadas: son dependencias y el principio 1 y el 4 las prohíben. La duración se comprueba leyendo la variable de CSS (`--strip-duration`) y se valida a ojo en Chrome DevTools.

7. **Una sola clase `.strip-card` para las dos franjas**, en lugar de una clase por franja (`.synth-card` para instrumentos y `.fx-card` para efectos).
   - *Dos clases con estilos duplicados* → descartada: obliga a mantener las mismas reglas de imagen, borde y hover dos veces y las dos franjas divergirían con el tiempo.
   - Nombres en inglés y concisos (`strip`, `strip-track`, `strip-card`), conforme al principio 6. Los estilos antiguos `.synths-*` se borran, no se dejan muertos.

## Estrategia de tests con `node --test`

| Fichero | Qué comprueba | RF |
|---|---|---|
| `tests/helpers.js` | (no es un test) Funciones puras de franjas y pie; se elimina `getSynthCards` | soporte |
| `tests/sintetizadores.test.js` *(reescrito)* | 14 instrumentos y 13 efectos, en el orden exacto de RF-6 y RF-7; 14 + 13 copias de relleno que no se cuentan; destino de cada tarjeta igual al anexo; `target="_blank"` y `rel` en las enlazadas; 3xOSC sin `href`, sin aviso y sin `tabindex`; una imagen por tarjeta en `https://` y dominio de Image-Line, con `alt` que nombra el instrumento; el aviso presente en el texto de cada tarjeta enlazada; ninguna tarjeta con párrafo de descripción | RF-6, RF-7, RF-13, RF-15, RF-16, RF-N4, RF-N5 |
| `tests/franjas.test.js` *(nuevo)* | Los dos `<h3>` "Instrumentos incluidos" / "Efectos incluidos" y su `aria-labelledby`; las copias llevan `aria-hidden="true"` y no tienen `href` ni `tabindex`; en CSS hay dos animaciones con sentidos opuestos y la misma duración; existen las reglas de pausa con `:hover` y `:focus-within`; el aviso se oculta con `opacity: 0` y se revela con `:hover` y `:focus-visible`; existe `@media (prefers-reduced-motion: reduce)` con `animation: none` y `overflow-x: auto` | RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-14 |
| `tests/responsive.test.js` | En ≤768 px: las franjas en una fila con su propia zona desplazable y el pie a una columna; en ≤480 px: tarjeta más estrecha y nombre ≥14 px; en >768 px: la franja a ancho completo y el pie con cuatro bloques en fila; **se conservan** las comprobaciones de Características, Galería, `:root` y ausencia de `.flex-*` y `.synths-grid` | RF-17, RF-18, RF-19, RF-N2 |
| `tests/entorno.test.js` | Invertido: `.synth-card` y `.strip-card` **no** aparecen en `initScrollAnimations`; se conservan las de cero dependencias y de que el JS no pinta contenido | RF-20, RF-N1, RF-N3 |
| `tests/secciones.test.js` | `NOMES_PROPIOS` con los 14 instrumentos, los 13 efectos y "FL Cloud"; "Toxic Bio" deja de ser grafía autorizada; el título o el subtítulo de `#sintetizadores` sigue mencionando FL Studio | RF-12, RF-N5 |
| `tests/enlaces.test.js` | El bloque "Sitio oficial" existe, está entre "Enlaces" y "Síguenos", tiene 7 enlaces con los destinos exactos de RF-2, `target="_blank"`, `rel`, icono en cada uno; los 4 enlaces internos del bloque "Enlaces" no cambian | RF-1, RF-2, RF-3, RF-5 |
| Chrome DevTools (manual, `/sdd-validate`) | Consola y red limpias; las 27 imágenes y los 27 iconos cargan sin huecos a 375 px, 640 px y 1280 px; la vuelta completa de cada franja dura entre 25 y 35 s; con puntero sobre la franja se detiene y reanuda sin salto; con el teclado el aviso aparece y la tarjeta enfocada queda a la vista; 3xOSC no aparece al tabular y sí detiene la franja con el puntero; el aviso se sigue anunciando con un lector de pantalla; con "reducir movimiento" nada se desplaza solo y la franja se recorre a mano; sin desplazamiento horizontal de la página en ningún ancho | RF-9, RF-10, RF-11, RF-14, RF-16, RF-17, RF-18, RF-19, RF-21 |

- Ciclo por tarea: test en rojo → código → `node --test` en verde → marcar la tarea → parar.
- El recuento final de la suite debe quedar por encima de los **45** tests actuales: los de la rejilla de tres tarjetas se sustituyen (no se suman encima).

## Mapa RF → parte del plan

| RF | Dónde se resuelve |
|---|---|
| RF-1, RF-2, RF-5 | Paso 4 (pie en `index.html`) + `tests/enlaces.test.js` |
| RF-3 | Icono `svg` en cada enlace del pie + `target`/`rel`; test y comprobación manual de pestaña nueva |
| RF-4 | Verificación manual en Chrome de las 7 rutas (no automatizable, el sitio devuelve 200 para rutas inventadas) |
| RF-6, RF-7 | Pasos 2 y 3 (14+14 y 13+13 tarjetas) + CSS del bucle + `tests/sintetizadores.test.js` |
| RF-8 | `<h3>` con `aria-labelledby` en cada franja + `tests/franjas.test.js` |
| RF-9 | Pasos 5.3 y 5.4 (`translateX` en sentidos opuestos, `--strip-duration`) |
| RF-10 | Paso 5.5 (`animation-play-state` con `:hover` y `:focus-within`) |
| RF-11 | Paso 5.7 (bloque `prefers-reduced-motion`) + `tabindex="0"` en la franja |
| RF-12 | Paso 1.2 (subtítulo e intro reescritos sin cantidades, manteniendo FL Studio) |
| RF-13 | Paso 2.3 (imagen con `alt` que nombra, sin párrafo) + `tests/sintetizadores.test.js` |
| RF-14 | Paso 5.6 (`opacity` + `:hover` + `:focus-visible`) + `tests/franjas.test.js` |
| RF-15 | Destinos del anexo aplicados en el paso 2.3 y comprobados en `tests/sintetizadores.test.js` |
| RF-16 | Tarjeta de 3xOSC sin `<a>` ni `tabindex` en el paso 2.3 + test |
| RF-17 | Paso 5.8 y 5.10 + `tests/responsive.test.js` |
| RF-18 | Anchos del paso 5.8 + `tests/responsive.test.js` |
| RF-19 | `.strip-scroll` a ancho completo y pie de 4 columnas (paso 5.10) |
| RF-20 | Paso 6 + `tests/entorno.test.js` invertido |
| RF-21 | Sin cambios de JS en comportamiento; se verifica en Chrome DevTools |
| RF-N1 | No se añade ninguna dependencia; `tests/entorno.test.js` lo sigue comprobando |
| RF-N2 | Se reutilizan variables de `:root` y el estilo de tarjeta; `tests/responsive.test.js` lo sigue comprobando |
| RF-N3 | Todo el HTML es fijo; el JS solo pierde un selector |
| RF-N4 | Las 27 imágenes se referencian por URL; el test valida dominio y forma, no descarga |
| RF-N5 | `tests/secciones.test.js` con la lista ampliada de nombres propios |
| RF-N6 | Toda la verificación automática con `node --test`, sin instalar nada |

## Riesgos

- **Volumen de marcado**: 54 tarjetas escritas a mano. Es lo más mecánico del trabajo y lo que más se va de 30 minutos si se hace de una vez; las tareas T3 y T4 lo separan y T5 puede dividirse en "estructura y bucle" y "avisos y responsive" si hace falta.
- **Transición a `-50%`**: si alguien cambia el número de copias de relleno sin cambiar el `-50%`, la vuelta deja de ser continua. `tests/franjas.test.js` comprueba que hay exactamente el doble de tarjetas y que la animación termina en `-50%`.
- **Ancho real de tarjeta**: los mínimos de RF-18 dependen de `--strip-card-width`; si se cambia el hueco, hay que volver a medir a 640 px y 375 px.

---

# Cambio 003 — Tarjeta de solo imagen con el texto al interactuar

> Añadido tras aprobar el Cambio 003 en la spec (RF-22…RF-26 nuevos; RF-6, RF-7, RF-11, RF-13, RF-14, RF-16, RF-17 y RF-18 enmendados). Consigue la v7 de la spec. Todo lo anterior de este plan sigue vigente.

## Archivos y responsabilidades (cambio 003)

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | modificar | Envolver el nombre y el aviso de las **54 tarjetas** en un bloque `.strip-card__meta` (27 originales y 27 copias), incluido el nombre suelto de 3xOSC | RF-13, RF-14, RF-16, RF-22, RF-26 |
| `css/styles.css` | modificar | Altura fija por rango, imagen a sangre, bloque de texto fuera del flujo, revelado con `:hover` y `:focus-visible`, guarda de las copias de relleno, bloque `@media (hover: none)` con la banda permanente y bloque `@media print` | RF-17, RF-18, RF-22, RF-23, RF-24, RF-25, RF-26 |
| `tests/helpers.js` | modificar | `getCardMeta(card)`; el resto de funciones se reutiliza tal cual | soporte |
| `tests/sintetizadores.test.js` | modificar (ampliar) | Que el bloque de texto exista en originales y copias, que la copia repita el de su original, y que 3xOSC conserve nombre sin enlace ni aviso | RF-13, RF-16, RF-22, RF-26 |
| `tests/franjas.test.js` | modificar (ampliar) | Mecánica del bloque de texto: oculto con opacidad y no con `visibility` ni `display`, revelado con `:hover` y `:focus-visible`, fuera del flujo, guarda de la copia de relleno, bloque `(hover: none)` y su orden respecto al de reducir movimiento | RF-14, RF-23, RF-24, RF-26 |
| `tests/responsive.test.js` | modificar (ampliar) | Aritmética de la altura en las dos ramas, con y sin banda, más la de anchuras que no cambia | RF-17, RF-18, RF-25 |
| `AGENTS.md` | modificar | Sección de Sintetizadores y nota de las tarjetas | Criterios de finalización |
| `MEMORY.md` | modificar | Registro del cambio y resultado de `node --test` y de la revisión con Chrome DevTools | Criterios de finalización, principio 4 |

**No toca** `js/main.js`: el movimiento sigue siendo solo CSS y no hay ningún manejador que añadir ni quitar.

## Funciones puras (cambio 003)

- **No hay lógica de fechas → no aplica el parámetro "hoy".**
- Se reutilizan tal cual `getStrips`, `getStripCards`, `getCardName`, `getCardNotice`, `getCardImage`, `isDecorative`, `getMediaBlock`, `getRule`, `getAttr` y las funciones locales de lectura de CSS de `tests/franjas.test.js` (`reglasDe`, `reglaDe`).
- **Nueva**: `getCardMeta(card) → string | null` devuelve el bloque `.strip-card__meta` de una tarjeta o `null` si no lo tiene.
- Las medidas de la aritmética (`aPx`, `variablePx`, `anchoUtil`) siguen siendo funciones locales de `tests/responsive.test.js`, que ya restan la barra de 15 px.

## Algoritmo (pseudocódigo del cambio 003)

```
1. MARCADO (54 tarjetas): por cada <li class="strip-card"> de las dos franjas
      envolver  (span.strip-card__name + span.strip-card__notice)
              en  <span class="strip-card__meta">
      · dentro de <a class="strip-card__link"> si la tarjeta tiene enlace
      · directamente dentro del <li> en 3xOSC, que no tiene <a>
      · las 27 copias reciben el mismo bloque, idéntico al de su original
    → se hace con un script de Node de un solo uso que lee el anexo de la spec
      y reescribe index.html; el script se borra después (el HTML sigue siendo fijo)

2. VARIABLES NUEVAS en .strip (junto a --strip-card-width y --strip-gap)
   --strip-card-height: 165px (>768) | 93px (≤768) | 66px (≤480)   # imagen a sangre, 4:3
   --strip-band-height: 44px                                          # 2 líneas × 20px + 4px

3. CSS · RAMA CON PUNTERO (base, `:hover` sostenido)
   .strip-card            → height: var(--strip-card-height);
                            padding: 0; overflow: hidden; position: relative
   .strip-card__image     → width: 100%; height: 100%;
                            aspect-ratio: auto; object-fit: cover
                            transition: transform var(--transition-fast);
                            transform-origin: bottom center
   .strip-card__meta      → position: absolute; left/right/bottom: 0;
                            opacity: 0;                 /* sigue en el árbol accesible */
                            background: var(--bg-tertiary);
   .strip-card:hover .strip-card__image       { transform: scale(1.06) }
   .strip-card:hover .strip-card__meta,
   .strip-card__link:focus-visible .strip-card__meta { opacity: 1 }
   .strip-card.strip-card--filler .strip-card__meta   { opacity: 0 }   /* guarda, al final */

4. CSS · RAMA SIN PUNTERO  (@media (hover: none), ANTES del bloque de reducir movimiento)
   .strip-card            → height: calc(var(--strip-card-height) + var(--strip-band-height))
   .strip-card__meta      → position: static; opacity: 1   (banda sólida bajo la imagen)
   .strip-card__name      → opacity: 1                     (nombre siempre visible)
   .strip-card__notice    → opacity: 0                     (aparece al tocar: :hover pegajoso)
   → 209 px a 1280, 137 px a 640, 110 px a 375

5. CSS · IMPRESIÓN
   @media print { .strip-scroll { display: none } }   (no se imprimen 54 imágenes)

6. TESTS: rojo → código → verde, una tarea cada vez
```

## Interfaz (cambio 003)

- La tarjeta es la imagen oficial a sangre, sin bordes ni relleno: en reposo se ve solo el artwork y la tarjeta mide lo que la imagen.
- Al pasar el puntero, la imagen crece un 6 % con origen abajo (su borde superior sube unos 10 px a 1280 px, 6 px a 640 px y 4 px a 375 px) y el bloque de texto aparece sobre la parte baja con fondo sólido; al salir, todo vuelve a su sitio.
- Al tabular hasta una tarjeta pasa exactamente lo mismo que con el puntero, porque el revelado también responde a `:focus-visible` (RF-23).
- En táctil no hay hover: la tarjeta lleva siempre una banda sólida de 44 px bajo la imagen con el nombre, y el aviso aparece dentro de esa banda al tocar.
- 3xOSC se comporta igual que las demás con el puntero y no tiene nada que revelar con el teclado, porque no es un enlace (RF-26).
- Las copias de relleno se ven siempre como una imagen pelada: nunca muestran texto, ni con puntero ni por el hecho de que la franja esté detenida.

## Decisiones (cambio 003, alternativa descartada)

1. **Los textos se envuelven en un bloque `.strip-card__meta`, no se posicionan por separado.**
   - *Descartada — posicionarlos por separado*: dos cajas absolutas con dos fondos y un hueco entre ellas por el que se vería la imagen entre el nombre y el aviso; además habría que duplicar las reglas de revelado.
   - Con un solo bloque hay una regla de revelado, un fondo y el orden interno del texto se mantiene.

2. **El bloque de texto se envuelve con un script de un solo uso que lee el anexo de la spec.**
   - *Descartada — editar las 54 tarjetas a mano*: son 27 originales y 27 copias; un error en una sola no lo detecta ningún test hasta que corre la suite, y el trabajo es puramente mecánico.
   - *Descartada — generar las tarjetas en el navegador con JavaScript*: lo prohíbe el principio 3 (RF-N3); la página sigue siendo HTML fijo.
   - El script lee los nombres, imágenes y destinos del anexo, que es la misma fuente de verdad que usa `tests/sintetizadores.test.js`, y **se borra al terminar**: no queda como paso de construcción.

3. **Altura fija por rango con dos ramas, y la banda depende del puntero, no del ancho.**
   - Rama **con puntero** (base, cualquier ancho): la tarjeta mide solo la imagen —165 px a 1280, 93 px a 640, 66 px a 375— y el texto va sobre ella.
   - Rama **sin puntero** (`@media (hover: none)`): la tarjeta mide imagen + banda —209 px a 1280, **137 px a 640** y **110 px a 375**— con el nombre siempre visible.
   - Los 137 y 110 px de la tabla de RF-25 son los de la rama sin puntero, que es como los ve el usuario en móvil; en un navegador de escritorio estrecha se aplica la rama con puntero y la tarjeta es más baja. Las dos ramas respetan RF-25 porque la altura es fija dentro de cada una.
   - *Descartada — decide la banda por ancho (`max-width: 768px`)*: en una tableta con stylus o en un móvil con ratón bluetooth se trataría como un escritorio y la tarjeta se quedaría sin nombre visible; y en un escritorio estrecho con ratón se trataría como un móvil y se reservaría una banda que nunca se usa.
   - *Descartada — dejar la altura al contenido con una banda reservada*: es el fallo que se quiere corregir; el texto se envolvía en muchas líneas y lo recortaba `overflow: hidden`.

4. **La imagen sube creciendo con origen abajo (`scale(1.06)`, `transform-origin: bottom center`), no desplazándose.**
   - *Descartada — `translateY(-6px)`*: abriría un hueco de 6 px arriba dentro de la tarjeta, porque la imagen mide justo el alto de la tarjeta; el hueco se vería como un error.
   - *Descartada — no mover la imagen y solo fundir el texto*: el usuario pidió expresamente que la imagen suba un poco al hacer hover; el efecto de "se abre hacia arriba" es justo lo que da profundidad.
   - La transición es la de la casa: `var(--transition-fast)` (0,2 s ease).

5. **El texto va sobre la parte baja de la imagen en la rama con puntero, y en una banda sólida bajo la imagen en la rama sin puntero.**
   - El artwork de Image-Line ya tiene sus propios colores oscuros y acentos verdes; un texto encima compite con ellos y su legibilidad depende de qué imagen toque. Sobre la imagen se le pone un fondo sólido, y en la rama sin puntero, donde el texto está siempre, se le da su propia banda para no tapar el artwork de forma permanente.
   - *Descartada — mantener el aviso superpuesto con un degradado semitransparente en las dos ramas*: es lo que hace hoy el bloque de la galería del hero y funciona bien allí porque el texto es una línea; aquí el texto son dos elementos y la tarjeta es de 88 px en móvil.

6. **Accesibilidad: opacidad, no `visibility` ni `display`; revelado con `:hover` y `:focus-visible`; la tarjeta sin enlace solo responde al puntero.**
   - El nombre y el aviso siguen dentro del enlace (o del `<li>` en 3xOSC) con `opacity: 0`, así que el nombre accesible del enlace no cambia: "Flex Ver en image-line.com · se abre en una pestaña nueva".
   - *Descartada — `visibility: hidden`*: saca el texto del árbol accesible (ya se descartó en el cambio anterior y no se revive).
   - 3xOSC revela su nombre porque la regla de revelado se escribe sobre `.strip-card:hover`, es decir sobre la tarjeta y no sobre el enlace. Como no tiene enlace, no hay regla de foco que la alcance: es la única tarjeta cuyo texto aparece sin teclado, y es justo lo que pide RF-26.

7. **Guarda explícita para la copia de relleno: `.strip-card.strip-card--filler .strip-card__meta { opacity: 0 }`, escrita después de las reglas de revelado.**
   - `pointer-events: none` ya evita que la copia reciba el puntero, pero no protege de un futuro error: si alguien escribiera la revelación sobre un antepasado (por ejemplo `.strip:hover .strip-card__meta`), aparecerían los 27 textos a la vez. Con la guarda de especificidad igual y colocada al final, la copia no tiene texto nunca, y un test lo comprueba.
   - *Descartada — `!important`*: funciona pero ensucia la hoja y esconde el motivo.
   - *Descartada — no añadir la guarda y confiar en `pointer-events: none`*: depende de que nadie escriba una regla de revelado sobre `.strip`, y nada lo impide hoy.

8. **Orden de los bloques de medios: `(hover: none)` antes de `prefers-reduced-motion`.**
   - `tests/franjas.test.js` calcula el CSS normal cortando la hoja en el índice de `prefers-reduced-motion`, así que cualquier bloque colocado después sería invisible para esos tests, y además el test de cascada exige que el de reducir movimiento sea el último de la hoja.
   - Se comprueba con un test que compara `css.indexOf('hover: none') < css.indexOf('prefers-reduced-motion')`, el mismo criterio que ya usa el test de cascada existente.

## Estrategia de tests del cambio 003 (cambio 003)

| Fichero | Qué se amplía | RF |
|---|---|---|
| `tests/helpers.js` | `getCardMeta(card)` | soporte |
| `tests/sintetizadores.test.js` | Las comprobaciones de destino, nombre, aviso y ausencia de párrafo siguen igual; se añaden: toda tarjeta original y toda copia llevan bloque de texto; el bloque de cada copia repite el nombre de su original y su aviso; 3xOSC tiene bloque de texto con su nombre y sigue sin enlace, sin aviso y sin `tabindex` | RF-13, RF-16, RF-22, RF-26 |
| `tests/franjas.test.js` | El aviso deja de comprobarse solo y pasa a comprobarse el bloque de texto: se oculta con `opacity: 0` y no con `visibility: hidden` ni `display: none`; se revela con `:hover` **y** con `:focus-visible`; está posicionado fuera del flujo; la imagen declara transición y transformación; existe la guarda de la copia de relleno **después** de las reglas de revelado; existe el bloque `(hover: none)` con el nombre siempre visible; y ese bloque va antes del de reducir movimiento | RF-14, RF-23, RF-24, RF-26 |
| `tests/responsive.test.js` | La aritmética de anchuras no se toca; se añade la de alturas en las dos ramas: en la base, 165 / 93 / 66 px; en `(hover: none)`, la suma de la altura de imagen y la banda de 44 px (209 / 137 / 110 px); y que el nombre en ≤480 px siga con fuente ≥14 px y línea ≥20 px. El descuento de la barra de 15 px se mantiene | RF-17, RF-18, RF-25 |
| Chrome DevTools (manual) | Ver la tabla del apartado siguiente | RF-22, RF-23, RF-24, RF-25, RF-26 |

- Ningún test descarga imágenes ni usa `fetch` contra image-line.com: el sitio devuelve respuestas ambiguas, como ya consta en la nota del anexo de imágenes de la spec.
- Ciclo por tarea: test en rojo → código → `node --test` en verde → marcar → parar. La suite parte de **127 tests** y no puede bajar de ese número.

### Verificación en Chrome DevTools (cambio 003)
A 1280 px, 640 px y 375 px, y a 375 px también con **emulación de dispositivo táctil** (el redimensionado de ventana no baja de unos 500 px): en reposo solo se ve la imagen de cada tarjeta; al pasar el puntero aparecen el nombre y el aviso y **el alto de la tarjeta es el mismo** antes y después; al tabular hasta una tarjeta pasa lo mismo que con el puntero; con emulación táctil el nombre se ve sin tocar y el aviso aparece al tocar, sin que la tarjeta cambie de alto; el nombre de 3xOSC aparece con el puntero; durante el bucle ninguna copia de relleno muestra texto; el nombre no se recorta en una tarjeta de 88 px de ancho; la consola y la red siguen limpias; y al imprimir no salen las tarjetas.

## Mapa RF → parte del plan (cambio 003)

| RF | Dónde se resuelve |
|---|---|
| RF-6, RF-7 (enmendados) | Paso 1 (las copias reciben el mismo bloque) + guarda del paso 3 + `tests/franjas.test.js` |
| RF-11 (enmendado) | El nombre se lee sin depender del puntero: en la rama sin puntero es visible, y en reposo sigue en el árbol accesible; no hay nada que cambiar en el bloque de reducir movimiento |
| RF-13 (enmendado) | Paso 1 (el bloque envuelve nombre y aviso, sin párrafo de descripción) + `tests/sintetizadores.test.js` |
| RF-14 (enmendado) | Paso 3 (el aviso pasa a formar parte del bloque de texto, fuera del flujo) + `tests/franjas.test.js` |
| RF-16 (enmendado) | Paso 1 (3xOSC con bloque de texto y sin enlace) + regla de revelado sobre `.strip-card:hover` |
| RF-17 (enmendado) | Pasos 2 y 4 (altura por rango y banda en la rama sin puntero) + `tests/responsive.test.js` |
| RF-18 (enmendado) | La aritmética de anchuras no cambia: 3 tarjetas a 640 px y 2 a 375 px; se añade la de alturas en `tests/responsive.test.js` |
| RF-22 | Paso 3 (padding 0, imagen a sangre, bloque de texto absoluto) |
| RF-23 | Paso 3 (opacidad, `:hover` + `:focus-visible`, fondo del bloque, `scale(1.06)` con transición) + `tests/franjas.test.js` |
| RF-24 | Paso 4 (bloque `(hover: none)` con la banda y el nombre siempre visible) |
| RF-25 | Paso 2 (variables `--strip-card-height` y `--strip-band-height`) + `tests/responsive.test.js` |
| RF-26 | Guarda de la copia de relleno y regla de revelado sobre la tarjeta (paso 3) + `tests/franjas.test.js` y `tests/sintetizadores.test.js` |

## Riesgos (cambio 003)

- **Orden de los bloques de medios**: si `(hover: none)` se coloca después de `prefers-reduced-motion`, los tests dejan de verlo. Lo comprueba un test explícito.
- **Copias de relleno**: si la guarda se escribe antes de las reglas de revelado, lapierde por orden. También lo comprueba un test.
- **Script de un solo uso**: si se deja en el proyecto, parecería un paso de construcción y violaría la lectura de "contenido fijo". Se borra en la misma ronda.
- **La banda de 44 px**: está calculada para dos líneas a 14 px. Si un nombre OCCupara una tercera línea, el texto se recortaría; en ese caso hay que subir `--strip-band-height`, no a achicar la fuente, porque el nombre legible exige 14 px.