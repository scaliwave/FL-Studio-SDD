// ============================================
// TESTS: ESTILOS Y RESPONSIVE (Spec 001 · RF-N2 · Spec 002 · RF-17, RF-18, RF-19)
// Incluye el Cambio 003: la altura de la tarjeta en sus dos ramas (RF-24, RF-25)
// Comprueba las reglas de css/styles.css sin navegador
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const { readProjectFile, getMediaBlock, getRule, getRootVariables, reglasDe } = require('./helpers');

const css = readProjectFile('css/styles.css');
const MOBILE = '@media (max-width: 768px)';
const MOBILE_SMALL = '@media (max-width: 480px)';

// La hoja sin los media queries, que es lo mismo que corta el primer @media
const indicePrimerMedia = css.indexOf('@media');
const cssNormal = indicePrimerMedia === -1 ? css : css.slice(0, indicePrimerMedia);

// Convierte un valor de CSS a píxeles: 0.95rem → 15.2 · 140px → 140
function aPx(valor) {
    const numero = Number(String(valor).replace(/[a-z]+$/, ''));
    return /rem$/.test(String(valor)) ? numero * 16 : numero;
}

// Valor en px de una variable CSS declarada en un bloque (--strip-card-width: 140px)
function variablePx(declaraciones, variable) {
    const match = declaraciones.match(new RegExp(`${variable}:\\s*([\\d.]+)(px|rem)?`));
    return match ? aPx(match[1] + (match[2] || 'px')) : null;
}

// Espacio útil dentro del contenedor a un ancho de pantalla.
// RF-18 (v5) descuenta el padding del contenedor y la barra de desplazamiento
// horizontal de Chrome en Windows, que aparece en cuanto la página tiene alto
// suficiente y se resta siempre para no depender del ancho real de la barra.
const BARRA_HORIZONTAL = 15;

function anchoUtil(viewport) {
    const contenedor = getRule(css, '.container') || '';
    const padding = (contenedor.match(/padding:\s*([^;]+)/) || [])[1] || '';
    const partes = padding.trim().split(/\s+/);
    return viewport - 2 * aPx(partes[1] || '0') - BARRA_HORIZONTAL;
}

// ============================================
// FRANJAS: UNA FILA CON SU PROPIA ZONA DESPLAZABLE (RF-17, RF-19)
// ============================================
test('RF-17 · cada franja se muestra como una sola fila dentro de su propia franja', () => {
    const pista = getRule(css, '.strip-track');
    assert.ok(pista, 'falta la regla .strip-track');
    assert.match(pista, /display:\s*flex/, 'la pista debe ser una fila de tarjetas, nunca una cuadrícula');

    const franja = getRule(css, '.strip-scroll');
    assert.ok(franja, 'falta la regla .strip-scroll');
    assert.match(franja, /overflow:\s*hidden/, 'la franja debe recortar su contenido para que la página no se desplace lateralmente');
});

test('RF-19 · por encima de 768 px las franjas ocupan el ancho completo del contenido', () => {
    const franja = getRule(css, '.strip');
    assert.ok(franja, 'falta la regla .strip');

    assert.doesNotMatch(franja, /max-width/, 'la franja no debe llevar max-width: tiene que ocupar el ancho completo del contenido');
    assert.doesNotMatch(franja, /margin:\s*0\s+auto/, 'la franja no debe centrarse: tiene que ocupar el ancho completo del contenido');

    // La pista sí es más ancha que la pantalla; por eso la franja la recorta
    assert.match(getRule(css, '.strip-track'), /width:\s*max-content/, 'la pista debe medir más que la pantalla');
    assert.match(getRule(css, '.strip-scroll'), /overflow:\s*hidden/, 'la franja debe recortar la pista más ancha');
});

test('RF-17 · a 768 px o menos las tarjetas de las franjas se estrechan', () => {
    const base = getRule(css, '.strip');
    const movil = getRule(getMediaBlock(css, MOBILE), '.strip');
    assert.ok(movil, 'falta .strip dentro del media query de 768 px');

    const anchoBase = variablePx(base, '--strip-card-width');
    const anchoMovil = variablePx(movil, '--strip-card-width');
    assert.ok(anchoMovil < anchoBase, `a 768 px o menos la tarjeta debería ser más estrecha: ${anchoMovil} contra ${anchoBase}`);
});

