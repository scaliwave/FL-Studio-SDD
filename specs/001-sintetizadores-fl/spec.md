# Spec 001 — Sección de Sintetizadores y landing centrada en FL Studio
Estado: implementada (cambio 002 implementado)

## Registro de cambios
- **2026-10-02 · Cambio 001**: versión inicial, implementada.
- **2026-10-02 · Cambio 002**: implementado. Enlaces reales de descarga, imágenes oficiales de Image-Line, logotipo oficial y nombre correcto "Toxic Biohazard" (RF-14…RF-17, RF-N4).

## Contexto y objetivo
Hoy la landing presenta FL Studio y el plugin Flex con el mismo peso: el hero es "FL STUDIO FLEX", Flex tiene sección propia, y las secciones Características y Galería describen sintetizadores. Se quiere que la landing hable de FL Studio (el DAW) como producto principal y que los sintetizadores vivan en una sección propia, empezando por Flex, Toxic Biohazard y Sytrus.

## Usuarios
- Visitante de la landing: productor que llega para conocer FL Studio y sus instrumentos incluidos.

## Historias de usuario
- HU-1. Como visitante, quiero que la landing presente FL Studio como DAW, para entender de qué va el producto principal sin distracciones.
- HU-2. Como visitante, quiero una sección propia con los sintetizadores incluidos (Flex, Toxic Bio, Sytrus), para explorarlos de forma agrupada.
- HU-3. Como visitante, quiero enlazar desde cada sintetizador a su información oficial, para ver la información de la fuente oficial.
- HU-4. Como visitante en móvil, quiero recorrer todas las secciones sin desbordes, para poder leerlo desde el teléfono.

## Definiciones
- DAW: estación de trabajo de audio digital; FL Studio es el DAW de este proyecto.
- Landing: la página principal del proyecto.
- Imagen oficial: imagen publicada por Image-Line en sus propios dominios, usada por la landing referenciándola por URL sin copiarla al proyecto.
- Placeholder SVG: imagen de sustitución dibujada en código; se usa como reserva cuando no hay imagen oficial y en la galería.
- Enlace interno: enlace de la propia página que apunta a una de sus secciones. Los enlaces externos (image-line.com) y los enlaces marcador de posición sin destino (redes sociales) no son enlaces internos.
- Nombres oficiales de funciones de FL Studio (Piano Roll, Playlist, Mixer, Plugins/VST): se conservan en inglés como nombres propios; el resto de textos visibles, en español.

## Requisitos funcionales
- RF-1: CUANDO el usuario abre la landing, EL SISTEMA muestra en el hero un título y un subtítulo que mencionan FL Studio (el DAW); ninguno de los dos menciona a Flex.
- RF-2: CUANDO el usuario recorre el menú superior, el pie de página o el hero, EL SISTEMA ofrece al menos un enlace interno a la sección de Sintetizadores en lugar de cualquier enlace interno a Flex, ningún enlace interno apunta a una sección inexistente, y el logo del menú y del pie es un enlace interno al inicio de la página.
- RF-3: CUANDO el usuario llega a la sección de Sintetizadores, EL SISTEMA muestra un párrafo introductorio seguido de exactamente tres tarjetas: Flex, Toxic Biohazard y Sytrus; el antiguo contenido "¿Qué es Flex?" con su lista de 4 puntos ya no se muestra.
- RF-4: CUANDO el usuario pulsa una tarjeta de sintetizador, EL SISTEMA abre en una pestaña nueva la página oficial que le corresponde e indica en el enlace que se abrirá en una pestaña nueva (texto visible o atributo accesible): FLEX → https://www.image-line.com/flex ; Toxic Biohazard → https://www.image-line.com/fl-studio/plugins/toxic-biohazard ; Sytrus → https://www.image-line.com/fl-studio/features#instruments (Sytrus no tiene página propia y esa sección oficial lo describe).
- RF-5: SI la página oficial asignada a un sintetizador (RF-4) no está disponible o no contiene información de ese sintetizador, ENTONCES su tarjeta se muestra sin enlace.
- RF-6: CUANDO el usuario abre la sección de Características, EL SISTEMA muestra exactamente seis tarjetas con funciones de FL Studio (Piano Roll, Playlist, Mixer, Plugins, Grabación, Comunidad) y ninguna describe sintetizadores.
- RF-7: CUANDO el usuario abre la Galería, EL SISTEMA muestra título y subtítulo que mencionan FL Studio y exactamente cuatro elementos, cada uno con una etiqueta visible que nombra una parte de la interfaz de FL Studio (por ejemplo: Playlist, Mixer, Piano Roll, Navegador); ninguno presenta a Flex como producto.
- RF-8: CUANDO el usuario llega a la sección de descarga, EL SISTEMA muestra botones cuyo texto menciona FL Studio; cualquier mención de Flex en esa sección indica únicamente que va incluido con FL Studio.
- RF-9: SI la pantalla mide 768 px o menos, ENTONCES las secciones con tarjetas (Sintetizadores, Características y Galería) se muestran en una sola columna y la página no tiene desplazamiento horizontal; SI la pantalla mide más de 768 px, ENTONCES las tres tarjetas de Sintetizadores se muestran en fila.
- RF-10: MIENTRAS el usuario navega por la página, EL SISTEMA no muestra mensajes de error en la consola del navegador.
- RF-11: EL SISTEMA mantiene todos los textos visibles de la landing en español, con la excepción de los nombres oficiales de funciones definidos más arriba.
- RF-12: MIENTRAS el usuario recorre la landing, EL SISTEMA muestra en cada sección un título o un subtítulo que menciona FL Studio, y las tarjetas de sintetizadores solo aparecen en la sección de Sintetizadores.
- RF-13: CUANDO el usuario pulsa un enlace del menú (escritorio o móvil), EL SISTEMA desplaza la vista hasta la sección enlazada sin que la barra superior tape su título; SI el menú móvil está abierto, ENTONCES se cierra después de elegir un enlace.
- RF-14: CUANDO el usuario lee la sección de Sintetizadores, EL SISTEMA muestra el nombre oficial de cada instrumento tal como lo publica Image-Line: FLEX, Toxic Biohazard y Sytrus; el nombre "Toxic Bio" no aparece en ningún texto visible.
- RF-15: CUANDO el usuario abre la sección de Sintetizadores, EL SISTEMA muestra en cada tarjeta la imagen oficial de ese instrumento alojada en un dominio de image-line.com, con un texto alternativo que nombra el instrumento; SI no existe imagen oficial para un instrumento, ENTONCES su tarjeta muestra el icono oficial y, si tampoco existe, su placeholder de reserva.
- RF-16: CUANDO el usuario mira la barra de navegación o el pie de página, EL SISTEMA muestra el logotipo oficial de FL Studio alojado en un dominio de image-line.com en lugar del logotipo de texto.
- RF-17: CUANDO el usuario pulsa un botón de descarga, EL SISTEMA abre en una pestaña nueva la página oficial de descarga de FL Studio en image-line.com; el SISTEMA no inicia la descarga del instalador de unos 1 GB de forma automática.

