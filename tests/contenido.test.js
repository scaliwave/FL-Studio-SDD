// ============================================
// TESTS: CONTENIDO DE LA LANDING (Spec 001 · RF-1, RF-8)
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const { readProjectFile, getSection, getHeadingText, getHref, stripTags, getGalleryBlocks } = require('./helpers');

const html = readProjectFile('index.html');

// ============================================
// RF-1 · HERO
// ============================================
test('RF-1 · el título del hero menciona FL Studio y no menciona Flex', () => {
    const hero = getSection(html, 'hero');
    assert.ok(hero, 'falta la sección del hero');

    const title = getHeadingText(hero, 'h1');
    assert.match(title, /FL\s*Studio/i, `el título dice "${title}"`);
    assert.doesNotMatch(title, /flex/i, `el título sigue hablando de Flex: "${title}"`);
});

test('RF-1 · el subtítulo del hero menciona FL Studio y no menciona Flex', () => {
    const hero = getSection(html, 'hero');
    const subtitle = getHeadingText(hero, 'p');

    assert.match(subtitle, /FL\s*Studio/i, `el subtítulo dice "${subtitle}"`);
    assert.doesNotMatch(subtitle, /flex/i, `el subtítulo sigue hablando de Flex: "${subtitle}"`);
});

// ============================================
// RF-1 · HERO: LA GALERÍA NO APORTA TEXTO (Spec 003)
// La galería va antes del contenido del hero, así que cualquier párrafo,
// encabezado o enlace que metiera se colaría delante del subtítulo real y
// los dos tests de arriba empezarían a leer la copia equivocada
// ============================================
test('RF-1 · la galería del hero no mete texto antes del subtítulo', () => {
    const hero = getSection(html, 'hero');
    const subtitulo = hero.match(/<p[^>]*class="hero-subtitle"[^>]*>/);
    assert.ok(subtitulo, 'falta el subtítulo del hero');

    const antesDelSubtitulo = hero.slice(0, subtitulo.index);
    assert.doesNotMatch(antesDelSubtitulo, /<p[\s>]/, 'hay un párrafo antes del subtítulo del hero');
    assert.doesNotMatch(antesDelSubtitulo, /<a[\s>]/, 'hay un enlace antes del subtítulo del hero');

    // El único encabezado que puede precederlo es el propio título del hero
    const encabezados = antesDelSubtitulo.match(/<h[1-6][\s>]/g) || [];
    assert.equal(encabezados.length, 1, `debería haber un solo encabezado antes del subtítulo y hay ${encabezados.length}`);
    assert.match(stripTags(getHeadingText(hero, 'h1')), /FL\s*Studio/i);

    // Y el primer párrafo del hero sigue siendo el subtítulo de verdad
    assert.match(getHeadingText(hero, 'p'), /FL\s*Studio/i);
});

test('RF-1 · la galería del hero es adorno: ni una palabra visible en sus 66 imágenes', () => {
    const galeria = getGalleryBlocks(html)[0];
    assert.ok(galeria, 'no hay galería en el hero');

    assert.equal(stripTags(galeria), '', 'la galería del hero no debe tener texto visible');
    assert.doesNotMatch(galeria, /alt="[^"]+"/, 'las imágenes de la galería son decorativas: su alt va vacío');
});

// ============================================
// RF-8 · DESCARGA
// ============================================
test('RF-8 · los dos botones de descarga dicen que se descarga FL Studio', () => {
    const download = getSection(html, 'download');
    assert.ok(download, 'falta la sección de descarga');

    const buttons = download.match(/<a [^>]*class="btn[^"]*"[\s\S]*?<\/a>/g) || [];
    assert.equal(buttons.length, 2, `se esperaban 2 botones y hay ${buttons.length}`);

    buttons.forEach((button) => {
        assert.match(stripTags(button), /FL\s*Studio/i, `el botón dice "${stripTags(button)}"`);
    });
});

test('RF-8 · la nota de la descarga solo menciona Flex como incluido en FL Studio', () => {
    const download = getSection(html, 'download');
    const note = download.match(/<p class="download-note">([\s\S]*?)<\/p>/);
    assert.ok(note, 'falta la nota de la sección de descarga');

    const texto = stripTags(note[1]);
    assert.match(texto, /flex/i, 'la nota ya no menciona Flex');
    assert.match(texto, /incluido[\s\S]*FL\s*Studio/i, `la nota debe decir que va incluido en FL Studio: "${texto}"`);
});

