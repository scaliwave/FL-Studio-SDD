// ============================================
// TESTS: ENTORNO Y CONTENIDO FIJO (Spec 001 · RF-N1, RF-N3, RF-13 · Spec 002 · RF-20)
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PROJECT_ROOT, readProjectFile, getFunctionSource } = require('./helpers');

const js = readProjectFile('js/main.js');

test('RF-N1 · el proyecto no tiene dependencias instaladas', () => {
    assert.ok(!fs.existsSync(path.join(PROJECT_ROOT, 'package.json')), 'existe package.json');
    assert.ok(!fs.existsSync(path.join(PROJECT_ROOT, 'node_modules')), 'existe node_modules');
});

test('RF-N3 · el JS no genera el contenido de la interfaz', () => {
    ['innerHTML', 'insertAdjacentHTML', 'document.write', 'outerHTML'].forEach((api) => {
        assert.ok(!js.includes(api), `el JS usa ${api} para pintar contenido`);
    });
});

test('RF-20 · las tarjetas de las franjas no se animan al hacer scroll', () => {
    const source = getFunctionSource(js, 'initScrollAnimations');
    assert.ok(source, 'no se encontró la función initScrollAnimations');

    ['.synth-card', '.strip-card', '.strip-track'].forEach((selector) => {
        assert.ok(!source.includes(selector), `${selector} no debe estar entre los elementos animados: su fila ya se desplaza sola`);
    });
    assert.ok(
        source.includes('.feature-card') && source.includes('.gallery-item'),
        'las animaciones al scroll deben seguir observando las tarjetas de Características y de la Galería'
    );
});

test('RF-13 · el menú y el scroll suave siguen inicializándose', () => {
    ['initMobileMenu', 'initSmoothScroll', 'initScrollAnimations'].forEach((funcion) => {
        assert.ok(js.includes(funcion), `falta ${funcion}`);
    });
});

// ============================================
// HERO SIN PARALLAX (Spec 003 · RF-14)
// La galería del hero es su único movimiento, así que el JavaScript no se
// mueve ni se declara nada nuevo para el hero
// ============================================
test('RF-14 · el hero no tiene ningún manejador de scroll: el parallax desapareció', () => {
    const scrolls = js.match(/window\.addEventListener\(\s*'scroll'/g) || [];
    assert.equal(scrolls.length, 1, `debería quedar un solo manejador de scroll, el de la navbar, y hay ${scrolls.length}`);

    const navbar = getFunctionSource(js, 'initNavbarScroll');
    assert.ok(navbar, 'no se encontró la función initNavbarScroll');
    assert.ok(navbar.includes("addEventListener('scroll'"), 'el único manejador de scroll debe ser el de la navbar');
});

test('RF-14 · el JavaScript ya no menciona los orbes ni el contenido del hero', () => {
    ['glow-orb', 'glowOrb', 'hero-content'].forEach((referencia) => {
        assert.ok(!js.includes(referencia), `el JS ya no debe mencionar ${referencia}: el parallax se fue y con él sus referencias`);
    });
});

test('RF-14 · el JavaScript no gana funciones nuevas', () => {
    const declaradas = (js.match(/^function\s+(\w+)/gm) || []).map((linea) => linea.replace(/^function\s+/, ''));
    assert.deepEqual(
        declaradas,
        ['initMobileMenu', 'initScrollAnimations', 'initNavbarScroll', 'initSmoothScroll',
            'initGalleryHover', 'typeWriter', 'animateCounter'],
        `las funciones declaradas han cambiado y el movimiento del hero es CSS: ${declaradas.join(', ')}`
    );
});