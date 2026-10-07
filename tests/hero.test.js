// ============================================
// TESTS: GALERÍA VERTICAL DEL HERO (Spec 003 · RF-1…RF-13, RF-15…RF-18, RF-20, RF-21)
// Comprueba el HTML (capas, columnas, imágenes y decoratividad) y el CSS
// (bucle, duraciones, proporción, legibilidad, pausa, reducir movimiento, impresión)
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    readProjectFile, getSection, getAttr, stripTags, isDecorative, getHeroGallery, getGalleryBlocks,
    getGalleryColumns, getGalleryCards, getGalleryImage, getScrim,
    reglasDe, reglaDe, leerAnimacion, recorridoDe, especificidad, anula, getMediaBlock, getRootVariables
} = require('./helpers');

const html = readProjectFile('index.html');
const css = readProjectFile('css/styles.css');
const spec002 = readProjectFile('specs/002-rutas-sitio-oficial/spec.md');
const spec003 = readProjectFile('specs/003-galeria-hero-vertical/spec.md');

// El bloque @media de "reducir movimiento" anula la animación, así que se excluye al leer el CSS normal
const indiceReducir = css.indexOf('prefers-reduced-motion');
const cssNormal = indiceReducir === -1 ? css : css.slice(0, indiceReducir);

const hero = getSection(html, 'hero');
const decoracion = getHeroGallery(html);
const capas = getGalleryBlocks(html);
const columnas = getGalleryColumns(html);

// ============================================
// LAS 33 IMÁGENES, LEÍDAS DE LOS DOS ANEXOS DE LAS SPECS
// [capturas[0]] + 27 del anexo de la spec 002 + capturas[1..5]
// ============================================

