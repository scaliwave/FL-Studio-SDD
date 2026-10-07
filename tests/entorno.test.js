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
// LECTURA INDEPENDIENTE DEL FIN DE LINEA
// Con core.autocrlf en Windows el checkout entrega CRLF y los tests que
// parten por '\n' o casan un encabezado contra un '\n' pelado fallarían
// solo en esa máquina, así que readProjectFile normaliza a LF al leer
// ============================================
test('entorno · readProjectFile devuelve el fichero con LF y sin CR', () => {
    ['index.html', 'css/styles.css', 'js/main.js',
        'specs/002-rutas-sitio-oficial/spec.md', 'specs/003-galeria-hero-vertical/spec.md']
        .forEach((fichero) => {
            const contenido = readProjectFile(fichero);
            assert.ok(
                !contenido.includes('\r'),
                `${fichero} llega con CR: el lector no está normalizando el final de línea`
            );
        });
});

test('entorno · el lector normaliza de verdad un fichero que tenga CRLF', () => {
    // Se comprueba sobre el resultado de leer, no sobre un fichero inventado:
    // si el checkout es LF, esta comprobación no puede observar nada, y si es
    // CRLF es justo lo que tiene que quedar neutralizado
    const crudo = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    const tieneCr = crudo.includes('\r');

    assert.equal(readProjectFile('index.html').includes('\r'), false, 'la lectura no quita el CR');
    assert.equal(readProjectFile('index.html').replace(/\r\n/g, '\n'), crudo.replace(/\r\n/g, '\n'),
        'normalizar solo debe tocar el final de línea, no el contenido');
    // Se registra cómo está el fichero en esta máquina, para que quede claro si
    // la normalización se está poniendo a prueba o no
    console.log(`      (index.html en disco: ${tieneCr ? 'CRLF' : 'LF'})`);
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