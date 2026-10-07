// ============================================
// TESTS: FRANJAS DE INSTRUMENTOS Y EFECTOS (Spec 002 · RF-6, RF-7, RF-13, RF-15, RF-16, RF-N4, RF-N5)
// Incluye el Cambio 003: el nombre y el aviso agrupados en .strip-card__meta (RF-13, RF-16, RF-22, RF-26)
// Los destinos y las imágenes esperadas se leen del anexo de la spec: una sola fuente de verdad
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    readProjectFile, getSection, getHref, stripTags, getStrips,
    getCardName, getCardNotice, getCardNoticePrefix, getCardMeta, getCardImage, isDecorative
} = require('./helpers');

const html = readProjectFile('index.html');
const spec = readProjectFile('specs/002-rutas-sitio-oficial/spec.md');

// ============================================
// DATOS ESPERADOS: anexo de la spec (destinos e imágenes)
// ============================================

// Filas de una tabla del anexo, ya sin cabeceras y sin las comillas del código
function leerTablaDelAnexo(titulo) {
    // \r? antes de cada salto: con core.autocrlf el checkout trae CRLF y el
    // titulo ya no estaria pegado a un \n pelado
    const bloque = spec.match(new RegExp(`### ${titulo}\\r?\\n([\\s\\S]*?)(?=\\r?\\n#{2,3} )`));
    assert.ok(bloque, `el anexo de la spec no tiene el apartado "${titulo}"`);

    return bloque[1]
        .split('\n')
        .map((linea) => linea.replace(/\r$/, ''))
        .filter((linea) => linea.trim().startsWith('|') && !/^(\|[\s|:-]*)+$/.test(linea.trim()))
        .slice(1)
        .map((fila) => fila.split('|').slice(1, -1).map((celda) => celda.trim().replace(/`/g, '')));
}

const FILAS_DESTINO = leerTablaDelAnexo('Destino de cada tarjeta');
const FILAS_IMAGEN = leerTablaDelAnexo('Imagen oficial de cada tarjeta');

// Solo es un destino válido una dirección real: 3xOSC no tiene página oficial (RF-16)
function comoDestino(celda) {
    return /^https:\/\//.test(celda) ? celda : null;
}

// Imagen oficial de un instrumento o de un efecto según el anexo
// (columna 0/1 para instrumentos y 2/3 para efectos)
function imagenDe(nombre) {
    for (const fila of FILAS_IMAGEN) {
        if (fila[0] === nombre) return fila[1];
        if (fila[2] === nombre) return fila[3];
    }
    return null;
}

// Las dos listas, en el orden de RF-6 y de RF-7
const INSTRUMENTOS = FILAS_DESTINO
    .filter(([instrumento]) => instrumento)
    .map(([instrumento, destino]) => ({ name: instrumento, url: comoDestino(destino), image: imagenDe(instrumento) }));

const EFECTOS = FILAS_DESTINO
    .filter(([, , efecto]) => efecto)
    .map(([, , efecto, destino]) => ({ name: efecto, url: comoDestino(destino), image: imagenDe(efecto) }));

const SIN_PAGINA = '3xOSC'; // único caso sin página oficial (anexo de la spec)

// ============================================
// FRANJAS DEL HTML ACTUAL
// ============================================
const section = getSection(html, 'sintetizadores');
const strips = getStrips(section || '');

// RF-6 va antes que RF-7: la franja de efectos va debajo de la de instrumentos
function instrumentos() {
    assert.ok(section, 'falta <section id="sintetizadores">');
    assert.ok(strips[0], 'no hay ninguna franja de instrumentos en la sección de Sintetizadores');
    return strips[0];
}

function efectos() {
    assert.ok(section, 'falta <section id="sintetizadores">');
    assert.ok(strips[1], 'la franja de efectos debe ir debajo de la de instrumentos');
    return strips[1];
}

const FRANJAS = [
    { etiqueta: 'instrumentos', esperados: INSTRUMENTOS, franja: instrumentos },
    { etiqueta: 'efectos', esperados: EFECTOS, franja: efectos }
];

// ============================================
// ESTRUCTURA DE LAS DOS FRANJAS
// ============================================
test('RF-6 · RF-7 · los datos esperados salen del anexo: 14 instrumentos y 13 efectos con destino e imagen', () => {
    assert.equal(INSTRUMENTOS.length, 14, `el anexo lista ${INSTRUMENTOS.length} instrumentos y deben ser 14`);
    assert.equal(EFECTOS.length, 13, `el anexo lista ${EFECTOS.length} efectos y deben ser 13`);
    [...INSTRUMENTOS, ...EFECTOS].forEach((esperado) => {
        assert.ok(esperado.url || esperado.name === SIN_PAGINA, `${esperado.name} debería tener página oficial en el anexo`);
        assert.ok(esperado.image, `el anexo no da imagen para ${esperado.name}`);
    });
    assert.equal(INSTRUMENTOS.filter((esperado) => !esperado.url).length, 1, 'solo un instrumento debería quedarse sin página oficial');
});

test('RF-6 · RF-7 · la sección de Sintetizadores tiene una franja de instrumentos y otra de efectos', () => {
    assert.ok(section, 'falta <section id="sintetizadores">');
    assert.equal(strips.length, 2, `se esperaban 2 franjas (instrumentos y efectos) y hay ${strips.length}`);
});

FRANJAS.forEach(({ etiqueta, esperados, franja }) => {
    test(`RF-6 · RF-7 · la franja de ${etiqueta} tiene ${esperados.length} tarjetas originales en el orden de la spec`, () => {
        const nombres = franja().cards.map(getCardName);
        assert.deepEqual(nombres, esperados.map((esperado) => esperado.name));
        assert.equal(
            new Set(nombres).size, esperados.length,
            `la franja de ${etiqueta} repite algún nombre entre sus tarjetas originales`
        );
    });

    test(`RF-6 · RF-7 · las copias de relleno de ${etiqueta} no cuentan y son decorativas`, () => {
        const { cards, fillers } = franja();

        assert.equal(
            fillers.length, esperados.length,
            `se esperaban ${esperados.length} copias de relleno en ${etiqueta} y hay ${fillers.length}`
        );
        assert.equal(
            cards.length + fillers.length, esperados.length * 2,
            `la franja de ${etiqueta} debería llevar cada tarjeta original repetida una vez`
        );

        fillers.forEach((copia, indice) => {
            assert.ok(isDecorative(copia), `la copia ${indice + 1} de ${etiqueta} no lleva aria-hidden="true"`);
            assert.equal(
                getCardName(copia), esperados[indice].name,
                `la copia ${indice + 1} de ${etiqueta} no repite el nombre de su tarjeta original`
            );
            assert.equal(
                getHref(copia), null,
                `la copia ${indice + 1} de ${etiqueta} no debería tener enlace: no debe poder pulsarse`
            );
        });
    });
});

// ============================================
// DESTINOS DE CADA TARJETA (RF-15, RF-16)
// ============================================
FRANJAS.forEach(({ etiqueta, esperados, franja }) => {
    test(`RF-15 · cada tarjeta enlazada de ${etiqueta} abre su página oficial del anexo en una pestaña nueva`, () => {
        esperados.forEach((esperado, indice) => {
            if (!esperado.url) return; // 3xOSC no tiene página oficial (RF-16)

            const card = franja().cards[indice];
            assert.ok(card, `falta la tarjeta de ${esperado.name}`);

            assert.equal(getHref(card), esperado.url, `destino inesperado en la tarjeta de ${esperado.name}`);
            assert.match(card, /target="_blank"/, `falta target="_blank" en ${esperado.name}`);
            assert.match(card, /rel="[^"]*noopener/, `falta rel="noopener" en ${esperado.name}`);
        });
    });

    test(`RF-14 · el aviso de "pestaña nueva" está en el texto de cada tarjeta enlazada de ${etiqueta}`, () => {
        esperados.forEach((esperado, indice) => {
            if (!esperado.url) return; // 3xOSC no tiene página oficial (RF-16)

            const card = franja().cards[indice];
            assert.ok(card, `falta la tarjeta de ${esperado.name}`);
            assert.match(stripTags(card), /se abre en una pestaña nueva/i, `falta el aviso de "pestaña nueva" en ${esperado.name}`);

            const aviso = getCardNotice(card);
            assert.ok(aviso, `${esperado.name} no tiene aviso de enlace externo (.strip-card__notice)`);
            assert.match(aviso, /image-line\.com/i, `el aviso de ${esperado.name} no menciona image-line.com`);
        });
    });
});

test('RF-16 · 3xOSC es la única tarjeta sin página oficial: sin href, sin aviso y sin tabindex', () => {
    const indice = INSTRUMENTOS.findIndex((esperado) => esperado.name === SIN_PAGINA);
    assert.ok(indice > -1, `${SIN_PAGINA} no aparece en el anexo de la spec`);

    const cards = instrumentos().cards;
    const card = cards[indice];
    assert.ok(card, `falta la tarjeta de ${SIN_PAGINA}`);

    assert.doesNotMatch(card, /<a\b/, `${SIN_PAGINA} no debería ser un enlace: no tiene página oficial`);
    assert.equal(getHref(card), null, `${SIN_PAGINA} no debería tener href`);
    assert.equal(getCardNotice(card), null, `${SIN_PAGINA} no debería llevar aviso de enlace externo`);
    assert.doesNotMatch(card, /\stabindex=/, `${SIN_PAGINA} no debería ser alcanzable con el teclado`);

    cards.forEach((otra, i) => {
        if (i === indice) return;
        assert.ok(getHref(otra), `${getCardName(otra)} debería enlazar: solo ${SIN_PAGINA} se queda sin página oficial`);
    });
});

// ============================================
// CONTENIDO DE CADA TARJETA (RF-13, RF-N4, RF-N5)
// ============================================
const DOMINIOS_IMAGEN = ['www.image-line.com', 'support.image-line.com'];

FRANJAS.forEach(({ etiqueta, esperados, franja }) => {
    test(`RF-13 · cada tarjeta original de ${etiqueta} tiene una sola imagen oficial de Image-Line que la nombra`, () => {
        esperados.forEach((esperado, indice) => {
            const card = franja().cards[indice];
            assert.ok(card, `falta la tarjeta de ${esperado.name}`);

            const imagenes = card.match(/<img\b[^>]*>/g) || [];
            assert.equal(imagenes.length, 1, `${esperado.name} debería tener una sola imagen y tiene ${imagenes.length}`);

            const imagen = getCardImage(card);
            assert.ok(imagen, `${esperado.name} no tiene imagen`);
            assert.match(imagen.src, /^https:\/\//, `la imagen de ${esperado.name} no se referencia por URL: ${imagen.src}`);
            assert.ok(
                DOMINIOS_IMAGEN.some((dominio) => imagen.src.includes(dominio)),
                `la imagen de ${esperado.name} no está en un dominio de Image-Line: ${imagen.src}`
            );
            assert.equal(imagen.src, esperado.image, `la imagen de ${esperado.name} no es la del anexo: ${imagen.src}`);
            assert.ok(imagen.alt && imagen.alt.trim().length > 0, `${esperado.name} sin texto alternativo`);
            assert.ok(imagen.alt.includes(esperado.name), `el alt de ${esperado.name} debe nombrarlo`);
            assert.doesNotMatch(card, /placeholder-image/, `queda el placeholder SVG en la tarjeta de ${esperado.name}`);
        });
    });

    test(`RF-13 · ninguna tarjeta de ${etiqueta} incluye un párrafo de descripción`, () => {
        esperados.forEach((esperado, indice) => {
            const card = franja().cards[indice];
            assert.ok(card, `falta la tarjeta de ${esperado.name}`);
            assert.doesNotMatch(card, /<p[\s>]/, `${esperado.name} tiene un párrafo de descripción: solo nombre e imagen`);
        });
    });

    test(`RF-13 · el texto de cada tarjeta de ${etiqueta} es solo el nombre y el aviso`, () => {
        esperados.forEach((esperado, indice) => {
            const card = franja().cards[indice];
            assert.ok(card, `falta la tarjeta de ${esperado.name}`);

            const aviso = getCardNotice(card);
            const resto = stripTags(card).replace(aviso || '', ' ').replace(esperado.name, ' ').trim();
            assert.equal(resto, '', `${esperado.name} muestra texto inesperado: "${resto}"`);
        });
    });
});

// ============================================
// BLOQUE DE TEXTO DE LA TARJETA · CAMBIO 003 (RF-13, RF-16, RF-22, RF-26)
// El nombre y el aviso dejan de ser sueltos y pasan a vivir juntos en un bloque
// .strip-card__meta, que es lo que se revela al interactuar con la tarjeta. El
// Cambio 003 no borra el texto: lo agrupa, y lo hace también en las copias de
// relleno, cuyo bloque es idéntico al de su original pero nunca se revela.
// ============================================

// El enlace de una tarjeta enlazada, o null si no lo tiene
function enlaceDe(card) {
    return card.match(/<a\b[^>]*class="[^"]*\bstrip-card__link\b[^"]*"[^>]*>/);
}

FRANJAS.forEach(({ etiqueta, esperados, franja }) => {
    test(`RF-13 · RF-22 · cada tarjeta original de ${etiqueta} agrupa su nombre y su aviso en un bloque de texto`, () => {
        const { cards } = franja();
        assert.equal(cards.length, esperados.length, `se esperaban ${esperados.length} tarjetas y hay ${cards.length}`);

        cards.forEach((card, indice) => {
            const { name, url } = esperados[indice];
            assert.ok(card, `falta la tarjeta de ${name}`);

            const meta = getCardMeta(card);
            assert.ok(meta, `${name} no tiene bloque de texto (.strip-card__meta): el nombre y el aviso siguen sueltos`);
            assert.equal(getCardName(meta), name, `el bloque de texto de ${name} no lleva su nombre`);

            if (url) {
                const aviso = getCardNotice(meta);
                assert.ok(aviso, `el bloque de texto de ${name} no lleva su aviso de enlace externo`);
                assert.match(aviso, /image-line\.com/i, `el aviso de ${name} no menciona image-line.com`);

                // En las tarjetas que enlazan, el bloque va dentro del enlace
                const enlace = enlaceDe(card);
                assert.ok(enlace, `${name} debería seguir enlazando a su página oficial`);
                const dentroDelEnlace = card.slice(card.indexOf(enlace[0])).split('</a>')[0];
                assert.match(
                    dentroDelEnlace, /class="[^"]*\bstrip-card__meta\b/,
                    `el bloque de texto de ${name} debería ir dentro de su enlace`
                );
            } else {
                assert.equal(getCardNotice(meta), null, `${name} no debería llevar aviso: no tiene página oficial`);
            }
        });
    });

    test(`RF-26 · la copia de relleno de ${etiqueta} lleva el mismo bloque de texto que su original`, () => {
        const { cards, fillers } = franja();
        assert.equal(fillers.length, esperados.length, `se esperaban ${esperados.length} copias y hay ${fillers.length}`);

        fillers.forEach((copia, indice) => {
            const { name } = esperados[indice];
            const original = cards[indice];
            assert.ok(original, `falta la tarjeta original de ${name}`);

            const meta = getCardMeta(copia);
            assert.ok(meta, `la copia de ${name} no tiene bloque de texto (.strip-card__meta)`);

            const metaOriginal = getCardMeta(original);
            assert.ok(metaOriginal, `la tarjeta original de ${name} no tiene bloque de texto`);

            assert.equal(getCardName(meta), name, `la copia de ${name} no repite el nombre de su original`);
            assert.equal(
                getCardNotice(meta), getCardNotice(metaOriginal),
                `la copia de ${name} no repite el aviso de su original: si no, la fila quedaría descuadrada`
            );
            assert.equal(
                stripTags(meta).replace(/\s+/g, ' ').trim(),
                stripTags(metaOriginal).replace(/\s+/g, ' ').trim(),
                `la copia de ${name} no repite el contenido del bloque de su original`
            );
        });
    });

    test(`RF-13 · ninguna tarjeta de ${etiqueta}, ni original ni copia, lleva párrafo de descripción`, () => {
        const { cards, fillers } = franja();

        [...cards, ...fillers].forEach((card) => {
            const nombre = getCardName(card) || '(sin nombre)';
            assert.doesNotMatch(
                card, /<p[\s>]/,
                `${nombre} tiene un párrafo de descripción: la tarjeta solo lleva imagen, nombre y aviso`
            );
        });
    });
});

// ============================================
// 3xOSC CON BLOQUE DE TEXTO Y SIN ENLACE (RF-16)
// Es la única tarjeta que no es pulsable, y también la única cuyo bloque no lleva
// aviso. Con el Cambio 003 sigue llevando su nombre, que es lo único que tenía, y lo
// sigue llevando en un bloque para que se revele al pasar el puntero.
// ============================================
test('RF-16 · 3xOSC tiene bloque de texto con su nombre y sigue sin enlace, sin aviso y sin tabindex', () => {
    const indice = INSTRUMENTOS.findIndex((esperado) => esperado.name === SIN_PAGINA);
    assert.ok(indice > -1, `${SIN_PAGINA} no aparece en el anexo de la spec`);

    const cards = instrumentos().cards;
    const card = cards[indice];
    assert.ok(card, `falta la tarjeta de ${SIN_PAGINA}`);

    const meta = getCardMeta(card);
    assert.ok(meta, `${SIN_PAGINA} no tiene bloque de texto (.strip-card__meta)`);
    assert.equal(getCardName(meta), SIN_PAGINA, `el bloque de texto de ${SIN_PAGINA} no lleva su nombre`);
    assert.equal(getCardNotice(meta), null, `${SIN_PAGINA} no debería llevar aviso de enlace externo`);

    assert.doesNotMatch(card, /<a\b/, `${SIN_PAGINA} no debería ser un enlace: no tiene página oficial`);
    assert.equal(getHref(card), null, `${SIN_PAGINA} no debería tener href`);
    assert.doesNotMatch(card, /\stabindex=/, `${SIN_PAGINA} no debería ser alcanzable con el teclado`);

    // Su bloque va directamente en la <li>: no hay ningún enlace que lo envuelva
    assert.doesNotMatch(
        card, /<a\b[\s\S]*class="[^"]*\bstrip-card__meta\b/,
        `el bloque de texto de ${SIN_PAGINA} no debería quedar dentro de un enlace`
    );
});

// ============================================
// RF-27 · AVISO CORTO EN MÓVIL (HTML)
// Por debajo de 480 px el aviso visible es «se abre en una pestaña nueva» y el
// prefijo «Ver en image-line.com ·» se esconde solo visualmente. El texto completo
// tiene que seguir en el marcado, y contiguo, para que un lector de pantalla lea
// el aviso entero: nada de aria-hidden ni de texto partido con truco.
// ============================================
const PREFIJO_AVISO = 'Ver en image-line.com ·';
const AVISO_COMPLETO = `${PREFIJO_AVISO} se abre en una pestaña nueva`;

FRANJAS.forEach(({ etiqueta, esperados, franja }) => {
    test(`RF-27 · el aviso de cada tarjeta enlazada de ${etiqueta} lleva el prefijo en su propio elemento`, () => {
        esperados.forEach((esperado, indice) => {
            if (!esperado.url) return; // 3xOSC no tiene aviso (RF-16)

            [franja().cards[indice], franja().fillers[indice]].forEach((tarjeta) => {
                const nombre = getCardName(tarjeta);
                assert.equal(
                    getCardNotice(tarjeta), AVISO_COMPLETO,
                    `el aviso de ${nombre} debería leer "${AVISO_COMPLETO}" y lee "${getCardNotice(tarjeta)}"`
                );
                assert.equal(
                    getCardNoticePrefix(tarjeta), PREFIJO_AVISO,
                    `el prefijo del aviso de ${nombre} debería estar en su propio elemento con la clase .strip-card__notice-prefix`
                );
            });
        });
    });

    test(`RF-27 · el aviso completo de ${etiqueta} sigue en el marcado y sin aria-hidden`, () => {
        const avisos = [...franja().cards, ...franja().fillers]
            .filter((tarjeta) => getCardNotice(tarjeta) !== null);

        // Una tarjeta enlazada y su copia: las dos llevan aviso. Las que no enlazan
        // (3xOSC y su copia) no lo llevan, y el test de abajo lo comprueba.
        const enlazadas = esperados.filter((esperado) => esperado.url).length;
        assert.equal(
            avisos.length, enlazadas * 2,
            `debería haber aviso en las ${enlazadas} tarjetas enlazadas de ${etiqueta} y en sus copias, y hay ${avisos.length}`
        );

        avisos.forEach((tarjeta) => {
            const nombre = getCardName(tarjeta);
            const aviso = tarjeta.match(/<span\b[^>]*class="[^"]*\bstrip-card__notice\b[^"]*"[^>]*>[\s\S]*?<\/span>\s*<\/span>/);
            assert.ok(aviso, `no se encuentra el bloque del aviso de ${nombre}`);

            // El texto completo se lee igual que antes de partirlo: contiguo y sin cortes
            assert.equal(
                aviso[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
                AVISO_COMPLETO,
                `el aviso de ${nombre}, sin etiquetas, debería leerse entero y sin cortes`
            );
            assert.doesNotMatch(aviso[0], /aria-hidden/, `el aviso de ${nombre} no puede llevar aria-hidden: RF-14 lo quiere en el árbol accesible`);
            assert.doesNotMatch(aviso[0], /hidden/, `el aviso de ${nombre} no puede llevar el atributo hidden`);
        });
    });
});

test('RF-27 · solo 3xOSC y su copia se quedan sin aviso, y no les queda un prefijo suelto', () => {
    const todas = [...instrumentos().cards, ...instrumentos().fillers, ...efectos().cards, ...efectos().fillers];
    const sinAviso = todas.filter((tarjeta) => getCardNotice(tarjeta) === null);

    assert.deepEqual(
        sinAviso.map(getCardName), ['3xOSC', '3xOSC'],
        'solo 3xOSC y su copia deberían quedarse sin aviso'
    );
    sinAviso.forEach((tarjeta) => {
        assert.equal(
            getCardNoticePrefix(tarjeta), null,
            'una tarjeta sin aviso no debería dejar el prefijo del aviso por ahí'
        );
    });
});

// ============================================
// CONTENIDO ANTIGUO DE LA SECCIÓN (Spec 001)
// ============================================
test('RF-12 · ha desaparecido el contenido antiguo de Flex', () => {
    assert.ok(!html.includes('¿Qué es <span class="accent">Flex</span>?'), 'sigue el título "¿Qué es Flex?"');
    assert.ok(!html.includes('Más de 500 presets profesionales'), 'sigue el checklist de Flex');
    assert.ok(!html.includes('Potencia y Versatilidad'), 'sigue el subtítulo "Potencia y Versatilidad"');
});

test('RF-6 · los nombres de las tarjetas usan la grafía oficial, no la forma corta', () => {
    assert.ok(!/>Toxic Bio</.test(html), 'queda el nombre corto "Toxic Bio"');
    assert.ok(!section.includes('synth-card'), 'sigue la rejilla antigua de tres tarjetas (.synths-grid)');
});