// ============================================
// ANCHOS POR RANGO: 640 px Y 375 PX (RF-18)
// El ancho útil descuenta el padding del contenedor y la barra de desplazamiento
// horizontal (ver anchoUtil), y el recuento se hace siempre con la FRANJA
// DETENIDA, nunca en movimiento. Desde la v6 cuentan las tarjetas completas
// visibles, originales y copias de relleno por igual: para quien mira la franja,
// una copia es indistinguible de su original.
// ============================================
test('RF-18 · a 640 px se ven tres tarjetas completas visibles con la franja detenida', () => {
    const regla = getRule(getMediaBlock(css, MOBILE), '.strip');
    assert.ok(regla, 'falta .strip dentro del media query de 768 px');

    const ancho = variablePx(regla, '--strip-card-width');
    const hueco = variablePx(regla, '--strip-gap') ?? variablePx(getRule(css, '.strip'), '--strip-gap');
    assert.ok(ancho && hueco !== null, 'la franja debe declarar --strip-card-width y --strip-gap');

    const util = anchoUtil(640);
    const necesarias = 3 * ancho + 2 * hueco;
    assert.ok(
        necesarias <= util,
        `a 640 px deben verse 3 tarjetas completas dentro de los ${util} px útiles y hacen falta ${necesarias} px (3 × ${ancho} + 2 × ${hueco}); baja --strip-card-width`
    );
});

test('RF-18 · a 375 px se ven dos tarjetas completas visibles con la franja detenida', () => {
    const regla = getRule(getMediaBlock(css, MOBILE_SMALL), '.strip');
    assert.ok(regla, 'falta .strip dentro del media query de 480 px');

    const ancho = variablePx(regla, '--strip-card-width');
    const hueco = variablePx(regla, '--strip-gap') ?? variablePx(getRule(css, '.strip'), '--strip-gap');
    assert.ok(ancho && hueco !== null, 'la franja debe declarar --strip-card-width y --strip-gap');

    const util = anchoUtil(375);
    const necesarias = 2 * ancho + hueco;
    assert.ok(
        necesarias <= util,
        `a 375 px deben verse 2 tarjetas completas dentro de los ${util} px útiles y hacen falta ${necesarias} px (2 × ${ancho} + ${hueco}); baja --strip-card-width`
    );

    // Nombre legible: 14 px de fuente y 20 px de línea como mínimo
    const nombreBase = getRule(css, '.strip-card__name');
    const nombreMovil = getRule(getMediaBlock(css, MOBILE_SMALL), '.strip-card__name');
    assert.ok(nombreBase, 'falta la regla .strip-card__name');

    const fuente = aPx(((nombreMovil || nombreBase).match(/font-size:\s*([\d.]+rem)/) || [])[1]);
    const linea = aPx((nombreBase.match(/line-height:\s*([\d.]+rem)/) || [])[1]);
    assert.ok(fuente >= 14, `el nombre de la tarjeta debería medir 14 px o más y mide ${fuente} px`);
    assert.ok(linea >= 20, `la línea del nombre debería medir 20 px o más y mide ${linea} px`);
});

// ============================================
// ALTURA DE LA TARJETA EN LAS DOS RAMAS · CAMBIO 003 (RF-24, RF-25)
// La tarjeta pasa a ser la imagen oficial a sangre, así que su alto sale de la
// proporción 4:3 de la imagen y no de lo que ocupe el texto. Hay dos ramas:
// con puntero el texto va sobre la imagen (alto = imagen) y sin puntero el texto
// vive en una banda sólida bajo la imagen (alto = imagen + banda). El ancho y el
// hueco no cambian, así que el recuento de RF-18 sigue siendo el mismo.
// Las cifras son las de la tabla de RF-25 de la spec.
// ============================================

