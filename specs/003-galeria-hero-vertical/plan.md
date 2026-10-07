# Plan — Spec 003: Galería vertical animada en el fondo del hero
Spec: `specs/003-galeria-hero-vertical/spec.md` (v2, aprobada) · 23 RF + 7 RF no funcionales

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | modificar | Quita los dos orbes del bloque de decoración del hero e inserta allí la galería: 4 columnas con 33 imágenes originales y sus 33 copias, dentro de un contenedor decorativo; añade la capa de degradado como última hija del bloque de decoración; deja intactos el título con sus dos `<span>`, el subtítulo, los dos botones y el indicador de scroll | RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-11, RF-13, RF-19, RF-22, RF-N2 |
| `css/styles.css` | modificar | Variables nuevas de degradado y sombra en `:root`; **borra** `.glow-orb`, `.glow-orb-1`, `.glow-orb-2`, `@keyframes float`, `@keyframes pulse-glow`, el brillo verde de `.title-line.accent`, `@keyframes bounce` y el `animation: bounce` de `.scroll-arrow`; **añade** la galería (contenedor, columnas, pistas, tarjetas 4:3), el bucle `translateY` de 0 a -50 %, las duraciones por columna, el ocultado de columnas por rango, la capa de degradado, las sombras de texto, la pausa con `:focus-within`, la ampliación del bloque de reducir movimiento y el bloque de impresión | RF-4, RF-5, RF-9, RF-10, RF-12, RF-13, RF-15, RF-16, RF-17, RF-18, RF-20, RF-21, RF-N3 |
| `js/main.js` | modificar | **Borra entero** el manejador de scroll del parallax del hero. No se añade ninguna función | RF-14 |
| `tests/helpers.js` | modificar | Funciones puras nuevas del hero y **traslado** de las de cascada que hoy viven dentro de `tests/franjas.test.js` (`reglasDe`, `leerAnimacion`, `getKeyframes`, `especificidad`, `anula`) para que las usen los dos ficheros de test | soporte |
| `tests/hero.test.js` | **crear** | Mecánica de la galería: columnas, imágenes, bucle, duraciones, decoratividad, degradado, sombras, aritmética de RF-10, reparto, pausa, reducir movimiento e impresión | RF-1…RF-12, RF-15…RF-18, RF-20, RF-21 |
| `tests/franjas.test.js` | modificar | Usa las funciones puras trasladadas a `helpers.js`; su test de cascada se conserva intacto y sirve de referencia | RF-17, RF-16 |
| `tests/responsive.test.js` | modificar | Amplía la lista de estilos obsoletos (orbes, `float`, `pulse-glow`, `bounce`) y añade la aritmética de columnas por rango del hero | RF-10, RF-13, RF-18, RF-N3 |
| `tests/entorno.test.js` | modificar | Exige que el JavaScript ya no tenga el manejador de scroll del hero ni referencias a los orbes | RF-14, RF-N1, RF-N2 |
| `tests/contenido.test.js` | modificar | Vigila que la galería no introduzca texto ni párrafos antes del subtítulo del hero | RF-1, RF-5 |
| `AGENTS.md` | modificar | Sección del hero, funcionalidades de JavaScript y notas | Criterios de finalización, principio 2 |
| `MEMORY.md` | modificar | Registro, resultados de `node --test`, revisión con el navegador y qué muestra cada captura de función | Criterios de finalización, principios 2 y 4 |
| `specs/003-galeria-hero-vertical/spec.md` | modificar | Paso a `Estado: implementada` al cerrar la última tarea | Criterios de finalización |

## Funciones puras

- **No hay lógica de fechas en esta spec → no aplica el parámetro "hoy".**
- El JavaScript en ejecución **no gana lógica ninguna**: todo el movimiento es CSS. La lógica vive en los tests, como funciones puras sobre cadenas en `tests/helpers.js`.

