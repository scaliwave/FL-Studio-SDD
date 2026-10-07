# AGENTS.md - Instrucciones del Proyecto

## Descripción
Landing page de **FL Studio** (el DAW) con diseño moderno en tonos negros y verdes.
Los instrumentos y efectos incluidos (14 y 13) viven en su propia sección, en dos franjas animadas.

## Estructura del Proyecto
```
Dev/
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
├── assets/             # Imágenes y recursos (pendiente)
├── AGENTS.md           # Este archivo
└── MEMORY.md           # Registro de cambios y decisiones
```

## Paleta de Colores
- Fondo primario: `#0a0a0a`
- Fondo secundario: `#111111`
- Fondo terciario: `#1a1a1a`
- Acento primario: `#00ff88`
- Acento secundario: `#39ff14`
- Acento oscuro: `#003b1f`
- Texto primario: `#ffffff`
- Texto secundario: `#cccccc`
- Texto muted: `#888888`

## Tipografías
- Principal: 'Inter', sans-serif
- Display: 'Orbitron', sans-serif

## Secciones
1. **Navbar** - Navegación fija con efecto blur
2. **Hero** - Fondo completo con la **galería vertical animada**: 4 columnas de capturas que suben sin parar hacia arriba, cada una a una velocidad distinta, con una capa de degradado encima para que el texto se lea y el texto del hero por encima con su `z-index`. Ya **no** hay orbes animados, ni glow verde en el título, ni efecto parallax, ni rebote en la flecha del indicador de scroll: la galería es el único movimiento del hero
3. **Sintetizadores** - Intro + dos franjas animadas que se desplazan solas en sentidos opuestos, cada una con su encabezado: "Instrumentos incluidos" (14 instrumentos: Flex, Sytrus, 3xOSC, Harmor, Harmless, Sakura, Toxic Biohazard, Morphine, Ogun, Poizone, Sawer, NewTone, Transistor Bass, DirectWave) y "Efectos incluidos" (13 efectos: Gross Beat, Hardcore, Hyper Chorus, Luxeverb, Pitch Shifter, Pitcher, Spreader, Transient Processor, Vintage Chorus, Vintage Phaser, Low Lifter, Transporter, Emphasis). Cada tarjeta es **solo la imagen oficial de Image-Line**: en reposo no se ve ningún texto. El nombre y el aviso viven juntos en un bloque `.strip-card__meta` que está **fuera del flujo**, sobre la parte baja de la imagen, y se revela entero al pasar el puntero o al enfocar la tarjeta con el teclado, mientras la imagen crece un 6 % desde abajo; la tarjeta **no cambia de alto** al hacerlo. Las que tienen página oficial enlazan a ella y su aviso dice "Ver en image-line.com · se abre en una pestaña nueva"; **3xOSC es la única sin enlace**: no muestra aviso, no entra en el recorrido con `Tab` y sí revela su nombre con el puntero. En dispositivos **sin puntero** no hay nada que revelar, así que la tarjeta lleva siempre una **banda sólida de 44 px bajo la imagen con el nombre visible** y el aviso aparece al tocarla. La lista está duplicada para que el bucle sea continuo; las 27 copias de relleno nunca muestran texto, ni con puntero ni porque la franja se detenga, y la franja se detiene con `:hover` y `:focus-within`
4. **Features** - Grid de 6 tarjetas con funciones de FL Studio
5. **Gallery** - 4 elementos de la interfaz de FL Studio (Playlist, Mixer, Piano Roll, Navegador)
6. **Download** - CTA con botones que abren la página oficial de descarga de FL Studio en image-line.com
7. **Footer** - Cuatro bloques: marca, Enlaces internos, **Sitio oficial** (7 enlaces verificados a Image-Line y su foro, en pestaña nueva con icono ↗) y redes sociales

## Funcionalidades JavaScript
- Menú móvil hamburguesa
- Animaciones al hacer scroll (IntersectionObserver; las tarjetas de las franjas quedan fuera a propósito porque su fila ya se desplaza sola)
- Navbar con efecto de scroll
- Smooth scroll para enlaces internos
- Hover effects en galería
- Todo el movimiento de las franjas y de la galería del hero es CSS: no hay JavaScript detrás (contenido fijo en el HTML)