// Las tres filas de la tabla de RF-25, con la regla .strip de cada rango
const ALTURAS_TARJETA = [
    { rango: 'por encima de 768 px', ancho: 220, alto: 165, total: 209, bloque: () => getRule(css, '.strip') },
    { rango: 'de 481 a 768 px', ancho: 124, alto: 93, total: 137, bloque: () => getRule(getMediaBlock(css, MOBILE), '.strip') },
    { rango: '480 px o menos', ancho: 88, alto: 66, total: 110, bloque: () => getRule(getMediaBlock(css, MOBILE_SMALL), '.strip') }
];

// La banda de texto de la rama sin puntero: 2 líneas de 20 px más 4 px de aire
const BANDA_TEXTO = 44;
const AIRE_BANDA = 4;

// El bloque @media (hover: none) de las franjas. La hoja ya traía otro de la spec 001
// para el overlay de la galería, así que no vale el primero que aparece.
function bloqueSinPunteroDeLasTarjetas() {
    let desde = 0;

    while (desde < css.length) {
        const inicio = css.indexOf('(hover: none)', desde);
        if (inicio === -1) return null;

        const bloque = getMediaBlock(css.slice(inicio), 'hover: none');
        if (!bloque) return null;
        if (bloque.includes('.strip-card')) return { bloque, indice: inicio };

        desde = inicio + bloque.length;
    }

    return null;
}

ALTURAS_TARJETA.forEach(({ rango, ancho, alto, total, bloque }) => {
    test(`RF-25 · ${rango}: con puntero la tarjeta mide solo la imagen, ${alto} px`, () => {
        const regla = bloque();
        assert.ok(regla, `falta .strip${rango === 'por encima de 768 px' ? '' : ' en su media query'}`);

        const anchoDeclarado = variablePx(regla, '--strip-card-width');
        assert.ok(anchoDeclarado, 'la franja debe declarar --strip-card-width');
        assert.equal(anchoDeclarado, ancho, `la tabla de RF-25 fija ${ancho} px de tarjeta y hay ${anchoDeclarado} px`);

        // La imagen mantiene su proporción 4:3, así que el alto sale del ancho y no está escrito a mano
        const derivado = anchoDeclarado * 3 / 4;
        assert.ok(
            Math.abs(derivado - alto) <= 0.5,
            `con ${anchoDeclarado} px de ancho y proporción 4:3 el alto sale ${derivado} px y la tabla de RF-25 fija ${alto} px`
        );

        const altoDeclarado = variablePx(regla, '--strip-card-height');
        assert.ok(
            altoDeclarado,
            'la franja debe declarar --strip-card-height: la altura de la tarjeta es fija, no la da el texto'
        );
        assert.equal(altoDeclarado, alto, `a ${rango} la tarjeta debería medir ${alto} px y mide ${altoDeclarado} px`);
    });

    test(`RF-25 · ${rango}: sin puntero la tarjeta mide la imagen más la banda, ${total} px`, () => {
        const sinPuntero = bloqueSinPunteroDeLasTarjetas();
        assert.ok(sinPuntero, 'falta el bloque @media (hover: none) de las tarjetas de las franjas');

        const tarjeta = getRule(sinPuntero.bloque, '.strip-card');
        assert.ok(tarjeta, 'dentro de @media (hover: none) no hay ninguna regla para .strip-card');
        assert.match(
            tarjeta, /height\s*:\s*calc\([^)]*--strip-card-height[^)]*\)/,
            'sin puntero la tarjeta debería medir la imagen más la banda con calc(var(--strip-card-height) + var(--strip-band-height))'
        );
        assert.match(
            tarjeta, /--strip-band-height/,
            'la altura sin puntero debería sumar la banda de texto: si no, el nombre se saldría de la tarjeta'
        );

        // El total es el alto de la imagen del rango más la banda, y sale de los valores del CSS
        const altoImagen = variablePx(bloque(), '--strip-card-height');
        const banda = variablePx(getRule(css, '.strip'), '--strip-band-height');
        assert.ok(altoImagen, 'la franja debe declarar --strip-card-height');
        assert.ok(banda, 'la franja debe declarar --strip-band-height');

        assert.equal(banda, BANDA_TEXTO, `la banda de texto debería medir ${BANDA_TEXTO} px y mide ${banda} px`);
        assert.equal(
            altoImagen + banda, total,
            `a ${rango} la tarjeta sin puntero debería medir ${altoImagen} + ${banda} = ${total} px y la tabla de RF-25 fija ${total} px`
        );
    });
});