| Función | Firma | Qué devuelve |
|---|---|---|
| `getHeroGallery` | `(html) => string \| null` | bloque de decoración del hero (`<div class="hero-bg">…</div>`) |
| `getGalleryBlocks` | `(html) => string[]` | los dos hijos del bloque de decoración: la galería y la capa de degradado, en ese orden |
| `getGalleryColumns` | `(html) => string[]` | los `<div class="hero-gallery__column">` en orden de lectura |
| `getGalleryCards` | `(columnaHtml, {decorativas}) => string[]` | tarjetas originales o copias de relleno de una columna |
| `getGalleryImage` | `(card) => {src, alt} \| null` | imagen de una tarjeta de galería |
| `getScrim` | `(html) => string \| null` | la capa de degradado del hero |
| `reglasDe` | `(texto) => {selectores, declaraciones}[]` | reglas del CSS con selectores separados, ignorando comentarios |
| `reglaDe` | `(texto, selector) => string \| null` | declaraciones de la regla con ese selector exacto |
| `leerAnimacion` | `(declaraciones) => {nombre, duracion} \| null` | nombre y duración de una animación, en forma corta o larga |
| `getKeyframes` | `(css, nombre) => string \| null` | cuerpo de un bloque `@keyframes` |
| `recorridoDe` | `(nombre, css) => {inicio, fin} \| null` | de dónde a dónde mueve la pista una animación, en % |
| `segundosDe` | `(duracion, css) => number \| null` | duración en segundos, resolviendo `var(--x)` con lo declarado en la hoja |
| `especificidad` | `(selector) => [n, m]` | especificidad de un selector |
| `anula` | `(anulador, objetivo) => boolean` | `true` si el selector anulador iguala o supera al objetivo |
| `getMediaBlock` | `(css, query) => string \| null` | **ya existe**, se reutiliza tal cual |

- `stripTags`, `getSection`, `getAttr`, `getImageSources`, `getImageDomains`, `getMediaBlock`, `getRule`, `getRootVariables`, `getFunctionSource`, `isDecorative` → **se conservan sin cambios**.

## Algoritmo (pseudocódigo)

