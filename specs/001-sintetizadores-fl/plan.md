# Plan — Spec 001: Sección de Sintetizadores y landing centrada en FL Studio

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | modificar | Hero (título/subtítulo), enlace del menú, sección `#sintetizadores` que reemplaza a `#flex` (intro + 3 tarjetas), 6 tarjetas de Características, 4 etiquetas de Galería, botones y nota de descarga, logo y enlaces del pie | RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RF-8, RF-11, RF-12 |
| `css/styles.css` | modificar | Sustituir los estilos `.flex-*` por los de la nueva sección (`.synths-grid`, `.synth-card`), reglas responsive ≤768 px / >768 px, conservar paleta y animaciones | RF-9, RF-N2 |
| `js/main.js` | modificar | Actualizar los selectores de animación que apuntan a `.flex-info`/`.flex-image` a `.synth-card`; el resto (menú, smooth scroll) no cambia | RF-13, RF-2 |
| `tests/*.test.js` | crear | Tests estructurales con `node --test` (leen HTML/CSS/JS con `fs` y validan) | RF-1…RF-9, RF-11, RF-12, RF-N1, RF-N3 |
| `AGENTS.md` | modificar | Secciones, navegación y estructura (nueva carpeta `tests/`, `specs/`) | Criterios de finalización |
| `MEMORY.md` | modificar | Registro de la implementación y resultados de `node --test` | Criterios de finalización |

## Funciones puras

- **No hay lógica de fechas en esta spec → no aplica el parámetro "hoy".**
- El JS en ejecución no gana lógica nueva (RF-N3: la interfaz es contenido fijo). Toda la lógica vive en los tests, como funciones puras sobre cadenas en `tests/helpers.js`:
  - `getIds(html) → string[]` — todos los `id` de la página.
  - `getInternalHrefs(html) → string[]` — todos los `href="#…"`.
  - `getBrokenLinks(html) → string[]` — internos sin `id` correspondiente.
  - `countMatches(text, regex) → number`.
  - `getCards(html, selector) → {text, href, target}[]`.
  - `getText(html, selector) → string | null`.
- Los tests envuelven estas funciones con lecturas de `fs` (parte impura mínima, solo I/O de ficheros).

## Algoritmo (pseudocódigo)

```
1. HERO: título ← "FL STUDIO" (+ subtítulo que mencione FL Studio, sin "Flex")
2. MENÚ: enlace "Flex" ← "Sintetizadores" apuntando a #sintetizadores
3. SECCIÓN: eliminar bloque #flex completo;
   insertar #sintetizadores:
     h2 "Sintetizadores" + subtítulo con "FL Studio"   → sección-header
     p introductorio (1 párrafo)
     .synths-grid con 3 tarjetas:
       por cada synth de [FLEX, Toxic Biohazard, Sytrus]:
         <a class="synth-card" href=URL_OFICIAL target="_blank" rel="noopener noreferrer"
            ...indicación de pestaña nueva...>
           placeholder svg  +  h3 nombre  +  p descripción corta (español)
         </a>
       (si URL_OFICIAL no está disponible → tarjeta sin enlace, RF-5)
4. CARACTERÍSTICAS: sustituir títulos/descripciones de las 6 tarjetas por
   Piano Roll, Playlist, Mixer, Plugins, Grabación, Comunidad (descripciones en español)
   y subtítulo de la sección que mencione FL Studio
5. GALERÍA: título/subtítulo mencionan FL Studio; etiquetas de los 4 elementos ←
   partes de la interfaz de FL Studio; ningún "Flex"
6. DESCARGA: botones ← "Descargar FL Studio para Windows/Mac"; la nota de Flex solo
   indica que va incluido con FL Studio
7. PIE: enlace "Flex" ← "Sintetizadores"; logo ← inicio (#hero)
8. CSS: .flex-content/.flex-image/.flex-info/.flex-features ← .synths-grid/.synth-card;
   ≤768px → 1 columna (Sintetizadores, Características, Galería);
   >768px → 3 tarjetas en fila
9. JS: selectores de initScrollAnimations ← .synth-card (borrar .flex-info/.flex-image)
10. TESTS: rojo → código → verde (una tarea a la vez, /sdd-implement)
```

## Interfaz (cómo se pinta)