test('RF-25 · con puntero la tarjeta toma su altura de la imagen a sangre, sin relleno', () => {
    const tarjeta = getRule(css, '.strip-card');
    assert.ok(tarjeta, 'falta la regla .strip-card');

    assert.match(
        tarjeta, /height\s*:\s*var\(--strip-card-height\)/,
        'la tarjeta debería medir var(--strip-card-height): una altura fija, no la que le dé el contenido'
    );
    assert.match(tarjeta, /padding\s*:\s*0/, 'la imagen va a sangre: la tarjeta no debería tener relleno');
    assert.match(tarjeta, /overflow\s*:\s*hidden/, 'la tarjeta debería recortar la imagen que crece al interactuar');
});

test('RF-24 · la tarjeta no cambia de altura al interactuar con ella', () => {
    // Un selector que apunta a la tarjeta en sí, no a su imagen ni a su bloque de texto
    const apuntaALaTarjeta = (selector) => /(^|[\s,>+~])\.strip-card(?![\w-])/.test(selector);

    const interactuan = reglasDe(css).filter((regla) => regla.selectores.some(
        (selector) => apuntaALaTarjeta(selector) && (selector.includes(':hover') || selector.includes(':focus-visible'))
    ));

    interactuan.forEach((regla) => {
        ['height', 'min-height', 'max-height', 'padding'].forEach((propiedad) => {
            assert.doesNotMatch(
                regla.declaraciones, new RegExp(`(?:^|[;{])\\s*${propiedad}\\s*:`),
                `esta regla de interacción cambia ${propiedad} y la tarjeta daría un salto al pasar el puntero: ${regla.selectores.join(', ')}`
            );
        });
    });
});

test('RF-25 · en la banda de texto caben dos líneas del nombre, con fuente de 14 px o más', () => {
    const banda = variablePx(getRule(css, '.strip'), '--strip-band-height');
    assert.ok(banda, 'la franja debe declarar --strip-band-height: sin banda el nombre no tiene dónde verse');

    const nombre = getRule(css, '.strip-card__name');
    assert.ok(nombre, 'falta la regla .strip-card__name');

    const linea = aPx((nombre.match(/line-height:\s*([\d.]+rem)/) || [])[1]);
    const fuente = aPx((nombre.match(/font-size:\s*([\d.]+rem)/) || [])[1]);

    assert.ok(linea >= 20, `la línea del nombre debería medir 20 px o más y mide ${linea} px`);
    assert.ok(
        banda >= 2 * linea + AIRE_BANDA,
        `una banda de ${banda} px no cabe dos líneas de ${linea} px más ${AIRE_BANDA} px de aire: hacen falta ${2 * linea + AIRE_BANDA} px`
    );
    assert.ok(
        fuente >= 14,
        `el nombre debería medir 14 px de fuente o más para que quepan "Transient Processor" y "DirectWave", y mide ${fuente} px`
    );
});