```
1. LISTA DE LAS 33 IMÁGENES (única fuente de verdad: los anexos de las specs)
   capturas ← 6 filas de la tabla "6 capturas oficiales de FL Studio" (spec 003)
   plugins   ← 27 filas de "Imagen oficial de cada tarjeta" (spec 002, en su orden)
   lista ← [capturas[0]] ++ plugins ++ capturas[1..5]        # 1 + 27 + 5 = 33
   # capturas[0] es la interfaz completa: al ir primera cae en la columna 1,
   # que es la única columna visible en todos los anchos

2. REPARTO EN 4 COLUMNAS
   para i, imagen ∈ lista (i desde 0):
       columna ← i mod 4
       añadir <div class="hero-gallery__item"> <img src=imagen alt=""> </div>
                 a la columna[columna]
   → 9, 8, 8, 8 tarjetas (diferencia máxima 1, RF-11)

3. COPIAS DE RELLENO
   para cada columna:
       duplicar su lista de items dentro del mismo track, marcando las copias
       como decorativas: <div class="hero-gallery__item hero-gallery__item--filler"
                                aria-hidden="true">
   → 66 imágenes en total (33 originales + 33 copias)

4. HTML DEL HERO
   <section class="hero" id="hero">
     <div class="hero-bg">
       <div class="hero-gallery" aria-hidden="true">        ← primera capa
         <div class="hero-gallery__column hero-gallery__column--1">
           <div class="hero-gallery__track"> items originales + copias </div>
         </div>
         × 4 columnas
       </div>
       <div class="grid-overlay"></div>                       ← segunda capa, se conserva
       <div class="hero-gallery__scrim"></div>               ← tercera capa, degradado
     </div>
     <div class="hero-content">  h1 + subtítulo + botones  </div>   (z-index: 2)
     <div class="scroll-indicator"> … </div>                        (z-index: 2)
   </section>
   · se borran los dos <div class="glow-orb…">
   · el h1 sigue siendo <h1><span class="title-line">FL</span>
     <span class="title-line accent">STUDIO</span></h1>

5. CSS: VARIABLES NUEVAS EN :root
   --overlay-rgb: 10 10 10          (tono del negro del fondo, sin color nuevo suelto)
   --overlay-opacity: 0.72          (tramo central, ≥ 0.7 por RF-9)
   --overlay-opacity-edge: 0.35     (tramos superior e inferior)
   --shadow-color: rgba(0, 0, 0, 0.9)
   --shadow-hero: 0 2px 14px var(--shadow-color)

6. CSS: SE BORRA
   .glow-orb, .glow-orb-1, .glow-orb-2
   @keyframes float
   @keyframes pulse-glow  +  animation: pulse-glow  de .title-line.accent
   el text-shadow verde de .title-line.accent  (conserva color: var(--accent-primary))
   @keyframes bounce  +  animation: bounce  de .scroll-arrow
   · NO se toca el box-shadow verde de .btn-primary / .btn-secondary

7. CSS: LA GALERÍA
   .hero-bg            → ya es absolute/inset:0/z-index:0: se reutiliza
   .hero-gallery       → position:absolute; inset:0; overflow:hidden;
                         display:grid; grid-template-columns: repeat(4, 1fr);
                         gap: 16px; pointer-events:none
   .hero-gallery__column  → overflow:hidden (recorta la pista, sin barra)
   .hero-gallery__track   → display:flex; flex-direction:column; gap:12px;
                            width:100%;
                            animation: hero-rise var(--d) linear infinite;
                            --d distinta en cada columna (25 000-50 000 ms)
   @keyframes hero-rise { from { transform: translateY(0) } to { transform: translateY(-50%) } }
   .hero-gallery__item   → aspect-ratio: 4/3; overflow:hidden;
                          background: var(--bg-tertiary)   (color de reserva)
   .hero-gallery__item img → width:100%; height:100%; object-fit:cover;
                            object-position:center

8. CSS: COLUMNAS VISIBLES POR RANGO (sin JavaScript)
   > 768 px           → se ven las 4
   ≤ 768 px           → .hero-gallery { grid-template-columns: repeat(3,1fr); gap:12px }
                        .hero-gallery__column--4 { display: none }
   ≤ 480 px           → .hero-gallery { grid-template-columns: repeat(2,1fr); gap:8px }
                        .hero-gallery__column--3, .hero-gallery__column--4 { display:none }
   .hero-content, .scroll-indicator → position:relative; z-index:2

9. CSS: PAUSA SOLO CON FOCO
   .hero:focus-within .hero-gallery__track { animation-play-state: paused }
   · NO hay ninguna regla que pause con :hover (RF-15)

10. CSS: DEGRADADO Y SOMBRAS
   .hero-gallery__scrim → background: linear-gradient(180deg,
        rgb(var(--overlay-rgb) / var(--overlay-opacity-edge)) 0%,
        rgb(var(--overlay-rgb) / var(--overlay-opacity)) 35%,
        rgb(var(--overlay-rgb) / var(--overlay-opacity)) 65%,
        rgb(var(--overlay-rgb) / var(--overlay-opacity-edge)) 100%)
   text-shadow: var(--shadow-hero) en .hero-title, .title-line, .hero-subtitle,
                 .btn-primary, .btn-secondary, .scroll-indicator

11. CSS: BLOQUE ÚNICO DE REDUCIR MOVIMIENTO (al final de la hoja)
    dentro del bloque @media (prefers-reduced-motion: reduce) que YA existe:
      .hero-gallery__column--1 .hero-gallery__track,
      .hero-gallery__column--2 .hero-gallery__track,
      .hero-gallery__column--3 .hero-gallery__track,
      .hero-gallery__column--4 .hero-gallery__track { animation: none; transform: none }
      · los mismos selectores compuestos que asignan la animación (RF-16)
      · NINGÚNA zona desplazable dentro del hero (RF-16)
      · las reglas de las franjas que ya están, sin tocar (no llevan strip-track)

12. CSS: IMPRESIÓN
    @media print { .hero-bg { display: none } }   · el hero conserva su texto

13. JS: se borra entero el manejador de scroll del parallax (línea ~147 a ~161)
    · dentro solo se movían .hero-content y .glow-orb: los dos han desaparecido

14. TESTS: rojo → código → verde, una tarea cada vez
```

