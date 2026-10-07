# FL Studio (SDD)

Landing page de **FL Studio** en HTML, CSS y JavaScript vanilla, con diseño en tonos negros y verdes. El proyecto se construyó con **Spec-Driven Development**: cada cambio de comportamiento pasa primero por una spec escrita, un plan y una lista de tareas, y después por tests con el runner de Node.

Proyecto educativo. No afiliado a Image-Line.

## Puesta en marcha

No hay build ni dependencias que instalar. Se abre `index.html` en el navegador, tal cual:

```bash
# o servirlo por HTTP, que es como se revisa en el navegador
python -m http.server 8000
```

Los tests se ejecutan con el runner que ya viene en Node:

```bash
node --test
```

## Estructura

```
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── main.js         # JavaScript para interactividad
├── tests/              # Tests con node --test (sin dependencias)
│   ├── helpers.js      # Lectura de ficheros + funciones puras
│   ├── enlaces.test.js
│   ├── sintetizadores.test.js
│   ├── hero.test.js
│   ├── franjas.test.js
│   ├── responsive.test.js
│   ├── entorno.test.js
│   ├── contenido.test.js
│   └── secciones.test.js
├── specs/              # Specs del flujo SDD (spec.md, plan.md, tasks.md)
├── docs/
│   └── constitution.md # Principios innegociables del proyecto
├── .opencode/          # Agentes y comandos del flujo SDD
├── AGENTS.md           # Descripción del código tal como está hoy
└── MEMORY.md           # Registro de cambios y decisiones
```

## Secciones de la página

1. **Navbar** - Navegación fija con efecto blur y menú hamburguesa en móvil.
2. **Hero** - Fondo completo con galería vertical animada: 4 columnas de capturas que suben sin parar, cada una a una velocidad distinta, con una capa de degradado encima para que el texto se lea. Se detiene al tabular hasta un botón (`:focus-within`), nunca con el puntero.
3. **Sintetizadores** - 14 instrumentos y 13 efectos en dos franjas animadas que se desplazan solas en sentidos opuestos. Cada tarjeta es solo la imagen oficial de Image-Line; el nombre y el aviso aparecen al pasar el puntero o al enfocar con el teclado. En dispositivos sin puntero el nombre va siempre en una banda sólida bajo la imagen.
4. **Features** - Grid de seis tarjetas con funciones de FL Studio.
5. **Gallery** - Cuatro elementos de la interfaz: Playlist, Mixer, Piano Roll y Navegador.
6. **Download** - CTA que abre la página oficial de descarga en image-line.com.
7. **Footer** - Marca, enlaces internos, enlaces al sitio oficial y redes sociales.

## Responsive

Diseño mobile-first con cortes en **768px** y **480px**, y sin scroll horizontal en ninguno de los anchos de referencia:

| Ancho | Columnas de la galería del hero | Tarjeta de las franjas | Tarjetas completas visibles |
|---|---|---|---|
| 1280 px | 4 | 220 px de ancho | 4 |
| 640 px | 3 | 124 px de ancho | 3 |
| 375 px | 2 | 88 px de ancho | 2 |

La altura de la tarjeta la decide si el dispositivo tiene puntero, no el ancho: con puntero es solo la imagen (proporción 4:3); sin puntero, la imagen más una banda de texto de 44 px.

## Git

Hay un `origin` apuntando a `https://github.com/scaliwave/FL-Studio-SDD.git` y `main` sigue a `origin/main`.

```bash
node --test          # antes de proponer el commit
git add -A
git commit -m "..."
git push
```

**Ni el commit ni el push sin permiso.** Antes de commitear hay que revisar el resumen de lo implementado y el nombre del commit propuesto, y esperar a que alguien lo confirme. Los cambios se quedan sin commitear hasta entonces. Está escrito en [`AGENTS.md`](AGENTS.md) y en el principio 7 de [`docs/constitution.md`](docs/constitution.md).

## Cómo se trabaja aquí

El flujo es el de **Spec-Driven Development**, y las reglas completas están en [`docs/constitution.md`](docs/constitution.md):

1. `/sdd-spec` redacta la spec de un cambio y la aclara antes de seguir.
2. `/sdd-plan` la convierte en un plan con las decisiones técnicas y sus alternativas descartadas.
3. `/sdd-tasks` la parte en tareas verificables.
4. `/sdd-implement` implementa **una** tarea, con los tests primero.
5. `/sdd-validate` revisa la implementación contra cada requisito de la spec.

Principios que no se rompen: stack simple sin dependencias, `AGENTS.md` siempre al día respecto al código, lógica y presentación separadas, tests solo con `node --test`, sin datos personales, documentación en español, y nada registrado ni publicado sin autorización.

Antes de tocar código hay que leer `docs/constitution.md` y la spec activa en `specs/`.

## Specs

| Spec | Qué introduce |
|---|---|
| `001-sintetizadores-fl` | Sección de instrumentos con tarjetas |
| `002-rutas-sitio-oficial` | 14 instrumentos y 13 efectos en dos franjas, y enlaces al sitio oficial |
| `003-galeria-hero-vertical` | Galería vertical animada como fondo del hero |

## Notas

- Las imágenes de instrumentos, efectos y el logotipo son **oficiales de Image-Line** y se referencian por URL, no se copian al repositorio.
- Todo el movimiento de las franjas y de la galería del hero es CSS. No hay JavaScript detrás.
- El bloque `@media (prefers-reduced-motion: reduce)` desactiva ambas animaciones.