## Requisitos no funcionales
- RF-N1: EL SISTEMA funciona sin añadir librerías ni frameworks nuevos.
- RF-N2: EL SISTEMA conserva el aspecto actual: paleta negra/verde, tipografías y animaciones existentes.
- RF-N3: EL SISTEMA muestra las tarjetas y los textos como contenido fijo de la página; la interfaz no se genera en tiempo de ejecución con JavaScript (principio 3 de la constitución).
- RF-N4: Las imágenes oficiales se referencian por URL desde dominios de image-line.com y no se copian al proyecto; si una imagen no responde, la tarjeta conserva su placeholder y la landing sigue legible.

## Casos límite
- Enlaces internos que apuntaban a la antigua sección de Flex (menú, pie y botón "Saber Más" del hero): todos deben apuntar a Sintetizadores (RF-2).
- 375 px: la sección nueva no debe desbordar el ancho de la pantalla (RF-9).
- Una tarjeta sin página oficial disponible: se muestra sin enlace (RF-5).
- Sytrus sin página propia: su tarjeta enlaza a la sección oficial que lo describe (RF-4).
- Los enlaces sociales del pie siguen siendo marcadores de posición: no cuentan como enlaces internos y quedan fuera de alcance.
- Sytrus no tiene captura de interfaz oficial: su tarjeta usa el icono oficial de 240 px (RF-15).
- Una imagen oficial que Image-Line retire o bloquee: la tarjeta cae al placeholder y la landing no se rompe (RF-N4).
- El logotipo oficial es una imagen: el enlace del logo sigue siendo un enlace interno al inicio (RF-2 y RF-16).
- Imagen remota sin conexión: el texto de la tarjeta sigue visible aunque la imagen no cargue.

## Fuera de alcance
- Imágenes propias del proyecto: la galería mantiene sus placeholders SVG; solo las tarjetas de sintetizadores y los logotipos usan imágenes oficiales.
- Páginas de detalle de cada sintetizador (todo vive en esta landing).
- Añadir sintetizadores allá de los tres iniciales.
- Redirección de anclas antiguas (#flex) para visitas guardadas.
- Dar destino real a los enlaces de redes sociales.
- Cambios de diseño, paleta o secciones no descritas aquí.
- Copiar las imágenes oficiales al proyecto (assets/) o descargarlas: se referencian por URL.
- Enlazar directamente al instalador de Windows o Mac: los botones van a la página oficial de descarga.
- Sustituir los placeholders de la galería por capturas reales de FL Studio.
- Sustituir el logo oficial por una versión guardada en el proyecto.

## Criterios de finalización
- Todos los RF verificados: los comprobables con `node --test` pasan en verde; los de interfaz verificados con Chrome DevTools a 375 px y 1280 px con consola limpia.
- Ningún enlace interno roto.
- Cada imagen oficial carga (comprobado en el navegador a 375 px y 1280 px) y ninguna deja un hueco visible.
- Ningún botón de descarga apunta a un instalador de ~1 GB.
- AGENTS.md refleja las secciones actuales y MEMORY.md registra el cambio.

## Dudas abiertas
- Ninguna: los puntos detectados en la revisión QA están resueltos en los RF anteriores (URLs oficiales verificadas una a una, alcance de "enlace interno", excepción de nombres propios en el idioma, responsive de todas las secciones con tarjetas y funcionamiento del menú).