## Nota de desviación de la spec (a corregir en la próxima revisión)
La tabla de RF-10 de la spec calcula el ancho de las columnas sobre el ancho **útil** (ventana menos el relleno del hero: 1201 / 593 / 328 px), pero esta spec también exige que la galería sea **fondo completo** y ocupe también el relleno horizontal (RF-1 y RF-18). Con la galería a sangre completa, el ancho disponible es el del hero sin descontar su relleno: **1265 / 625 / 360 px**. Con las columnas dimensionadas por rejilla (`repeat(N, 1fr)` + hueco) los anchos reales en los tres anchos de referencia son:

| Ancho | Columnas | Hueco | Ancho de columna | Tarjeta 4:3 | Paso (tarjeta + hueco) | Tarjetas completas en hero de 640 px | Mitad de la pista |
|---|---|---|---|---|---|---|---|
| 1280 px | 4 | 16 px | 304 px | 304×228 | 240 px | 2 (480 px) | 9 × 240 = 2160 px |
| 640 px | 3 | 12 px | 200 px | 200×150 | 162 px | 3 (486 px) | 9 × 162 = 1458 px |
| 375 px | 2 | 8 px | 176 px | 176×132 | 144 px | 4 (576 px) | 9 × 144 = 1296 px |

Los tres rangos cumplen los mínimos de RF-10 (≥ 2 tarjetas completas con hero de 640 px y mitad de pista ≥ 1,5 veces el alto del hero), así que el requisito no se rompe; lo que cambia son las cifras absolutas de la tabla (288/189/160 px → 304/200/176 px). **La sesión principal debería corregir esa tabla de la spec en la siguiente revisión.** Se ha avisado antes de tocar nada.

## Interfaz (cómo se pinta)

- El hero sigue siendo el mismo bloque de alto completo con el título, el subtítulo y los dos botones encima, y el indicador de scroll abajo. Solo cambia el fondo: donde antes había una cuadrícula y dos orbes verdes, ahora hay cuatro columnas de tarjetas 4:3 con las imágenes oficiales.
- La galería es la primera capa dentro del bloque de decoración del hero; encima va la cuadrícula estática (que se conserva) y encima de todo la capa de degradado. El texto del hero va en una capa con `z-index` declarado, para que la galería no lo descentre ni le robe el clic.
- Cada columna recorta su pista (`overflow: hidden`) y la pista se desplaza hacia arriba; al repetir el grupo de tarjetas una vez y desplazarse la mitad de su altura, la vuelta no tiene costura.
- Las columnas se dimensionan por rejilla, así que siempre suman el ancho disponible y nunca queda un hueco lateral ni hace falta calcular píxeles a mano.
- Las copias de relleno son visualmente idénticas a las originales, pero llevan `aria-hidden="true"` y no tienen enlace ni `tabindex`.
- Tarjetas 4:3 con la imagen recortada por el centro: las seis capturas encajan casi enteras y las miniaturas cuadradas pierden los bordes superior e inferior, que es justo lo que no importa de una captura de plugin.
- En escritorio la galería no se detiene al pasar el puntero, porque el puntero está sobre el hero casi siempre; sí se detiene cuando el foco entra en uno de los dos botones.
- Con "reducir movimiento" activo las columnas quedan quietas y alineadas arriba, y el hero se lee como una entrada normal; no hay ninguna zona desplazable dentro del hero para no atrapar el scroll de la página.
- Al imprimir no sale la galería, solo el texto.

## Decisiones técnicas (alternativa descartada)

1. **La galería vive dentro de `.hero-bg`, no como hermana.** Ese bloque ya es `position: absolute; inset: 0; z-index: 0`, es decir, ya es la capa de decoración del hero, y reutilizarlo deja el orden de capas (galería → cuadrícula → degradado → texto) escrito en un solo sitio.
   - *Descartada — `<div class="hero-gallery">` como hermana de `.hero-bg`*: deja dos bloques absolutos de decoración y el orden pasa a depender solo del orden en el HTML, sin un punto único donde razonarlo.
   - *Descartada — dentro de `.hero-content`*: el texto es un bloque centrado con ancho máximo; meter la galería dentro pondría el fondo dentro de la caja del texto y lo descentraría.
   - **`.hero` es `display: flex`**: por eso la galería es absoluta y no flex, y por eso el texto recibe `z-index` explícito.