// ============================================
// RF-27 · AVISO CORTO EN EL RANGO DE 480 PX O MENOS (CSS)
// Por debajo de 480 px solo se ve «se abre en una pestaña nueva»: el prefijo
// «Ver en image-line.com ·» se esconde con la técnica de recorte a un píxel, que
// lo saca de la vista sin sacarlo del árbol accesible. Ni display: none ni
// visibility: hidden, que sí lo sacarían (RF-14). El rango es por ancho de
// pantalla, no por falta de puntero.
// ============================================
test('RF-27 · a 480 px o menos el prefijo del aviso se esconde sin sacarlo del árbol accesible', () => {
    const regla = getRule(getMediaBlock(css, MOBILE_SMALL), '.strip-card__notice-prefix');
    assert.ok(regla, 'dentro del rango de 480 px no hay ninguna regla para .strip-card__notice-prefix');

    // Ni display: none ni visibility: hidden: las dos lo sacarían del árbol accesible
    assert.doesNotMatch(regla, /display\s*:\s*none/, 'display: none saca el prefijo del árbol accesible, y RF-14 lo quiere dentro');
    assert.doesNotMatch(regla, /visibility\s*:\s*hidden/, 'visibility: hidden saca el prefijo del árbol accesible, y RF-14 lo quiere dentro');

    // La técnica de recorte: una caja de un píxel, sin flujo y recortada
    assert.match(regla, /position\s*:\s*absolute/, 'el prefijo debería salir del flujo para no ocupar sitio en el aviso');
    assert.match(regla, /width\s*:\s*1px/, 'el prefijo debería reducirse a un píxel de ancho');
    assert.match(regla, /height\s*:\s*1px/, 'el prefijo debería reducirse a un píxel de alto');
    assert.match(regla, /overflow\s*:\s*hidden/, 'el prefijo debería recortarse para que su texto no se vea');
    assert.match(regla, /clip-path\s*:\s*inset\(50%\)/, 'el prefijo debería recortarse con clip-path');
    assert.match(regla, /white-space\s*:\s*nowrap/, 'el prefijo debería llevar white-space: nowrap para que el recorte no lo reparta en varias líneas');
});

test('RF-27 · por encima de 480 px el prefijo del aviso se ve entero, sin regla que lo esconda', () => {
    // Por encima de 480 px el aviso completo se ve, así que el prefijo no puede
    // tener ninguna regla fuera del rango de 480 px: ni en la base ni en 768 px.
    // getRule busca en toda la hoja, así que la base se recorta antes del primer @media
    const primerMedia = css.indexOf('@media');
    assert.ok(primerMedia > -1, 'la hoja debería tener bloques @media');
    const base = getRule(css.slice(0, primerMedia), '.strip-card__notice-prefix');
    assert.equal(base, null, 'el prefijo no debería tener regla en la base: por encima de 480 px se ve entero');

    const en768 = getRule(getMediaBlock(css, MOBILE), '.strip-card__notice-prefix');
    assert.equal(en768, null, 'el prefijo no debería tener regla en el rango de 768 px: ahí se ve entero');
});

test('RF-14 · RF-27 · nada en toda la hoja saca el aviso ni su prefijo del árbol accesible', () => {
    // Ni display: none ni visibility: hidden en ninguna regla de la hoja: el aviso
    // completo, prefijo incluido, tiene que seguir disponible para los lectores de
    // pantalla en los tres anchos (RF-14), y en móvil lo que se acorta es solo la vista
    const selectoresDelAviso = ['.strip-card__notice', '.strip-card__notice-prefix'];

    [...reglasDe(cssNormal), ...reglasDe(css)].forEach((regla) => {
        if (!regla.selectores.some((selector) => selectoresDelAviso.some((c) => selector.includes(c)))) return;
        assert.doesNotMatch(
            regla.declaraciones, /display\s*:\s*none/,
            `esta regla saca el aviso del árbol accesible con display: none: ${regla.selectores.join(', ')}`
        );
        assert.doesNotMatch(
            regla.declaraciones, /visibility\s*:\s*hidden/,
            `esta regla saca el aviso del árbol accesible con visibility: hidden: ${regla.selectores.join(', ')}`
        );
    });
});

// ============================================
// GALERÍA DEL HERO: COLUMNAS Y TARJETAS POR RANGO (RF-10, RF-18)
// La galería va a sangre: su ancho es el de la ventana, así que el relleno
// horizontal del hero no le resta espacio. Lo único que se descuenta es la
// barra de desplazamiento vertical del navegador, de 15 px (RF-10).
// Las cifras son las de la tabla de RF-10 de la spec.
// ============================================
const ALTO_HERO_REFERENCIA = 640;

