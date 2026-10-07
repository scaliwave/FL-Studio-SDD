# Tareas — Spec 001: Sección de Sintetizadores y landing centrada en FL Studio

- [x] **T1. Tests de enlaces y de la sección de sintetizadores (en rojo) + crear la sección `#sintetizadores` con las 3 tarjetas enlazadas y actualizar todos los enlaces que apuntaban a Flex.** RF-2, RF-3, RF-4, RF-5
  - Hecho cuando: `node --test` pasa los tests de enlaces y de sintetizadores y no queda ningún `href` a `#flex`.
- [x] **T2. Test de responsive de CSS (en rojo) + estilos de la nueva sección (`.synths-grid`, `.synth-card`) sustituyendo los `.flex-*`, con 1 columna ≤768 px y 3 en fila por encima.** RF-9, RF-N2
  - Hecho cuando: `node --test` verde y en Chrome DevTools a 375 px las tarjetas van en una columna sin scroll horizontal.
- [x] **T3. Actualizar `js/main.js` para animar las tarjetas nuevas + test de entorno y de contenido generado (sin `innerHTML`, sin dependencias).** RF-13, RF-N1, RF-N3
  - Hecho cuando: `node --test` verde y las tarjetas se animan al hacer scroll.
- [x] **T4. Reescribir hero y sección de descarga en clave FL Studio (con sus tests de contenido en rojo primero).** RF-1, RF-8
  - Hecho cuando: título y subtítulo del hero mencionan FL Studio y no Flex, y los botones dicen qué se descarga.
- [x] **T5. Reescribir las 6 tarjetas de Características con funciones de FL Studio.** RF-6, RF-12
  - Hecho cuando: las 6 tarjetas son Piano Roll, Playlist, Mixer, Plugins, Grabación y Comunidad con descripciones en español.
- [x] **T6. Reescribir las 4 etiquetas de la Galería con partes de la interfaz de FL Studio.** RF-7, RF-12
  - Hecho cuando: las 4 etiquetas nombran partes de FL Studio y el título o subtítulo de la sección mencionan FL Studio.
- [x] **T7. Test global de idioma y coherencia de títulos de sección.** RF-11, RF-12
  - Hecho cuando: `node --test` comprueba que cada sección tiene título o subtítulo con "FL Studio" y que no quedan sintetizadores fuera de su sección.
- [x] **T8. Validación manual con Chrome DevTools (375 px y 1280 px, consola limpia, menú) y cierre de documentación (AGENTS.md, MEMORY.md, spec a implementada).** RF-10, RF-13
  - Hecho cuando: comprobaciones registradas en MEMORY.md y AGENTS.md refleja las secciones actuales.

## Resultado por tarea

| Tarea | Ciclo rojo → verde | RF |
|---|---|---|
| T1 | 1 pass / 12 fail → 13 pass | RF-2, RF-3, RF-4, RF-5 |
| T2 | 15 pass / 3 fail → 18 pass | RF-9, RF-N2 |
| T3 | 21 pass / 1 fail → 22 pass | RF-13, RF-N1, RF-N3 |
| T4 | 23 pass / 3 fail → 26 pass | RF-1, RF-8 |
| T5 | 28 pass / 2 fail → 30 pass | RF-6, RF-12 |
| T6 | 31 pass / 3 fail → 34 pass | RF-7, RF-12 |
| T7 | 37 pass / 1 fail → 38 pass | RF-11, RF-12 |
| T8 | 38 pass / 0 fail (validación manual) | RF-10, RF-13 |

---

# Cambio 002 — Imágenes oficiales, logo oficial y enlaces de descarga

- [x] **T9. Tests de nombres e imágenes oficiales (en rojo) + helpers `getAttr`, `getImageSources`, `getImageDomains` + renombrar "Toxic Bio" a "Toxic Biohazard".** RF-14, RF-15, RF-N4
  - Hecho cuando: `node --test` pasa los tests de nombres oficiales y no queda "Toxic Bio" sin "hazard" en el HTML.
- [x] **T10. Imágenes oficiales en las 3 tarjetas + estilos `.synth-image`.** RF-15, RF-N2
  - Hecho cuando: cada tarjeta tiene su `<img>` de image-line.com con `alt` descriptivo y sin hueco visible.
- [x] **T11. Logotipo oficial en navbar y pie (test en rojo primero) + botones de descarga a la página oficial.** RF-16, RF-17, RF-2
  - Hecho cuando: ambos logos muestran la imagen oficial y siguen enlazando a `#hero`, y los botones abren la página oficial en pestaña nueva.
- [x] **T12. Verificación en Chrome DevTools (imágenes y logo a 375 px y 1280 px, consola limpia) + cierre: AGENTS.md, MEMORY.md y spec a implementada.** RF-15, RF-16, RF-10, RF-17
  - Hecho cuando: comprobaciones registradas en MEMORY.md y ningún hueco visible en la landing.

## Resultado por tarea (cambio 002)

| Tarea | Ciclo rojo → verde | RF |
|---|---|---|
| T9 | 37 pass / 5 fail → 42 pass | RF-14, RF-15, RF-N4 |
| T10 | (compartido con T9) → 42 pass | RF-15, RF-N2 |
| T11 | 43 pass / 2 fail → 45 pass | RF-16, RF-17, RF-2 |
| T12 | 45 pass / 0 fail (validación manual) | RF-15, RF-16, RF-10, RF-17 |