2. **Ocultar las columnas sobrantes con `display: none` en los media queries, con modificadores por columna.** Nada de JavaScript, nada de clases añadidas por script.
   - *Descartada — `visibility` u `opacity`*: las columnas seguirían ocupando sitio y la rejilla quedaría descuadrada; `display: none` es lo único que las saca de la cuenta.
   - *Descartada — reordenar con `order`*: dejaría huecos entre columnas.

3. **Bucle vertical: pista duplicada y `translateY` de 0 a -50 %.** Es el mismo mecanismo que ya usan las franjas, girado 90 grados.
   - *Descartada — `calc(-100% + 100vh)` sin duplicar*: la ventana del hero y la altura de la pista son distintas, y aparecería un salto al final de la vuelta.
   - *Descartada — `scrollTop` en JavaScript*: viola el principio 3 y añade un bucle de render permanente.
   - *Descartada — `background-image` en el CSS*: saca el contenido del HTML (principio 3) y rompe los tests que validan imágenes en el marcado.
   - **Por qué las copias no pueden ser tabulables**: la galería es adorno y no tiene enlaces, así que sus 66 imágenes no deben aparecer en el recorrido con el teclado ni ser anunciadas; se marcan como decorativas y sin `tabindex`.

4. **Reparto: `[interfaz completa] + 27 del anexo + [las otras 5 capturas]`, repartido por turnos (`columna = índice mod 4`).**
   - Se mantiene **el orden del anexo de la spec 002 intacto** dentro de la lista, para que el test pueda compararlo con el anexo; intercalarlo no aportaría nada visual.
   - La captura de la interfaz completa se pone **la primera** a propósito: con el reparto por turnos cae en la columna 1, que es la única columna visible en los tres anchos. Si se dejara al final de la lista caería en la columna 4, que en móvil está oculta, y el hero de 375 px perdería la única imagen de la interfaz completa (justo el riesgo que anota la spec).
   - Resultado: 9, 8, 8 y 8 tarjetas, diferencia máxima de una (RF-11).
   - *Descartada — bloques contiguos (instrumentos, efectos, capturas)*: daría columnas de 14, 13, 4 y 2 tarjetas, muy desiguales, y la columna con las capturas sería la más corta.

5. **Cuatro variables nuevas en `:root`, todas de opacidad y sombra, ninguna de tono.** Hoy no existe ninguna variable de degradado ni de sombra de texto, así que se añaden: `--overlay-rgb`, `--overlay-opacity` (0,72, el tramo central), `--overlay-opacity-edge` (0,35) y `--shadow-color` + `--shadow-hero`. El negro del degradado sale de `--bg-primary` pasado a RGB, así que no se introduce un color nuevo suelto.
   - Se aplican a `.hero-title`, `.title-line`, `.hero-subtitle`, `.btn-primary`, `.btn-secondary` y `.scroll-indicator`: todos quedan sobre el fondo en movimiento.
   - *Descartada — quitar el brillo de los botones*: es legibilidad y no movimiento, y los botones se usan en toda la página (RF-13). Lo que se quita es el brillo verde del título, que sí era decoración animada.

6. **El degradado se declara con alfa por tramo**, no con `opacity` en la capa: `rgb(var(--overlay-rgb) / var(--overlay-opacity))` en el tramo central (35 %-65 %) y el valor de borde en los extremos. Con `opacity` en la capa no se podría distinguir el tramo central del resto, que es justo lo que RF-9 pide comprobar.
   - *Descartada — un color plano con opacidad única*: dejaría el título sin protección en la parte alta y en la baja de la columna de imágenes.

7. **El parallax se borra entero.** En el código es un `window.addEventListener('scroll', …)` anónimo a nivel de módulo (no una función con nombre), y dentro solo mueve `.hero-content` y los `.glow-orb`. Los dos desaparecen, así que el manejador se va completo; dejar medio manejador sería código muerto.
   - El test lo comprueba contando los `window.addEventListener('scroll'` del fichero: pasan de 2 a 1, el de la navbar.