- Todo en HTML estático (RF-N3): 3 `<a class="synth-card">` dentro de `.synths-grid` (CSS grid, patrón ya usado por `.gallery-grid`/`.features-grid`).
- Cada tarjeta: placeholder SVG (mismo estilo que los actuales) + nombre + descripción corta en español; hover con el efecto ya existente; enlace externo con `target="_blank"`, `rel="noopener noreferrer"` e indicación visible/accesible de pestaña nueva.
- Responsive: `@media (max-width: 768px)` una columna; por encima, `repeat(3, 1fr)`.

## Decisiones técnicas (alternativa descartada)

1. **Reemplazar la sección Flex** en lugar de añadir una nueva dejando Flex → *descartada*: duplicaría contenido y violaría RF-3.
2. **Tarjeta completa como enlace** vs botón "Ver ficha oficial" dentro de la tarjeta → *descartada*: un solo elemento clicable, menos superficie y cumple RF-4 igual.
3. **Generar las tarjetas desde un array en JS** → *descartada*: viola el principio 3 de la constitución (RF-N3).
4. **`https://www.image-line.com/fl-studio/plugins/sytrus`** como URL de Sytrus → *descartada*: verificada en navegador y renderiza vacía (igual que un slug inventado); se usa la sección oficial `features#instruments`.
5. **Librerías de test (jsdom, cheerio…)** para parsear HTML → *descartadas*: violan el principio 4; se usan `fs` + `node:test` + expresiones regulares.
6. **Páginas de detalle por sintetizador** → *descartada*: fuera de alcance en la spec.

## Estrategia de tests con `node --test`

| Fichero | Qué comprueba | RF |
|---|---|---|
| `tests/enlaces.test.js` | Todo `href="#x"` tiene su `id="x"`; no queda `#flex` ni `href="#"` interno; logo (menú y pie) → inicio; menú y pie enlazan a `#sintetizadores` | RF-2 |
| `tests/sintetizadores.test.js` | Existe `#sintetizadores`; exactamente 3 `.synth-card` (Flex, Toxic Biohazard, Sytrus); URLs exactas, `target="_blank"` y `rel`; ausencia del contenido antiguo ("¿Qué es Flex?", checklist de 4 puntos) | RF-3, RF-4, RF-5 |
| `tests/contenido.test.js` | Título/subtítulo del hero sin "Flex" y con "FL Studio"; 6 tarjetas de Características con los títulos esperados; 4 etiquetas de Galería de FL Studio; botones de descarga mencionan FL Studio; títulos o subtítulos de cada sección mencionan FL Studio; textos en español | RF-1, RF-6, RF-7, RF-8, RF-11, RF-12 |
| `tests/responsive.test.js` | En CSS: regla ≤768 px con 1 columna para `.synths-grid` y secciones con tarjetas; 3 en fila >768 px; variables `:root` intactas (paleta); `main.js` sin `innerHTML` | RF-9, RF-N2, RF-N3 |
| `tests/entorno.test.js` | No existe `package.json` ni `node_modules` (cero dependencias) | RF-N1 |
| Chrome DevTools (manual, en `/sdd-validate`) | Consola sin errores, menú abre/cierra y desplaza (escritorio y móvil), vista 375 px y 1280 px, aspecto visual | RF-10, RF-13, RF-N2 |

- Ciclo por tarea: test en rojo → código → `node --test` en verde → marcar tarea → parar.

---

# Cambio 002 — Imágenes oficiales, logo oficial y enlaces de descarga

> Añadido el 2026-10-02 tras aprobar el cambio en la spec. Cubre RF-14 a RF-17 y RF-N4, más el renombrado de RF-3 y RF-4.

## Archivos y responsabilidades (cambio 002)

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `index.html` | modificar | Imágenes oficiales en las tarjetas, logo oficial en navbar y pie, botones a la página oficial, nombre "Toxic Biohazard" | RF-14 a RF-17 |
| `css/styles.css` | modificar | Estilos de imagen de tarjeta (`object-fit`) y del logo (`height`) | RF-15, RF-16 |
| `tests/helpers.js` | modificar | Funciones puras `getAttr`, `getImageSources`, `getImageDomains` | soporte |
| `tests/sintetizadores.test.js` | modificar | Nombres oficiales, imagen por tarjeta con `alt`, dominio image-line.com | RF-14, RF-15, RF-N4 |
| `tests/contenido.test.js` | modificar | Botones a la página oficial y ausencia de "Toxic Bio" | RF-17, RF-14 |
| `tests/enlaces.test.js` | modificar | El logo (ahora imagen) sigue enlazando al inicio | RF-2, RF-16 |
| `AGENTS.md` | modificar | Sección de Sintetizadores al día | Criterios |

