// ============================================
// TESTS: COHERENCIA DE SECCIONES E IDIOMA (Spec 001 · RF-11, RF-12 · Spec 002 · RF-6, RF-12, RF-N5)
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const { readProjectFile, getSection, stripTags } = require('./helpers');

const html = readProjectFile('index.html');

const SECTION_IDS = ['hero', 'sintetizadores', 'features', 'gallery', 'download'];

// Nombres propios que sí van en inglés (definido en la spec)
// Los instrumentos (RF-6) y los efectos (RF-7) son denominaciones oficiales de Image-Line
const NOMES_PROPIOS = [
    'FL Studio', 'FL Cloud', 'Flex', 'Sytrus', 'Toxic Biohazard',
    'Piano Roll', 'Playlist', 'Mixer', 'Plugins', 'VST3', 'DAW',
    'image-line.com',
    // Instrumentos de RF-6
    '3xOSC', 'Harmor', 'Harmless', 'Sakura', 'Morphine', 'Ogun',
    'Poizone', 'Sawer', 'NewTone', 'Transistor Bass', 'DirectWave',
    // Efectos de RF-7
    'Gross Beat', 'Hardcore', 'Hyper Chorus', 'Luxeverb', 'Pitch Shifter',
    'Pitcher', 'Spreader', 'Transient Processor', 'Vintage Chorus',
    'Vintage Phaser', 'Low Lifter', 'Transporter', 'Emphasis'
];

// Encabezado de una sección: su título (h1/h2) y su primer párrafo
function getSectionHeaderText(id) {
    const section = getSection(html, id);
    assert.ok(section, `falta la sección ${id}`);

    const heading = section.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/);
    const paragraph = section.match(/<p[^>]*>([\s\S]*?)<\/p>/);

    return [heading && stripTags(heading[1]), paragraph && stripTags(paragraph[1])]
        .filter(Boolean)
        .join(' ');
}

// Texto visible de toda la landing sin los nombres propios permitidos
function getVisibleText() {
    const sinEstilos = html.replace(/<style[\s\S]*?<\/style>/g, ' ');
    return NOMES_PROPIOS.reduce((texto, nombre) => texto.split(nombre).join(' '), stripTags(sinEstilos));
}

test('RF-12 · cada sección menciona FL Studio en su título o subtítulo', () => {
    SECTION_IDS.forEach((id) => {
        assert.match(getSectionHeaderText(id), /FL\s*Studio/i, `la sección ${id} no lo menciona`);
    });
});

test('RF-12 · las tarjetas de sintetizadores solo están en su sección', () => {
    SECTION_IDS.filter((id) => id !== 'sintetizadores').forEach((id) => {
        const section = getSection(html, id);
        assert.ok(!section.includes('synth-card'), `la sección ${id} tiene tarjetas de sintetizadores`);
    });
});

test('RF-12 · Toxic Bio y Sytrus solo se nombran en la sección de Sintetizadores', () => {
    SECTION_IDS.filter((id) => id !== 'sintetizadores').forEach((id) => {
        const texto = stripTags(getSection(html, id));
        ['Toxic', 'Sytrus'].forEach((nombre) => {
            assert.doesNotMatch(texto, new RegExp(nombre, 'i'), `${nombre} aparece en la sección ${id}`);
        });
    });
});

test('RF-11 · no quedan textos en inglés fuera de los nombres propios', () => {
    const texto = getVisibleText();
    ['preset', 'pads', 'lead', 'waveform', 'synth', 'click'].forEach((palabra) => {
        assert.doesNotMatch(texto, new RegExp(`\\b${palabra}`, 'i'), `queda "${palabra}" en un texto visible`);
    });
});

test('RF-6 · el instrumento se llama "Toxic Biohazard" y no "Toxic Bio"', () => {
    const visible = stripTags(html.replace(/<style[\s\S]*?<\/style>/g, ' '));
    assert.doesNotMatch(visible, /Toxic Bio(?!hazard)/, 'aparece "Toxic Bio" sin "hazard"');
});

test('RF-12 · la sección de Sintetizadores sigue mencionando FL Studio', () => {
    assert.match(getSectionHeaderText('sintetizadores'), /FL\s*Studio/i, 'la sección de Sintetizadores no lo menciona');
});