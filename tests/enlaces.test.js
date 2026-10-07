// ============================================
// TESTS: ENLACES INTERNOS (Spec 001 · RF-2) Y PIE OFICIAL (Spec 002 · RF-1…RF-5)
// Toda la lógica vive en funciones puras de ./helpers.js o de este fichero
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const { readProjectFile, getBrokenLinks, getHref, getAttr, getHeadingText, getImageSources, stripTags } = require('./helpers');

const html = readProjectFile('index.html');
const spec = readProjectFile('specs/002-rutas-sitio-oficial/spec.md');

// Los siete destinos verificados de RF-2, leídos de la spec para no repetirlos a mano
const RUTAS = [...(spec.split('\n').find((linea) => linea.startsWith('- RF-2:')) || '')
    .matchAll(/([^:;→]+?)\s*→\s*`(https?:\/\/[^`]+)`/g)]
    .map((match) => ({ texto: match[1].trim(), url: match[2] }));

// ============================================
// FUNCIONES PURAS DEL PIE
// ============================================

// Los bloques del pie en orden de lectura (marca, Enlaces, Sitio oficial, Síguenos)
function getFooterBlocks(document) {
    const apertura = '<div class="footer-content">';
    const inicio = document.indexOf(apertura);
    if (inicio === -1) return [];

    const bloques = [];
    let cursor = inicio + apertura.length;
    let nivel = 1;
    let desde = null;

    while (nivel > 0) {
        const abre = document.indexOf('<div', cursor);
        const cierra = document.indexOf('</div>', cursor);
        if (cierra === -1) break;

        if (abre !== -1 && abre < cierra) {
            if (nivel === 1) desde = abre;
            nivel++;
            cursor = abre + 5;
        } else {
            nivel--;
            if (nivel === 1 && desde !== null) {
                bloques.push(document.slice(desde, cierra + '</div>'.length).trim());
                desde = null;
            }
            cursor = cierra + '</div>'.length;
        }
    }
    return bloques;
}

// Los enlaces del bloque "Sitio oficial" del pie
function getOfficialLinks(document) {
    const bloque = getFooterBlocks(document).find((otro) => getHeadingText(otro, 'h4') === 'Sitio oficial');
    if (!bloque) return [];

    return [...bloque.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((enlace) => ({
        texto: stripTags(enlace[0]),
        href: getHref(enlace[0]),
        target: getAttr(enlace[0], 'target'),
        rel: getAttr(enlace[0], 'rel'),
        tieneIcono: /<svg\b[^>]*aria-hidden="true"/.test(enlace[0])
    }));
}

test('RF-2 · todo enlace interno apunta a una sección existente', () => {
    assert.deepEqual(getBrokenLinks(html), []);
});

test('RF-2 · no quedan enlaces a la antigua sección de Flex', () => {
    assert.ok(!html.includes('href="#flex"'), 'queda algún href="#flex"');
});

test('RF-2 · el logo del menú y el del pie enlazan al inicio', () => {
    const logos = html.match(/<a [^>]*class="logo"[^>]*>/g) || [];
    assert.equal(logos.length, 2, 'se esperaban 2 logos (menú y pie)');
    logos.forEach((logo) => {
        assert.equal(getHref(logo), '#hero', `logo con destino inesperado: ${logo}`);
    });
});

test('RF-2 · el menú ofrece un enlace a Sintetizadores', () => {
    const nav = html.match(/<ul class="nav-links"[^>]*>[\s\S]*?<\/ul>/);
    assert.ok(nav, 'no se encontró la lista de enlaces del menú');
    assert.ok(
        /href="#sintetizadores"[^>]*>\s*Sintetizadores/.test(nav[0]),
        'el menú no enlaza a #sintetizadores'
    );
});

test('RF-2 · el pie enlaza a Sintetizadores y no a Flex', () => {
    const footer = html.match(/<footer[\s\S]*?<\/footer>/);
    assert.ok(footer, 'no se encontró el pie de página');
    assert.ok(footer[0].includes('href="#sintetizadores"'), 'el pie no enlaza a #sintetizadores');
    assert.ok(!/<a[^>]*>\s*Flex\s*<\/a>/.test(footer[0]), 'el pie sigue enlazando a Flex');
});

test('RF-2 · los enlaces sin destino son marcadores de posición permitidos', () => {
    const emptyLinks = html.match(/<a [^>]*href="#"[^>]*>/g) || [];
    emptyLinks.forEach((link) => {
        const allowed = link.includes('class="social-icon"') || link.includes('class="btn');
        assert.ok(allowed, `enlace sin destino no permitido: ${link}`);
    });
});

test('RF-16 · ambos logos muestran la imagen oficial de Image-Line', () => {
    const logos = html.match(/<a [^>]*class="logo"[\s\S]*?<\/a>/g) || [];
    assert.equal(logos.length, 2, 'se esperaban 2 logos (menú y pie)');

    logos.forEach((logo) => {
        const images = getImageSources(logo);
        assert.equal(images.length, 1, 'el logo debe contener una imagen');
        assert.match(images[0].src, /image-line\.com/, `logo no oficial: ${images[0].src}`);
        assert.ok(images[0].alt && images[0].alt.trim().length > 0, 'el logo necesita texto alternativo');
        assert.equal(getHref(logo), '#hero', 'el logo debe seguir enlazando al inicio');
    });
});

// ============================================
// BLOQUE "SITIO OFICIAL" DEL PIE (Spec 002)
// ============================================
test('RF-1 · el pie tiene un bloque "Sitio oficial" con exactamente siete enlaces', () => {
    const enlaces = getOfficialLinks(html);
    assert.equal(enlaces.length, 7, `se esperaban 7 enlaces en "Sitio oficial" y hay ${enlaces.length}`);
});

test('RF-1 · el bloque "Sitio oficial" va entre "Enlaces" y "Síguenos"', () => {
    const titulos = getFooterBlocks(html).map((bloque) => getHeadingText(bloque, 'h4'));
    const indiceEnlaces = titulos.indexOf('Enlaces');
    const indiceOficial = titulos.indexOf('Sitio oficial');
    const indiceSeguimos = titulos.indexOf('Síguenos');

    assert.ok(indiceOficial > -1, `no hay ningún bloque "Sitio oficial": el pie tiene ${titulos.join(' | ') || 'nada'}`);
    assert.ok(indiceEnlaces > -1, 'falta el bloque "Enlaces" del pie');
    assert.ok(indiceSeguimos > -1, 'falta el bloque "Síguenos" del pie');
    assert.ok(
        indiceEnlaces < indiceOficial && indiceOficial < indiceSeguimos,
        `"Sitio oficial" debe ir entre "Enlaces" y "Síguenos", y el orden es ${titulos.join(' | ')}`
    );
});

test('RF-2 · cada enlace del bloque apunta a su ruta oficial verificada', () => {
    const enlaces = getOfficialLinks(html);
    assert.equal(RUTAS.length, 7, `la spec debe listar 7 rutas y lista ${RUTAS.length}`);
    assert.deepEqual(enlaces.map((enlace) => enlace.href), RUTAS.map((ruta) => ruta.url));

    enlaces.forEach((enlace, indice) => {
        assert.ok(
            enlace.texto.includes(RUTAS[indice].texto),
            `el enlace ${indice + 1} dice "${enlace.texto}" y debería ser "${RUTAS[indice].texto}"`
        );
    });
});

test('RF-3 · cada enlace se abre en una pestaña nueva, con aislamiento y su icono', () => {
    const enlaces = getOfficialLinks(html);
    assert.equal(enlaces.length, 7, `se esperaban 7 enlaces en "Sitio oficial" y hay ${enlaces.length}`);

    enlaces.forEach((enlace) => {
        assert.equal(enlace.target, '_blank', `${enlace.texto} no se abre en una pestaña nueva`);
        assert.match(enlace.rel || '', /noopener/, `${enlace.texto} no lleva rel con noopener`);
        assert.ok(enlace.tieneIcono, `${enlace.texto} no lleva su icono de enlace externo (svg con aria-hidden="true")`);
    });
});

test('RF-4 · ninguna ruta del bloque apunta al buscador de tickets', () => {
    getOfficialLinks(html).forEach((enlace) => {
        assert.doesNotMatch(
            enlace.href || '', /support\.image-line\.com/,
            `${enlace.texto} apunta a support.image-line.com, que redirige al buscador de tickets con sesión iniciada`
        );
    });
});

test('RF-5 · el bloque "Enlaces" conserva sus cuatro enlaces internos', () => {
    const bloque = getFooterBlocks(html).find((otro) => getHeadingText(otro, 'h4') === 'Enlaces');
    assert.ok(bloque, 'no se encuentra el bloque "Enlaces" del pie');

    const destinos = [...bloque.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)].map((match) => match[1]);
    assert.deepEqual(destinos, ['#hero', '#sintetizadores', '#features', '#gallery']);
});