## Funciones puras (añadidas)

- `getAttr(tag, name) → string | null`
- `getImageSources(html) → {src, alt}[]`
- `getImageDomains(html) → string[]`
- Sin lógica de fechas → no aplica el parámetro "hoy".

## Algoritmo (pseudocódigo del cambio 002)

```
1. TARJETAS: por cada synth de [FLEX, Toxic Biohazard, Sytrus]
     sustituye el bloque .placeholder-image por
     <img class="synth-image" src=URL_OFICIAL alt="<Nombre> en FL Studio">
     conserva el <a> externo, el h3 con el nombre oficial y la descripción
2. LOGO: en navbar y pie sustituye <span class="logo-icon">FL</span> +
     <span class="logo-text">Studio</span> por
     <img class="logo-image" src=URL_LOGO alt="FL Studio">; el <a href="#hero"> se mantiene
3. DESCARGA: ambos botones pasan a
     href="https://www.image-line.com/fl-studio/download"
     target="_blank" rel="noopener noreferrer"
4. CSS: .synth-image { width:100%; object-fit:cover; aspect-ratio:4/3 }
     .logo-image { height:28px; width:auto }
5. TESTS: rojo → código → verde
```

## Interfaz (cambio 002)

- Imágenes remotas referenciadas por URL (RF-N4), sin copia en el repo.
- La tarjeta mantiene su altura con `aspect-ratio: 4/3` + `object-fit: cover`, así el grid no cambia.
- El logo oficial sustituye al texto y conserva el enlace al inicio (RF-2).

## URLs oficiales (verificadas una a una)

| Uso | URL | Nota |
|---|---|---|
| Botones de descarga (ambos) | `https://www.image-line.com/fl-studio/download` | 200 · página oficial |
| FLEX | `https://www.image-line.com/innovaeditor/assets/plugins/t_FLEX-main.jpg` | 300 px |
| Toxic Biohazard | `https://www.image-line.com/innovaeditor/assets/plugins/p_ToxicBiohazard-fullSize.jpg` | 700 px |
| Sytrus | `https://www.image-line.com/innovaeditor/assets/plugins/plugin240-sytrus.jpg` | 240 px, no hay captura mayor |
| Logotipo FL Studio | `…/uploads/2020/07/thumb_FLStudio-logo.png` (20 KB) o `…/uploads/2024/06/FL_Studio_2024Logo_LightThumb.png` (13 KB) | se elige el que se vea mejor; el test exige el dominio, no el fichero |

## Decisiones (cambio 002)

1. **Imágenes remotas por URL** en vez de copiarlas a `assets/` → *descartada la copia*: ocuparía el repo, hay que actualizarlas a mano y la constitución prioriza cero recursos añadidos.
2. **Página de descarga** en vez del instalador directo (~1 GB) → *descartado el instalador*: una landing no debe lanzar 1 GB sin que el visitante lo decida (decidido por el usuario).
3. **`alt` descriptivo** en vez de `alt` vacío: nombra el instrumento para lectores de pantalla (RF-15).
4. **`object-fit: cover`** en vez de redimensionar en el proyecto: mantiene el grid intacto y recorta sin deformar.
5. **"Toxic Biohazard"** en vez de "Toxic Bio": es el nombre oficial publicado por Image-Line (RF-14).

## Estrategia de tests (cambio 002)

| Fichero | Qué comprueba | RF |
|---|---|---|
| `tests/sintetizadores.test.js` | Nombres FLEX / Toxic Biohazard / Sytrus; cada tarjeta con una `<img>` de un dominio image-line.com y `alt` no vacío; sin SVG de placeholder dentro de las tarjetas | RF-14, RF-15, RF-N4 |
| `tests/contenido.test.js` | Los dos botones apuntan a `image-line.com/fl-studio/download` con `target="_blank"`; ningún texto visible dice "Toxic Bio" sin "hazard" | RF-17, RF-14 |
| `tests/enlaces.test.js` | El logo sigue siendo enlace interno al inicio y contiene la imagen oficial | RF-2, RF-16 |
| Chrome DevTools | Las 3 imágenes y el logo cargan a 375 px y 1280 px; sin huecos ni deformaciones; consola limpia | RF-15, RF-16, RF-10 |