const COLUMNAS_HERO = [
    { rango: 'por encima de 768 px', pantalla: 1280, columnas: 4, hueco: 16, ancho: 304, alto: 228, bloque: () => css },
    { rango: 'de 481 a 768 px', pantalla: 640, columnas: 3, hueco: 12, ancho: 200, alto: 150, bloque: () => getMediaBlock(css, MOBILE) },
    { rango: '480 px o menos', pantalla: 375, columnas: 2, hueco: 8, ancho: 176, alto: 132, bloque: () => getMediaBlock(css, MOBILE_SMALL) }
];

// Columnas visibles y hueco horizontal que declara el CSS para la galería
function columnasYHueco(bloque) {
    const regla = getRule(bloque, '.hero-gallery');
    assert.ok(regla, 'falta la regla .hero-gallery de la galería del hero');

    const columnas = (regla.match(/repeat\(\s*(\d+)\s*,\s*1fr\s*\)/) || [])[1];
    const hueco = (regla.match(/gap:\s*([\d.]+)px/) || [])[1];
    assert.ok(columnas && hueco, 'la galería debe declarar repeat(N, 1fr) y su hueco en píxeles');

    return { columnas: Number(columnas), hueco: Number(hueco) };
}

COLUMNAS_HERO.forEach(({ rango, pantalla, columnas, hueco, ancho, alto, bloque }) => {
    test(`RF-10 · ${rango}: la galería reparte el ancho útil en ${columnas} columnas de ${ancho} px`, () => {
        const declarado = columnasYHueco(bloque());
        assert.equal(declarado.columnas, columnas, `deberían declararse ${columnas} columnas y hay ${declarado.columnas}`);
        assert.equal(declarado.hueco, hueco, `debería declararse un hueco de ${hueco} px y hay ${declarado.hueco}`);

        // El ancho sale de repartir el ancho útil menos los huecos internos: no queda hueco lateral
        const util = pantalla - BARRA_HORIZONTAL;
        const derivado = (util - (columnas - 1) * hueco) / columnas;
        assert.ok(
            Math.abs(derivado - ancho) <= 1,
            `con ${util} px útiles, ${columnas} columnas y huecos de ${hueco} px salen ${derivado.toFixed(1)} px de columna y la tabla de RF-10 fija ${ancho} px`
        );

        // La tarjeta reserva la proporción 4:3, así que su alto sale del ancho de columna
        const altoTarjeta = derivado * 3 / 4;
        assert.ok(
            Math.abs(altoTarjeta - alto) <= 1,
            `la tarjeta 4:3 mediría ${altoTarjeta.toFixed(1)} px de alto y la tabla de RF-10 fija ${alto} px`
        );
    });
});

test('RF-10 · con el hero de 640 px caben dos tarjetas completas y la media pista supera 1,5 veces su alto', () => {
    const pista = getRule(css, '.hero-gallery__track');
    assert.ok(pista, 'falta la regla .hero-gallery__track');

    const huecoVertical = (pista.match(/gap:\s*([\d.]+)px/) || [])[1];
    assert.ok(huecoVertical, 'la pista debe declarar el hueco vertical entre tarjetas');

    COLUMNAS_HERO.forEach(({ rango, alto }) => {
        const paso = alto + Number(huecoVertical);
        const mitad = 9 * paso; // 9 originales en la primera columna: la mitad de su pista

        assert.ok(
            2 * paso <= ALTO_HERO_REFERENCIA,
            `a ${rango} solo caben ${Math.floor(ALTO_HERO_REFERENCIA / paso)} tarjetas completas en ${ALTO_HERO_REFERENCIA} px de alto y RF-10 exige al menos 2`
        );
        assert.ok(
            mitad >= 1.5 * ALTO_HERO_REFERENCIA,
            `a ${rango} la media pista mide ${mitad} px y debería medir al menos ${1.5 * ALTO_HERO_REFERENCIA} px (1,5 × ${ALTO_HERO_REFERENCIA})`
        );
    });
});

test('RF-18 · la galería va a sangre: cubre todo el hero sin hueco lateral ni centrado', () => {
    const galeria = getRule(css, '.hero-gallery');
    assert.ok(galeria, 'falta la regla .hero-gallery');

    assert.match(galeria, /position:\s*absolute/, 'la galería debe ser absoluta para cubrir el hero entero');
    assert.match(galeria, /inset:\s*0/, 'la galería debe cubrir el hero entero');
    assert.doesNotMatch(galeria, /max-width/, 'la galería no debe llevar max-width: va a sangre');
    assert.doesNotMatch(galeria, /margin:\s*0\s+auto/, 'la galería no debe centrarse: va a sangre');
});