8. **El bloque único de reducir movimiento se amplía dentro, no se añade otro.** La función de test que lee el bloque usa `indexOf` y devuelve **solo el primero**, así que un segundo bloque para el hero quedaría sin comprobar (RF-17). Se añaden dentro del bloque existente los cuatro selectores compuestos de las pistas del hero, con `animation: none` y `transform: none`, sin ninguna zona desplazable.
   - *Descartada — un bloque nuevo al final*: invisible para `getMediaBlock`, y el test de `tests/franjas.test.js` seguiría comprobando solo las franjas.

9. **La lógica de cascada se traslada a `tests/helpers.js` y la comparten los dos ficheros de test.** Hoy `especificidad`, `anula`, `reglasDe`, `leerAnimacion` y `getKeyframes` están escritas dentro de `tests/franjas.test.js`, y el test de reducir movimiento solo recoge como selectores anuladores los que contienen `strip-track`. `tests/hero.test.js` necesita el mismo cálculo para sus propios selectores, y copiar el código produciría dos reglas de cascada que se pueden desincronizar; se trasladan y las usa cada fichero con su filtro.
   - Con eso el test de las franjas sigue exactamente igual: sus selectores no contienen `hero-gallery`, así que la ampliación del bloque no le afecta.

## Estrategia de tests con `node --test`

| Fichero | Qué comprueba | RF |
|---|---|---|
| `tests/helpers.js` | (no es test) Funciones puras del hero y traslado de las de cascada | soporte |
| `tests/hero.test.js` *(nuevo)* | La galería está dentro del bloque de decoración del hero y antes del texto; el contenedor lleva `aria-hidden="true"` y las 66 imágenes `alt=""`; ninguna imagen tiene `href` ni `tabindex` y ninguna hay dentro de un `<a>`; 4 columnas con 33 originales y 33 copias en el orden de la lista esperada y reparto 9/8/8/8; cada pista se anima de 0 a -50 %, lineal e infinita, con una duración distinta por columna dentro de 25 000–50 000 ms; tarjeta `aspect-ratio` 4:3 con `object-fit: cover` y `object-position: center`; columnas visibles por rango (`repeat(4,1fr)`, `repeat(3,1fr)` con la cuarta oculta, `repeat(2,1fr)` con la tercera y la cuarta ocultas); degradado con el tramo central entre 35 % y 65 % y `--overlay-opacity` ≥ 0,7; `text-shadow` en título, subtítulo, botones e indicador; pausa con `:focus-within` y ninguna con `:hover`; bloque único de reducir movimiento con selectores equivalentes a los que asignan la animación y sin zona desplazable en el hero; bloque de impresión; y el hero sin orbes, sin `float`, sin `pulse-glow` ni sin `bounce` | RF-1…RF-13, RF-15…RF-18, RF-20, RF-21 |
| `tests/franjas.test.js` *(modificado)* | Usa las funciones trasladadas; su test de cascada de las franjas se conserva sin cambios, incluida la exigencia de que el bloque de reducir movimiento vaya después en la hoja | RF-16, RF-17 |
| `tests/responsive.test.js` *(modificado)* | Lista de estilos obsoletos ampliada con la clase del orbe, `float`, `pulse-glow` y `bounce`; aritmética de las columnas del hero por rango: ancho de tarjeta, hueco y número de tarjetas completas en un hero de 640 px, con la barra de 15 px descontada | RF-10, RF-13, RF-18 |
| `tests/entorno.test.js` *(modificado)* | El JavaScript tiene un solo `window.addEventListener('scroll'` (el de la navbar), ninguna referencia a los orbes y ninguna transformación del contenido del hero; el número de funciones declaradas no aumenta; se conservan las comprobaciones de cero dependencias y de que el JavaScript no pinta contenido | RF-14, RF-N1, RF-N2 |
| `tests/contenido.test.js` *(modificado)* | Además de los dos tests del hero ya existentes, uno nuevo que comprueba que la galería no introduce `<p>`, `<h*>`, `<a>` ni texto visible antes del subtítulo, y que el primer `<p>` del hero sigue siendo el subtítulo | RF-1, RF-5 |
| `tests/sintetizadores.test.js` | **sin tocar**: sigue leyendo las 27 direcciones del anexo de la spec 002 como fuente de verdad; ahora esas mismas 29 direcciones aparecen también en el hero, lo que no le afecta porque trabaja sobre `#sintetizadores` | RF-22 |
| Chrome DevTools (manual, `/sdd-validate`) | Las 33 imágenes cargan y se ven sin huecos a 1280 px; a 640 px se ven 3 columnas y a 375 px se ven 2 (con emulación de dispositivo); el fondo sube y no tiene costura; el texto se lee en los tres anchos; pausa solo al tabular; con "reducir movimiento" nada se mueve y no hay zona desplazable dentro del hero; consola y red limpias; solo 6 descargas nuevas; y anotación de qué muestra cada captura de función | RF-1, RF-3, RF-4, RF-5, RF-9, RF-12, RF-13, RF-15, RF-16, RF-19, RF-21, RF-23 |