## Responsive
- Breakpoints: 768px y 480px
- Diseño mobile-first
- Menú hamburguesa en móviles
- Las franjas son una sola fila con desplazamiento propio; el **ancho** de tarjeta es 220px por encima de 768px, **124px hasta 768px** y **88px hasta 480px** (hueco 16px, 8px y 8px). Con la franja **detenida** se ven siempre **3 tarjetas completas visibles a 640px** y **2 a 375px** dentro del ancho útil (el que descuenta el `padding` del contenedor y la barra de desplazamiento horizontal); se cuentan originales y copias de relleno por igual, porque para quien mira la franja una copia es indistinguible de su original. El pie pasa a una columna con sus cuatro bloques
- La **altura** de la tarjeta la decide si el dispositivo tiene puntero, no el ancho. **Con puntero** la tarjeta es solo la imagen: **165px** a 1280px, **93px** a 640px y **66px** a 375px, derivados de la proporción 4:3 del ancho. **Sin puntero** (`@media (hover: none)`) mide la imagen más una banda de texto de **44px**, o sea **209px, 137px y 110px**, con el nombre siempre visible en esa banda. Los anchos no cambian, así que el recuento de tarjetas completas de arriba sigue valiendo
- Por debajo de **480px** el aviso visible se reduce a **«se abre en una pestaña nueva»**: el prefijo «Ver en image-line.com ·» se esconde solo visualmente porque el aviso entero no cabe en una tarjeta de 88px. El texto completo sigue en el HTML y en el árbol accesible en los tres anchos
- La **galería del hero** va a sangre y se reparte por rango con `repeat(N, 1fr)`: **4 columnas por encima de 768px, 3 de 481 a 768px y 2 hasta 480px** (las sobrantes se ocultan con `display: none`). Como es fondo completo, su ancho es el de la ventana y lo único que se descuenta es la barra vertical de 15px, de ahí que las columnas midan **304px, 200px y 176px**; la tarjeta reserva `aspect-ratio: 4/3`, o sea **228px, 150px y 132px** de alto, con **12px** de hueco vertical. Las cuatro columnas suben a **30s, 34s, 38s y 42s** por vuelta y su media pista mide entre **1,6 y 2,6 veces** el alto del hero

## Comandos
- Tests: `node --test`

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Testing
- Tests automatizados con el runner incluido en Node: `node --test` (ficheros en `tests/`, sin dependencias).
- Revisión visual: abrir `index.html` en el navegador con el MCP de Chrome DevTools (1280 px, 640 px y 375 px, consola y red limpias, sin scroll horizontal).

## Notas
- Las imágenes de los instrumentos, de los efectos y el logotipo son **oficiales de Image-Line** y se referencian por URL (no se copian al proyecto). La galería mantiene sus placeholders SVG.
- El fondo del hero usa **6 capturas oficiales de la interfaz de FL Studio** además de las 27 imágenes de instrumentos y efectos, todas por URL. Las 33 son adorno decorativo: `alt` vacío, sin enlaces y con la galería marcada `aria-hidden="true"`, así que un lector de pantalla no se las canta. La lista está duplicada para que el bucle sea continuo.
- La galería del hero **se detiene solo con `:focus-within`** (`.hero:focus-within .hero-gallery__track`) y **nunca con `:hover`**: el hero ocupa la primera pantalla entera, así que con el puntero estaría congelada en el uso normal. Al tabular hasta un botón se para y al salir reanuda sin salto.
- **"Reducir movimiento"**: el bloque `@media (prefers-reduced-motion: reduce)` usa los **mismos selectores compuestos** que asignan la animación (`.strip--instrumentos .strip-track`, `.strip--efectos .strip-track` y los cuatro `.hero-gallery__column--N .hero-gallery__track`) y va al final de la hoja. Un media query no suma especificidad, así que con `.strip-track` a secas la animación no se anulaba. Es **un solo bloque para las dos galerías**, y en el hero **no queda ninguna zona desplazable**: atraparía el scroll de la página.
- `@media print` oculta `.hero-bg`, para no imprimir las 66 imágenes de la galería.
- El indicador de scroll es **solo la flecha verde** (`.scroll-arrow`, 20x20px dibujada con bordes): no tiene texto, así que `.scroll-indicator` no lleva `font-size`, `text-transform` ni `letter-spacing`.
- La tarjeta de las franjas tiene **dos ramas** declaradas en el CSS: la base, con puntero, donde `.strip-card__meta` es absoluto y se oculta con `opacity: 0`; y `@media (hover: none)`, sin puntero, donde el bloque pasa al flujo y el nombre lleva `opacity: 1` permanente. La banda de texto es de 44px: caben dos líneas de 20px más 4px de aire, que es lo que necesitan los nombres más largos como "Transient Processor" con la fuente de 14px o más. Ese bloque va **antes** del de reducir movimiento, que corta `tests/franjas.test.js`.
- La guarda `.strip-card.strip-card--filler .strip-card__meta { opacity: 0 }` va **después** de las reglas de revelado y antes del bloque `hover: none`. Con solo `pointer-events: none` no basta: si la franja se detiene sobre una copia, su texto se vería. Su especificidad (0,3,0) es la que le hace ganar también a la rama sin puntero, donde el bloque es visible por defecto.
- `readProjectFile` (`tests/helpers.js`) es la **única** parte con E/S de la suite y **normaliza CRLF a LF al leer**. Sin eso, con `core.autocrlf` activo el checkout de Windows entrega los ficheros con `\r\n` y los tests que parten por `'\n'` o casan un encabezado contra un `\n` pelado fallarían **solo en esa máquina**. Por eso el regex del anexo de `sintetizadores.test.js` vuelve a ser `### titulo\n` a secas: la normalización centraliza el problema y los tests no llevan que porosity dentro. `tests/entorno.test.js` lo fija con dos tests, uno que comprueba que lo leído no trae CR y otro que neutraliza el CR de un fichero leído sin tocar el resto del contenido.
- Proyecto educativo - No afiliado a Image-Line