// Filas de datos de una tabla Markdown del anexo de una spec
function filasDelAnexo(titulo, spec) {
    const bloque = spec.split('### ' + titulo)[1].split(/\n#{2,3} /)[0];
    return bloque.split('\n')
        .filter((linea) => linea.trim().startsWith('|') && !/^(\|[\s|:-]*)+$/.test(linea.trim()))
        .slice(1)
        .map((fila) => fila.split('|').slice(1, -1).map((celda) => celda.trim().replace(/`/g, '')));
}

// 6 capturas oficiales de FL Studio, en el orden de la tabla
const CAPTURAS = filasDelAnexo('Las 33 imágenes originales', spec003)
    .filter((fila) => /^https?:\/\//.test(fila[1]))
    .map(([, direccion]) => direccion);

// Las 27 del anexo de la spec 002: primero los instrumentos y luego los efectos, como en esa spec
const TABLA_002 = filasDelAnexo('Imagen oficial de cada tarjeta', spec002);
const INSTRUMENTOS_002 = TABLA_002.filter((fila) => fila[0]).map((fila) => fila[1]);
const EFECTOS_002 = TABLA_002.filter((fila) => fila[2]).map((fila) => fila[3]);

// La lista completa de la galería: la interfaz completa va la primera a propósito,
// porque el reparto por turnos la deja en la columna 1, visible en los tres anchos (RF-3)
const IMAGENES = [CAPTURAS[0], ...INSTRUMENTOS_002, ...EFECTOS_002, ...CAPTURAS.slice(1)];

// Reparto por turnos en 4 columnas (RF-11)
const REPARTO = [[], [], [], []];
IMAGENES.forEach((imagen, indice) => REPARTO[indice % 4].push(imagen));

// Textos que deben seguir leyéndose por encima del fondo en movimiento (RF-9)
const CON_SOMBRA = ['.hero-title', '.title-line', '.hero-subtitle', '.btn-primary', '.btn-secondary', '.scroll-indicator'];

// ============================================
// LOS DATOS DE LOS ANEXOS SE LEEN BIEN (si no, el resto de tests no valen nada)
// ============================================
test('RF-22 · los anexos de las specs dan las 33 direcciones de la galería', () => {
    assert.equal(CAPTURAS.length, 6, `el anexo de la spec 003 debe listar 6 capturas y lista ${CAPTURAS.length}`);
    assert.equal(INSTRUMENTOS_002.length, 14, `el anexo de la spec 002 debe listar 14 instrumentos y lista ${INSTRUMENTOS_002.length}`);
    assert.equal(EFECTOS_002.length, 13, `el anexo de la spec 002 debe listar 13 efectos y lista ${EFECTOS_002.length}`);
    assert.equal(IMAGENES.length, 33, `la galería necesita 33 imágenes y la lista tiene ${IMAGENES.length}`);
});

test('RF-22 · las 33 direcciones están en dominios de Image-Line y no se repiten', () => {
    IMAGENES.forEach((direccion, indice) => {
        assert.match(
            direccion, /^https:\/\/([a-z]+\.)?image-line\.com\//,
            `la imagen ${indice + 1} no está en un dominio de Image-Line: ${direccion}`
        );
    });
    assert.equal(new Set(IMAGENES).size, 33, 'hay direcciones repetidas en la lista de la galería');
});

// ============================================
// ESTRUCTURA: CAPAS Y COLUMNAS (RF-1, RF-2, RF-3)
// ============================================
test('RF-1 · la galería está dentro del bloque de decoración del hero', () => {
    assert.ok(hero, 'falta <section id="hero">');
    assert.ok(decoracion, 'falta el bloque de decoración del hero (.hero-bg)');
    assert.match(decoracion, /<div\b[^>]*class="[^"]*\bhero-bg\b[^"]*"/, 'el bloque de decoración del hero no es .hero-bg');
    assert.ok(
        decoracion.includes('hero-gallery'),
        'la galería del hero debería estar dentro del bloque de decoración (.hero-bg), antes que el texto'
    );
});

test('RF-1 · la galería es la primera capa y el degradado la última', () => {
    assert.equal(capas.length, 2, `se esperaban 2 capas de galería (la galería y el degradado) y hay ${capas.length}`);
    assert.match(capas[0], /class="[^"]*\bhero-gallery\b[^"]*"/, 'la primera capa del bloque de decoración no es la galería');
    assert.match(capas[1], /class="[^"]*\bhero-gallery__scrim\b[^"]*"/, 'la segunda capa del bloque de decoración no es el degradado');
});

test('RF-1 · el texto del hero va después de la galería, en un bloque con z-index', () => {
    assert.ok(decoracion, 'falta el bloque de decoración del hero');
    assert.ok(hero.match(/<div\b[^>]*class="hero-content"[^>]*>/), 'falta el bloque de texto del hero (.hero-content)');

    const posicion = hero.indexOf('hero-gallery');
    const texto = hero.indexOf('hero-content');
    assert.ok(posicion > -1, 'no hay ninguna galería en el hero');
    assert.ok(texto > posicion, 'el texto del hero debería ir después de la galería en el HTML');

    const regla = reglaDe(cssNormal, '.hero-content');
    assert.ok(regla, 'falta la regla .hero-content');
    assert.match(regla, /z-index\s*:\s*\d/, 'el bloque de texto del hero debe declarar z-index para ir sobre la galería');
});

test('RF-2 · el hero lleva siempre las 4 columnas en el HTML', () => {
    assert.equal(columnas.length, 4, `se esperaban 4 columnas en el HTML y hay ${columnas.length}`);
    columnas.forEach((columna, indice) => {
        assert.match(
            columna, new RegExp(`class="[^"]*hero-gallery__column--${indice + 1}`),
            `la columna ${indice + 1} no lleva su modificador --${indice + 1}`
        );
    });
});

test('RF-2 · por rango se ven 4, 3 o 2 columnas y las sobrantes se ocultan', () => {
    const base = reglaDe(cssNormal, '.hero-gallery');
    assert.ok(base, 'falta la regla .hero-gallery');
    assert.match(base, /grid-template-columns:\s*repeat\(4,\s*1fr\)/, 'por encima de 768 px deben verse las 4 columnas');

    const moviles = bloquesMedia('max-width: 768px');
    const galeria768 = reglaDe(moviles, '.hero-gallery');
    assert.ok(galeria768, 'falta .hero-gallery dentro de un media query de 768 px o menos');
    assert.match(galeria768, /grid-template-columns:\s*repeat\(3,\s*1fr\)/, 'de 481 a 768 px deben verse 3 columnas');
    assert.match(reglaDe(moviles, '.hero-gallery__column--4'), /display:\s*none/, 'la cuarta columna debe ocultarse a 768 px o menos');

    const pequeños = bloquesMedia('max-width: 480px');
    const galeria480 = reglaDe(pequeños, '.hero-gallery');
    assert.ok(galeria480, 'falta .hero-gallery dentro de un media query de 480 px o menos');
    assert.match(galeria480, /grid-template-columns:\s*repeat\(2,\s*1fr\)/, 'a 480 px o menos deben verse 2 columnas');
    assert.match(reglaDe(pequeños, '.hero-gallery__column--3'), /display:\s*none/, 'la tercera columna debe ocultarse a 480 px o menos');
    assert.match(reglaDe(pequeños, '.hero-gallery__column--4'), /display:\s*none/, 'la cuarta columna debe ocultarse a 480 px o menos');
});

test('RF-3 · la galería muestra las 33 imágenes originales repartidas por turnos', () => {
    assert.equal(columnas.length, 4, `se esperaban 4 columnas y hay ${columnas.length}`);

    // El plan reparte por turnos: la columna 1 lleva las imágenes 0, 4, 8… de la lista
    REPARTO.forEach((esperadas, indice) => {
        const originales = getGalleryCards(columnas[indice], { decorativas: false });
        assert.deepEqual(
            originales.map((tarjeta) => getGalleryImage(tarjeta).src),
            esperadas,
            `la columna ${indice + 1} no lleva, y en este orden, las imágenes que le tocan de [interfaz completa] + 27 del anexo 002 + las otras 5 capturas`
        );
    });

    assert.equal(REPARTO.flat().length, 33, `el plan reparte 33 imágenes y el reparto tiene ${REPARTO.flat().length}`);
});

test('RF-3 · la interfaz completa de FL Studio queda en la primera columna, visible en los tres anchos', () => {
    assert.ok(columnas[0], 'no hay primera columna');
    const primera = getGalleryCards(columnas[0], { decorativas: false });
    assert.ok(primera.length, 'la primera columna no tiene imágenes');
    assert.equal(
        getGalleryImage(primera[0]).src, CAPTURAS[0],
        'la primera imagen de la primera columna debe ser la interfaz completa de FL Studio'
    );
});

// ============================================
// REPARTO EQUILIBRADO (RF-11)
// ============================================
test('RF-11 · el reparto por turnos deja 9, 8, 8 y 8 tarjetas', () => {
    assert.ok(columnas.length === 4, `hacen falta 4 columnas y hay ${columnas.length}`);

    const reparto = columnas.map((columna) => getGalleryCards(columna, { decorativas: false }).length);
    assert.deepEqual(reparto, [9, 8, 8, 8], `el reparto por columna es ${reparto.join(', ')} y debería ser 9, 8, 8 y 8`);
    assert.ok(
        Math.max(...reparto) - Math.min(...reparto) <= 1,
        `las columnas se diferencian en más de una tarjeta: ${reparto.join(', ')}`
    );
});

// ============================================
// COPIAS DE RELLENO Y BUCLE VERTICAL (RF-4)
// ============================================
test('RF-4 · cada columna repite su grupo de imágenes para que el bucle sea continuo', () => {
    assert.ok(columnas.length, 'no hay columnas que comprobar');

    columnas.forEach((columna, indice) => {
        const originales = getGalleryCards(columna, { decorativas: false });
        const copias = getGalleryCards(columna, { decorativas: true });

        assert.equal(copias.length, originales.length, `la columna ${indice + 1} no repite su grupo de imágenes`);
        copias.forEach((copia, i) => {
            assert.ok(isDecorative(copia), `la copia ${i + 1} de la columna ${indice + 1} no lleva aria-hidden="true"`);
            assert.equal(
                getGalleryImage(copia).src, getGalleryImage(originales[i]).src,
                `la copia ${i + 1} de la columna ${indice + 1} debería repetir la imagen de su original`
            );
        });
    });
});

test('RF-4 · hay 66 imágenes en la galería: 33 originales y sus 33 copias', () => {
    const galeria = getGalleryBlocks(html)[0];
    assert.ok(galeria, 'no hay galería en el hero');

    const imagenes = galeria.match(/<img\b/g) || [];
    assert.equal(imagenes.length, 66, `la galería del hero debe tener 66 imágenes y tiene ${imagenes.length}`);
});

// ============================================
// BUCLE: ANIMACIÓN HACIA ARRIBA Y DURACIONES DISTINTAS (RF-4, RF-5)
// ============================================
test('RF-4 · la pista se anima hacia arriba, de 0 a -50 %, lineal e infinita', () => {
    const pistas = reglasDeLaPistaGaleria();
    assert.ok(pistas.length, 'no hay ninguna regla que anime la pista de la galería');

    const animacion = leerAnimacion(pistas[0].declaraciones);
    assert.ok(animacion, 'la pista de la galería no declara animación');

    const recorrido = recorridoDe(animacion.nombre, css, 'Y');
    assert.ok(recorrido, `falta el bloque @keyframes ${animacion.nombre} con su translateY`);
    assert.equal(recorrido.inicio, 0, `la galería debería empezar en translateY(0) y empieza en ${recorrido.inicio}%`);
    assert.equal(recorrido.fin, -50, `la galería debería terminar en translateY(-50%) y termina en ${recorrido.fin}%`);

    pistas.forEach((regla) => {
        assert.match(regla.declaraciones, /linear/, 'la pista debe animarse de forma lineal');
        assert.match(regla.declaraciones, /infinite/, 'la pista debe animarse en bucle infinito');
    });
});

test('RF-5 · cada columna tarda entre 25 y 50 segundos, y ninguna repite duración', () => {
    assert.equal(columnas.length, 4, `se esperaban 4 columnas y hay ${columnas.length}`);

    const duraciones = columnas.map((columna, indice) => {
        const milisegundos = duracionDeLaColumna(indice);
        assert.ok(milisegundos !== null, `la columna ${indice + 1} no declara una duración legible`);
        assert.ok(
            milisegundos >= 25000 && milisegundos <= 50000,
            `la columna ${indice + 1} debería tardar entre 25000 y 50000 ms y tarda ${milisegundos} ms`
        );
        return milisegundos;
    });

    assert.equal(
        new Set(duraciones).size, 4,
        `las cuatro columnas deberían ir a cuatro velocidades distintas y sus duraciones son ${duraciones.join(', ')} ms`
    );
});

// ============================================
// DECORATIVIDAD: NI ANUNCIOS, NI ENLACES, NI FOCO (RF-6, RF-7, RF-8)
// ============================================
test('RF-7 · el contenedor de la galería es decorativo y las 66 imágenes tienen alt vacío', () => {
    const contenedor = getGalleryBlocks(html)[0];
    assert.ok(contenedor, 'no hay galería en el hero');

    const apertura = contenedor.match(/^<div\b[^>]*>/)[0];
    assert.equal(getAttr(apertura, 'aria-hidden'), 'true', 'el contenedor de la galería debe llevar aria-hidden="true"');

    const imagenes = contenedor.match(/<img\b[^>]*>/g) || [];
    assert.equal(imagenes.length, 66, `la galería debe tener 66 imágenes y tiene ${imagenes.length}`);
    imagenes.forEach((imagen, indice) => {
        assert.equal(getAttr(imagen, 'alt'), '', `la imagen ${indice + 1} de la galería debe llevar alt="" y lleva alt="${getAttr(imagen, 'alt')}"`);
    });
});

test('RF-6 · ninguna imagen de la galería añade enlace, tabindex ni foco', () => {
    const contenedor = getGalleryBlocks(html)[0];
    assert.ok(contenedor, 'no hay galería en el hero');

    (contenedor.match(/<img\b[^>]*>/g) || []).forEach((imagen, indice) => {
        assert.doesNotMatch(imagen, /\stabindex=/, `la imagen ${indice + 1} de la galería no debería tener tabindex`);
        assert.doesNotMatch(imagen, /\bhref=/, `la imagen ${indice + 1} de la galería no debería tener href`);
    });
});

test('RF-8 · la galería no contiene ningún enlace', () => {
    const contenedor = getGalleryBlocks(html)[0];
    assert.ok(contenedor, 'no hay galería en el hero');
    assert.doesNotMatch(contenedor, /<a\b/, 'la galería es adorno: sus imágenes no llevan enlaces');
});

// ============================================
// IMÁGENES POR URL Y SIN CARGA DIFERIDA (RF-19, RF-22)
// ============================================
test('RF-19 · las imágenes del hero no llevan carga diferida', () => {
    const contenedor = getGalleryBlocks(html)[0];
    assert.ok(contenedor, 'no hay galería en el hero');

    (contenedor.match(/<img\b[^>]*>/g) || []).forEach((imagen, indice) => {
        assert.doesNotMatch(imagen, /loading="lazy"/, `la imagen ${indice + 1} del hero está por encima del pliegue y no lleva carga diferida`);
    });
});

test('RF-22 · las imágenes del hero salen de dominios de Image-Line y se referencian por URL', () => {
    const contenedor = getGalleryBlocks(html)[0];
    assert.ok(contenedor, 'no hay galería en el hero');

    (contenedor.match(/<img\b[^>]*>/g) || []).forEach((imagen, indice) => {
        assert.match(
            getAttr(imagen, 'src') || '', /^https:\/\/([a-z]+\.)?image-line\.com\//,
            `la imagen ${indice + 1} de la galería no se referencia por URL de un dominio de Image-Line`
        );
    });
});

// ============================================
// PROPORCIÓN Y RECORTE DE LAS TARJETAS (RF-12, RF-21)
// ============================================
test('RF-12 · las tarjetas reservan proporción 4:3 y las imágenes se recortan por el centro', () => {
    const tarjeta = reglaDe(cssNormal, '.hero-gallery__item');
    assert.ok(tarjeta, 'falta la regla .hero-gallery__item');
    assert.match(tarjeta, /aspect-ratio:\s*4\s*\/\s*3/, 'la tarjeta debe reservar la proporción 4:3');

    const imagen = reglaDe(cssNormal, '.hero-gallery__item img');
    assert.ok(imagen, 'falta la regla de la imagen de la galería');
    assert.match(imagen, /object-fit:\s*cover/, 'la imagen debe ajustarse recortando');
    assert.match(imagen, /object-position:\s*center/, 'el recorte debe ser centrado');
});

test('RF-21 · las tarjetas se ven alineadas aunque no haya animación', () => {
    const tarjeta = reglaDe(cssNormal, '.hero-gallery__item');
    assert.ok(tarjeta, 'falta la regla .hero-gallery__item');
    assert.match(tarjeta, /aspect-ratio:\s*4\s*\/\s*3/, 'la tarjeta debe tener una altura declarada por la proporción');
    assert.match(tarjeta, /background:\s*var\(/, 'la tarjeta debe declarar un color de reserva para cuando la imagen no cargue');
});

// ============================================
// LEGIBILIDAD DEL TEXTO SOBRE EL FONDO EN MOVIMIENTO (RF-9)
// ============================================
test('RF-9 · el degradado protege el texto con un tramo central de opacidad 0,7 o más', () => {
    const scrim = getScrim(html);
    assert.ok(scrim, 'falta la capa de degradado del hero (.hero-gallery__scrim)');

    const regla = reglaDe(cssNormal, '.hero-gallery__scrim');
    assert.ok(regla, 'falta la regla .hero-gallery__scrim');
    assert.match(regla, /linear-gradient/, 'la capa del degradado debe declarar un linear-gradient');
    assert.match(regla, /35%/, 'el tramo central del degradado empieza en el 35 % de la altura');
    assert.match(regla, /65%/, 'el tramo central del degradado termina en el 65 % de la altura');

    const raiz = getRootVariables(css);
    const opacidad = (raiz.match(/--overlay-opacity:\s*([\d.]+)/) || [])[1];
    assert.ok(opacidad, 'falta la variable --overlay-opacity en :root');
    assert.ok(Number(opacidad) >= 0.7, `el tramo central del degradado debería tener 0,7 de opacidad o más y tiene ${opacidad}`);
});

test('RF-9 · las cuatro variables de degradado y sombra están en :root', () => {
    const raiz = getRootVariables(css);
    ['--overlay-rgb', '--overlay-opacity', '--overlay-opacity-edge', '--shadow-color', '--shadow-hero']
        .forEach((variable) => {
            assert.ok(raiz.includes(variable), `falta la variable ${variable} en :root`);
        });
});

CON_SOMBRA.forEach((selector) => {
    test(`RF-9 · ${selector} declara sombra de texto`, () => {
        const declaraciones = declaracionesDe(selector);
        assert.ok(declaraciones, `falta la regla ${selector}`);
        assert.match(
            declaraciones, /text-shadow:\s*var\(--shadow-hero\)/,
            `${selector} debe declarar la sombra de texto sobre el fondo en movimiento`
        );
    });
});

// ============================================
// PAUSA SOLO CON EL FOCO, NUNCA CON EL PUNTERO (RF-15)
// ============================================
test('RF-15 · la galería se detiene con :focus-within', () => {
    const reglas = reglasDeLaPista(cssNormal, ':focus-within');
    assert.ok(reglas.length, 'no hay ninguna regla de pausa con :focus-within sobre la pista de la galería');

    reglas.forEach((declaraciones) => {
        assert.match(declaraciones, /animation-play-state\s*:\s*paused/, 'la pausa del hero debería ser animation-play-state: paused');
    });
});

test('RF-15 · la galería no se detiene al pasar el puntero por encima', () => {
    // Se lee toda la hoja, no solo la parte anterior al media query: una pausa con :hover
    // seguiría siendo un fallo aunque estuviera escrita al final de la hoja
    const reglas = reglasDeLaPista(css, ':hover');
    assert.equal(
        reglas.length, 0,
        `el hero ocupa la primera pantalla: la galería no debe detenerse con :hover. Reglas encontradas: ${reglas.join(' | ')}`
    );
});

// ============================================
// REDUCIR MOVIMIENTO: UN SOLO BLOQUE PARA FRANJAS Y GALERÍA (RF-16, RF-17)
// ============================================
test('RF-17 · la hoja tiene un único bloque de reducir movimiento, y cubre la galería', () => {
    const apariciones = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)/g) || [];
    assert.equal(apariciones.length, 1, `debería haber un solo bloque de reducir movimiento y hay ${apariciones.length}`);

    const bloque = getMediaBlock(css, 'prefers-reduced-motion: reduce');
    assert.ok(bloque, 'falta el bloque @media (prefers-reduced-motion: reduce)');
    assert.ok(bloque.includes('hero-gallery__track'), 'el bloque de reducir movimiento debe anular también la galería');
    assert.ok(bloque.includes('strip-track'), 'el bloque de reducir movimiento debe seguir anulando las franjas');
});

test('RF-16 · el bloque anula la galería con los mismos selectores que le asignan la animación', () => {
    const bloque = getMediaBlock(css, 'prefers-reduced-motion: reduce');
    assert.ok(bloque, 'falta el bloque @media (prefers-reduced-motion: reduce)');

    // Selectores que ASIGNAN la animación a una pista del hero, fuera del media query
    const asignan = [];
    reglasDe(cssNormal).forEach((regla) => {
        if (!leerAnimacion(regla.declaraciones)) return;
        regla.selectores
            .filter((selector) => /\.hero-gallery__track$/.test(selector))
            .forEach((selector) => asignan.push(selector));
    });
    assert.ok(asignan.length > 0, 'no se encuentra ninguna regla que asigne la animación a una pista del hero');

    // Selectores del media query que la anulan con animation: none
    const anulan = [];
    reglasDe(bloque).forEach((regla) => {
        if (!/animation\s*:\s*none/.test(regla.declaraciones)) return;
        regla.selectores
            .filter((selector) => selector.includes('hero-gallery__track'))
            .forEach((selector) => anulan.push(selector));
    });
    assert.ok(anulan.length > 0, 'dentro del media query no hay ninguna regla que anule la animación de la galería');

    // Un media query no suma especificidad: si la regla anuladora es más débil, la galería sigue moviéndose
    asignan.forEach((selector) => {
        const gana = anulan.some((anulador) => anula(anulador, selector));
        assert.ok(
            gana,
            `"${selector}" asigna la animación (${especificidad(selector).join(',')}) y ninguna regla del media query la iguala o supera: ${anulan.join(' | ')}`
        );
    });

    // Con la misma especificidad gana la que aparece después en la hoja
    asignan.forEach((selector) => {
        assert.ok(
            css.indexOf('prefers-reduced-motion') > css.indexOf(selector),
            `el bloque de "reducir movimiento" debe ir después de "${selector}" para ganar con la misma especificidad`
        );
    });
});

test('RF-16 · dentro del hero no queda ninguna zona desplazable', () => {
    ['.hero-gallery', '.hero-gallery__column', '.hero-bg'].forEach((selector) => {
        const regla = reglaDe(cssNormal, selector);
        if (!regla) return;

        assert.doesNotMatch(
            regla, /overflow(-x|-y)?\s*:\s*(auto|scroll)/,
            `${selector} no puede ser una zona desplazable dentro del hero: atraparía el scroll de la página`
        );
    });
});

// ============================================
// IMPRESIÓN (RF-20)
// ============================================
test('RF-20 · al imprimir no sale el bloque de decoración del hero, con la galería dentro', () => {
    const bloque = getMediaBlock(css, 'print');
    assert.ok(bloque, 'falta el bloque @media print');

    const regla = reglaDe(bloque, '.hero-bg');
    assert.ok(regla, 'falta la regla de .hero-bg dentro del bloque de impresión');
    assert.match(regla, /display:\s*none/, 'al imprimir el bloque de decoración del hero debería desaparecer');
    assert.ok(
        css.indexOf('@media print') > css.indexOf('.hero-bg'),
        'el bloque de impresión debe declararse después de la regla normal de .hero-bg para poder ocultarla'
    );
});

// ============================================
// LOS ORBES Y SUS ANIMACIONES DESAPARECEN (RF-13)
// ============================================
test('RF-13 · el hero ya no tiene orbes ni capas de brillo verde', () => {
    assert.ok(hero, 'falta <section id="hero">');
    assert.doesNotMatch(hero, /glow-orb/, 'siguen los orbes verdes en el hero');
    assert.ok(!css.includes('glow-orb'), 'sigue la clase .glow-orb en la hoja de estilos');
    assert.ok(!css.includes('@keyframes float'), 'sigue la animación de flotación de los orbes');
    assert.ok(!css.includes('pulse-glow'), 'sigue la animación de pulso del título');
    assert.ok(!css.includes('@keyframes bounce'), 'sigue la animación de rebote del indicador de scroll');
});

test('RF-13 · el indicador de scroll se queda como una flecha quieta', () => {
    const regla = reglaDe(cssNormal, '.scroll-arrow');
    assert.ok(regla, 'falta la regla .scroll-arrow');
    assert.doesNotMatch(regla, /animation\s*:/, 'la flecha del indicador de scroll no debe animarse: la galería es el único movimiento');
});

// ============================================
// FUNCIONES PURAS LOCALES
// ============================================

// Reglas que animan una pista del hero: puede haber una común o una por columna
function reglasDeLaPistaGaleria() {
    return reglasDe(cssNormal)
        .filter((regla) => regla.selectores.some((selector) => /\.hero-gallery__track$/.test(selector)))
        .filter((regla) => leerAnimacion(regla.declaraciones));
}

// Declaraciones de las reglas que afectan a una pista del hero, opcionalmente con una pseudo-clase
function reglasDeLaPista(texto, pseudo) {
    return reglasDe(texto)
        .filter((regla) => regla.selectores.some(
            (selector) => /\.hero-gallery__track$/.test(selector) && (!pseudo || selector.includes(pseudo))
        ))
        .map((regla) => regla.declaraciones);
}

// Todas las declaraciones de las reglas que mencionan un selector, unidas
// (la sombra de texto puede estar en la regla propia o en una regla agrupada)
function declaracionesDe(selector) {
    const declaraciones = reglasDe(cssNormal)
        .filter((regla) => regla.selectores.includes(selector))
        .map((regla) => regla.declaraciones);
    return declaraciones.length ? declaraciones.join('; ') : null;
}

// Contenido de todos los bloques @media de una misma consulta, por si hay más de uno
function bloquesMedia(consulta) {
    const escaped = consulta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patron = new RegExp(`@media\\s*\\(\\s*${escaped}\\s*\\)\\s*\\{`, 'g');
    const bloques = [];
    let match;

    while ((match = patron.exec(css)) !== null) {
        let depth = 1;
        for (let i = match.index + match[0].length; i < css.length; i++) {
            if (css[i] === '{') depth++;
            if (css[i] === '}') {
                depth--;
                if (depth === 0) {
                    bloques.push(css.slice(match.index + match[0].length, i));
                    break;
                }
            }
        }
    }
    return bloques.join('\n');
}

// Duración en milisegundos de un valor ("30s", "34000ms"), o null
function milisegundosDeTexto(valor) {
    if (!valor) return null;

    const segundos = valor.match(/([\d.]+)s/);
    if (segundos) return Number(segundos[1]) * 1000;

    const milisegundos = valor.match(/([\d.]+)ms/);
    return milisegundos ? Number(milisegundos[1]) : null;
}

// Resuelve una duración: si es var(--x), busca --x primero en sus propias reglas y luego en la hoja
function resolverVariable(duracion, propias) {
    const variable = duracion.match(/var\(\s*--([\w-]+)/);
    if (!variable) return duracion;

    const propia = propias.match(new RegExp(`--${variable[1]}\\s*:\\s*([^;]+)`));
    return propia ? propia[1] : (css.match(new RegExp(`--${variable[1]}\\s*:\\s*([^;]+)`)) || [])[1];
}

// Duración de una columna: la de su propia regla de pista o la variable que ella declara
function duracionDeLaColumna(indice) {
    const suyas = reglasDeLaPistaGaleria().filter((regla) => regla.selectores.some(
        (selector) => /\.hero-gallery__track$/.test(selector) && selector.includes(`hero-gallery__column--${indice + 1}`)
    ));
    const regla = suyas[0] || reglasDeLaPistaGaleria()[0];
    if (!regla) return null;

    const animacion = leerAnimacion(regla.declaraciones);
    if (!animacion || !animacion.duracion) return null;

    const columna = reglaDe(cssNormal, `.hero-gallery__column--${indice + 1}`) || '';
    const propias = [regla.declaraciones, columna].join('; ');
    return milisegundosDeTexto(resolverVariable(animacion.duracion, propias));
}