- Ciclo por tarea: test en rojo → código → `node --test` en verde → marcar → parar.
- La suite debe acabar **por encima de los 80** tests actuales; no se borra ninguno.

## Mapa RF → parte del plan

| RF | Dónde se resuelve |
|---|---|
| RF-1, RF-2, RF-3, RF-6, RF-7, RF-8, RF-11 | Pasos 1 a 4 (HTML del hero) + `tests/hero.test.js` |
| RF-4, RF-5 | Pasos 2, 3 y 7 (pista duplicada, `hero-rise`, duraciones por columna) |
| RF-9 | Paso 10 (degradado con tramo central + sombras) + `tests/hero.test.js` |
| RF-10, RF-18 | Pasos 7 y 8 (rejilla por rango) + `tests/responsive.test.js` |
| RF-12 | Paso 7 (`aspect-ratio` 4:3, `object-fit: cover`, `object-position: center`) |
| RF-13 | Pasos 4 y 6 (se borran orbes, pulso y rebote) + `tests/hero.test.js` y `tests/responsive.test.js` |
| RF-14 | Paso 13 (se borra el manejador de scroll) + `tests/entorno.test.js` |
| RF-15 | Paso 9 (`animation-play-state` solo con `:focus-within`) |
| RF-16, RF-17 | Paso 11 (bloque único de reducir movimiento) + `tests/hero.test.js` y `tests/franjas.test.js` |
| RF-19, RF-22 | Paso 1 (imágenes sin carga diferida, todas por URL) + red en el navegador |
| RF-20 | Paso 12 (bloque de impresión) |
| RF-21 | Paso 7 (alturas declaradas, sin depender de la animación) |
| RF-23 | Sin cambios de JavaScript en comportamiento; se verifica en el navegador |
| RF-N1 | No se añade ninguna dependencia; `tests/entorno.test.js` lo sigue comprobando |
| RF-N2 | Las 66 imágenes están en el HTML y el JS no gana funciones |
| RF-N3 | Paso 5 (variables de `:root`) + `tests/responsive.test.js` (`:root` intacto) |
| RF-N4 | Imágenes por URL, sin copias al proyecto, aviso de no afiliación en el pie |
| RF-N5 | Sin textos nuevos; `tests/contenido.test.js` sigue vigilando el idioma |
| RF-N6 | Toda la verificación automática con `node --test`, sin instalar nada |
| RF-N7 | Paso 1 (6 descargas nuevas, 27 compartidas con las franjas) + red en el navegador |

## Riesgos
- **Volumen de marcado**: 66 imágenes escritas a mano. Se mitiga repartiendo el trabajo por columnas (T2) y dejando la lista de 33 definida una sola vez en el test, que es la que se compara con el HTML.
- **La lista de 33 no se escribe dos veces**: el test la construye leyendo los dos anexos. Si alguien la escribe a mano en el HTML y además en el test, se desincronizan solas.
- **Cascada en "reducir movimiento"**: si se añadiera un bloque nuevo en vez de ampliar el existente, el test no lo vería y volvería el fallo de la spec 002.
- **Desviación de la tabla de RF-10**: documentada arriba; conviene corregir la spec en la siguiente revisión.