// ============================================
// PIE: CUATRO BLOQUES EN UNA FILA Y UNA COLUMBA EN MÓVIL (RF-17, RF-19)
// ============================================
test('RF-19 · por encima de 768 px el pie conserva sus cuatro bloques en una fila', () => {
    const regla = getRule(css, '.footer-content');
    assert.ok(regla, 'falta la regla .footer-content');
    assert.match(
        regla, /grid-template-columns:\s*2fr\s+1fr\s+1fr\s+1fr/,
        'el pie debe repartir el ancho entre los cuatro bloques: marca, Enlaces, Sitio oficial y Síguenos'
    );
});

test('RF-17 · a 768 px o menos el pie pasa a una sola columna conservando su orden', () => {
    const regla = getRule(getMediaBlock(css, MOBILE), '.footer-content');
    assert.ok(regla, 'falta .footer-content dentro del media query de 768 px');
    assert.match(regla, /grid-template-columns:\s*1fr/);
});

// ============================================
// LO QUE SIGUE VIGENTE DE LA SPEC 001
// ============================================
test('RF-9 · Características y Galería también pasan a una columna en 768 px o menos', () => {
    const media = getMediaBlock(css, MOBILE);
    assert.match(getRule(media, '.features-grid'), /grid-template-columns:\s*1fr/);
    assert.match(getRule(media, '.gallery-grid'), /grid-template-columns:\s*1fr/);
});

test('RF-N2 · no quedan estilos obsoletos de la antigua sección de Flex ni de la antigua rejilla', () => {
    const obsoletos = [
        '.flex-section', '.flex-content', '.flex-image', '.flex-info',
        '.flex-features', '.flex-placeholder',
        // estilos que solo usaba la sección de Flex
        '.image-frame', '.image-glow', '.check-icon',
        // estilos de las tres tarjetas que las franjas sustituyen
        '.synths-grid', '.synth-card', '.synth-image', '.synth-external',
        // adorno animado del hero que la galería del hero sustituye (RF-13)
        '.glow-orb', '.glow-orb-1', '.glow-orb-2'
    ];
    obsoletos.forEach((selector) => {
        assert.equal(getRule(css, selector), null, `sigue el estilo obsoleto ${selector}`);
    });

    // Las tres animaciones del hero desaparecen: la galería es su único movimiento
    ['float', 'pulse-glow', 'bounce'].forEach((animacion) => {
        assert.ok(!css.includes(`@keyframes ${animacion}`), `sigue la animación @keyframes ${animacion}`);
        assert.ok(!css.includes(`animation: ${animacion}`), `sigue usándose la animación ${animacion}`);
    });

    // Y con ellas el brillo verde del título, que era la otra mitad de su decoración.
    // Solo se vigila el título del hero: el logo de la navbar conserva su propio
    // brillo, que es de otra sección y esta spec no lo toca.
    ['.hero-title', '.title-line', '.title-line.accent'].forEach((selector) => {
        const regla = getRule(css, selector);
        assert.ok(regla, `falta la regla ${selector} del título del hero`);
        assert.doesNotMatch(
            regla, /text-shadow:[^;]*glow/,
            `vuelve el brillo verde en ${selector}: el texto lleva ahora la sombra de --shadow-hero`
        );
    });
});

test('RF-N2 · la paleta, las tipografías y las transiciones siguen en :root', () => {
    const root = getRootVariables(css);
    [
        '--bg-primary', '--bg-secondary', '--bg-tertiary',
        '--accent-primary', '--accent-secondary', '--text-primary',
        '--text-secondary', '--text-muted', '--border-color',
        '--font-primary', '--font-display',
        '--transition-fast', '--transition-medium'
    ].forEach((variable) => {
        assert.ok(root.includes(variable), `falta la variable ${variable} en :root`);
    });
});