// ============================================
// RF-17 · DESCARGA (enlace real a la página oficial)
// ============================================
const PAGINA_DESCARGA = 'https://www.image-line.com/fl-studio/download';

test('RF-17 · los dos botones abren la página oficial de descarga en pestaña nueva', () => {
    const download = getSection(html, 'download');
    const buttons = download.match(/<a [^>]*class="btn[^"]*"[\s\S]*?<\/a>/g) || [];
    assert.equal(buttons.length, 2, `se esperaban 2 botones y hay ${buttons.length}`);

    buttons.forEach((button) => {
        assert.ok(
            button.includes(`href="${PAGINA_DESCARGA}"`),
            `el botón no apunta a la página oficial: ${getHref(button)}`
        );
        assert.ok(button.includes('target="_blank"'), 'el botón debe abrir en pestaña nueva');
        assert.ok(button.includes('rel="'), 'el botón debe llevar rel');
    });
});

test('RF-17 · ningún botón lanza la descarga del instalador directamente', () => {
    const download = getSection(html, 'download');
    assert.ok(!/flstudio_(win|mac)_installer/.test(download), 'un botón apunta al instalador de ~1 GB');
    assert.ok(!/\.exe|\.dmg/.test(download), 'un botón apunta a un fichero de instalador');
});

// ============================================
// RF-6 · CARACTERÍSTICAS (funciones de FL Studio)
// ============================================
const EXPECTED_FEATURES = ['Piano Roll', 'Playlist', 'Mixer', 'Plugins', 'Grabación', 'Comunidad'];

function getFeatureTitles() {
    const features = getSection(html, 'features');
    assert.ok(features, 'falta la sección de características');
    return (features.match(/<h3[^>]*>[\s\S]*?<\/h3>/g) || []).map((titulo) => stripTags(titulo));
}

test('RF-6 · Características muestra exactamente seis tarjetas', () => {
    assert.equal(getFeatureTitles().length, 6);
});

test('RF-6 · las seis tarjetas son las funciones de FL Studio acordadas', () => {
    assert.deepEqual(getFeatureTitles(), EXPECTED_FEATURES);
});

test('RF-6 · ninguna tarjeta describe sintetizadores', () => {
    const texto = stripTags(getSection(html, 'features'));
    ['Flex', 'Toxic', 'Sytrus', 'sintetizador', 'preset'].forEach((palabra) => {
        assert.doesNotMatch(texto, new RegExp(palabra, 'i'), `Características sigue hablando de "${palabra}"`);
    });
});

test('RF-12 · el subtítulo de Características menciona FL Studio', () => {
    const features = getSection(html, 'features');
    assert.match(stripTags(features), /FL\s*Studio/i);
});

// ============================================
// RF-7 · GALERÍA (interfaz de FL Studio)
// ============================================
const EXPECTED_GALLERY = ['Playlist', 'Mixer', 'Piano Roll', 'Navegador'];

test('RF-7 · la Galería muestra exactamente cuatro elementos', () => {
    const gallery = getSection(html, 'gallery');
    assert.equal((gallery.match(/<div class="gallery-item">/g) || []).length, 4);
});

test('RF-7 · cada elemento lleva una etiqueta visible con una parte de la interfaz', () => {
    const gallery = getSection(html, 'gallery');
    const labels = (gallery.match(/<span>([^<]+)<\/span>/g) || []).map((label) => stripTags(label));
    assert.deepEqual(labels, EXPECTED_GALLERY);
});

test('RF-7 · ningún elemento de la Galería presenta Flex ni sintetizadores', () => {
    const texto = stripTags(getSection(html, 'gallery'));
    assert.doesNotMatch(texto, /flex/i, 'la Galería sigue hablando de Flex');
    assert.doesNotMatch(texto, /sintetizador/i, 'la Galería sigue hablando de sintetizadores');
});

test('RF-12 · la Galería menciona FL Studio en su título o subtítulo', () => {
    assert.match(stripTags(getSection(html, 'gallery')), /FL\s*Studio/i);
});