// ============================================
// HELPERS DE TEST
// Lectura de ficheros + funciones puras para analizar el HTML y el CSS
// ============================================
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.join(__dirname, '..');

// --- ÚNICA parte con E/S: leer un fichero del proyecto ---
// Normaliza CRLF a LF al leer: con core.autocrlf el checkout de Windows
// entrega los ficheros con \r\n, y los tests que parten por '\n' (o casan
// un encabezado contra un \n pelado) fallarian solo en esa maquina.
function readProjectFile(name) {
    return fs.readFileSync(path.join(PROJECT_ROOT, name), 'utf8').replace(/\r\n/g, '\n');
}

// ============================================
// FUNCIONES PURAS (sin acceso a ficheros ni al DOM)
// ============================================

// Quita etiquetas HTML y colapsa espacios
function stripTags(text) {
    return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Todos los id="..." de la página
function getIds(html) {
    return [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
}

// Todos los href="#..." (anclas internas); "" significa enlace sin destino
function getInternalHrefs(html) {
    return [...html.matchAll(/href="#([^"]*)"/g)].map((match) => match[1]);
}

// Anclas internas que no corresponden a ningún id de la página
function getBrokenLinks(html) {
    const ids = new Set(getIds(html));
    return [...new Set(getInternalHrefs(html))].filter((anchor) => anchor !== '' && !ids.has(anchor));
}

// Cuenta cuántas veces aparece un patrón
function countMatches(text, regex) {
    return (text.match(regex) || []).length;
}

// href de una etiqueta con atributos
function getHref(tag) {
    const match = tag.match(/href="([^"]*)"/);
    return match ? match[1] : null;
}

// Bloque completo de un <section id="...">...</section>
function getSection(html, id) {
    const match = html.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`));
    return match ? match[0] : null;
}

// Bloque que empieza por un elemento y acaba en su etiqueta de cierre
function getBlock(html, openPattern) {
    const match = html.match(openPattern);
    return match ? match[0] : null;
}

// true si el elemento está marcado como decorativo para lectores de pantalla
function isDecorative(tag) {
    const open = tag.match(/^<[a-zA-Z][^>]*>/);
    return Boolean(open && getAttr(open[0], 'aria-hidden') === 'true');
}

// Bloques <div class="strip-scroll">…</div> de las franjas (busca el cierre contando divs)
function getStripBlocks(html) {
    const bloques = [];
    const apertura = /<div\b[^>]*class="[^"]*\bstrip-scroll\b[^"]*"[^>]*>/g;
    let match;

    while ((match = apertura.exec(html)) !== null) {
        let depth = 0;
        for (let i = match.index; i < html.length; i++) {
            if (html.startsWith('<div', i)) depth++;
            if (html.startsWith('</div>', i)) {
                depth--;
                if (depth === 0) {
                    bloques.push(html.slice(match.index, i + 6));
                    break;
                }
            }
        }
    }
    return bloques;
}

// ============================================
// GALERÍA DEL HERO (Spec 003)
// ============================================

// Todos los <div class="… clase …">…</div> de un bloque, cada uno con su cierre real (contando divs)
function getDivsByClass(html, clase) {
    const bloques = [];
    const apertura = new RegExp(`<div\\b[^>]*class="[^"]*\\b${clase}\\b[^"]*"[^>]*>`, 'g');
    let match;

    while ((match = apertura.exec(html)) !== null) {
        let depth = 1;

        for (let i = match.index + match[0].length; i < html.length; i++) {
            if (html.startsWith('<div', i)) depth++;
            if (html.startsWith('</div>', i)) {
                depth--;
                if (depth === 0) {
                    bloques.push(html.slice(match.index, i + '</div>'.length));
                    break;
                }
            }
        }
    }
    return bloques;
}

// Bloque de decoración del hero: <div class="hero-bg">…</div>
function getHeroGallery(html) {
    return getDivsByClass(html, 'hero-bg')[0] || null;
}

// Hijos directos de un bloque <div>, en orden de lectura
function getDirectDivs(bloque) {
    const hijos = [];
    let cursor = bloque.indexOf('>') + 1;
    let nivel = 1;
    let desde = null;

    while (nivel > 0) {
        const abre = bloque.indexOf('<div', cursor);
        const cierra = bloque.indexOf('</div>', cursor);
        if (cierra === -1) break;

        if (abre !== -1 && abre < cierra) {
            if (nivel === 1) desde = abre;
            nivel++;
            cursor = abre + '<div'.length;
        } else {
            nivel--;
            if (nivel === 1 && desde !== null) {
                hijos.push(bloque.slice(desde, cierra + '</div>'.length));
                desde = null;
            }
            cursor = cierra + '</div>'.length;
        }
    }
    return hijos;
}

// Las dos capas de la galería del hero dentro de .hero-bg: la galería y el degradado, en ese orden
function getGalleryBlocks(html) {
    const bloque = getHeroGallery(html);
    if (!bloque) return [];

    return getDirectDivs(bloque)
        .filter((hijo) => getAttr(hijo.match(/^<div[^>]*>/)[0], 'class').includes('hero-gallery'));
}

// Las cuatro <div class="hero-gallery__column…"> del hero, en orden de lectura
function getGalleryColumns(html) {
    const galeria = getGalleryBlocks(html)[0];
    return galeria ? getDivsByClass(galeria, 'hero-gallery__column') : [];
}

// Tarjetas <div class="hero-gallery__item…">…</div> de una columna.
// decorativas: true = solo las copias de relleno, false = solo las originales
function getGalleryCards(columnHtml, { decorativas = false } = {}) {
    const tarjetas = columnHtml.match(/<div\b[^>]*class="[^"]*\bhero-gallery__item\b[^"]*"[^>]*>[\s\S]*?<\/div>/g) || [];
    return decorativas ? tarjetas.filter(isDecorative) : tarjetas.filter((card) => !isDecorative(card));
}

// Imagen de una tarjeta de galería con su texto alternativo, o null si no tiene
function getGalleryImage(card) {
    const match = card.match(/<img\b[^>]*>/);
    return match ? { src: getAttr(match[0], 'src'), alt: getAttr(match[0], 'alt') } : null;
}

// Capa de degradado del hero, o null si no está
function getScrim(html) {
    return html.match(/<div\b[^>]*class="[^"]*\bhero-gallery__scrim\b[^"]*"[^>]*>[\s\S]*?<\/div>/);
}

// ============================================
// LECTURA DEL CSS (funciones puras, compartidas por los tests)
// ============================================

// Cada regla con sus selectores ya separados y sus declaraciones, ignorando los comentarios
function reglasDe(texto) {
    const sinComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, ' ');
    return [...sinComentarios.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selectores, declaraciones]) => ({
        selectores: selectores.split(',').map((selector) => selector.trim()),
        declaraciones
    }));
}

// Declaraciones de la regla cuyo selector es exactamente el dado
function reglaDe(texto, selector) {
    const regla = reglasDe(texto).find((encontrada) => encontrada.selectores.includes(selector));
    return regla ? regla.declaraciones : null;
}

// Nombre y duración de una animación, en forma corta (animation:) o larga (animation-name / animation-duration)
function leerAnimacion(declaraciones) {
    const corta = declaraciones.match(/animation\s*:\s*([^;]+)/);
    if (corta) {
        const partes = corta[1].trim().split(/\s+/);
        return {
            nombre: partes[0],
            duracion: partes.find((parte) => /^[\d.]+m?s$/.test(parte) || /^var\(/.test(parte)) || null
        };
    }

    const nombre = declaraciones.match(/animation-name\s*:\s*([^;]+)/);
    if (!nombre) return null;

    const duracion = declaraciones.match(/animation-duration\s*:\s*([^;]+)/);
    return { nombre: nombre[1].trim(), duracion: duracion ? duracion[1].trim() : null };
}

// Bloque completo de un @keyframes (busca el cierre contando llaves)
function getKeyframes(css, nombre) {
    const inicio = css.match(new RegExp(`@keyframes\\s+${nombre}\\s*\\{`));
    if (!inicio) return null;

    const desde = inicio.index + inicio[0].length;
    let depth = 1;

    for (let i = desde; i < css.length; i++) {
        if (css[i] === '{') depth++;
        if (css[i] === '}') {
            depth--;
            if (depth === 0) return css.slice(desde, i);
        }
    }
    return null;
}

// De dónde a dónde mueve una animación, en % (eje X para las franjas, Y para la galería del hero)
function recorridoDe(nombre, css, eje = 'X') {
    const bloque = getKeyframes(css, nombre);
    if (!bloque) return null;

    // El punto de partida puede venir sin unidad (translateX(0)) y el final en porcentaje
    const valores = [...bloque.matchAll(new RegExp(`translate${eje}\\(\\s*(-?[\\d.]+)%?`, 'g'))]
        .map((match) => Number(match[1]));
    return valores.length > 1 ? { inicio: valores[0], fin: valores[valores.length - 1] } : null;
}

// Segundos de una duración, resolviendo var(--x) con lo declarado en el CSS
function segundosDe(duracion, css) {
    const variable = duracion && duracion.match(/var\(\s*--([\w-]+)/);
    const valor = variable ? (css.match(new RegExp(`--${variable[1]}\\s*:\\s*([^;]+)`)) || [])[1] : duracion;
    const segundos = valor && valor.match(/([\d.]+)s/);
    return segundos ? Number(segundos[1]) : null;
}

// Especificidad de un selector como par [ids + clases + pseudoclases, elementos]
function especificidad(selector) {
    const ids = (selector.match(/#[^\s>+~]+/g) || []).length;
    const clases = (selector.replace(/#[^\s>+~]+/g, ' ').match(/\.[\w-]+|\[[^\]]+\]|::?[\w-]+/g) || []).length;
    const elementos = (selector.replace(/#[^\s>+~]+/g, '').replace(/[\w-]+/g, ' ').match(/[a-zA-Z][\w-]*/g) || []).length;
    return [ids + clases, elementos];
}

// true si el selector `anulador` iguala o supera en especificidad a `objetivo`
function anula(anulador, objetivo) {
    const [a, b] = especificidad(anulador);
    const [c, d] = especificidad(objetivo);
    return a > c || (a === c && b >= d);
}

// Tarjetas <li class="strip-card">…</li> de una franja.
// decorativas: true = solo las copias de relleno, false = solo las originales
function getStripCards(stripHtml, { decorativas = false } = {}) {
    const tarjetas = stripHtml.match(/<li\b[^>]*class="[^"]*\bstrip-card\b[^"]*"[^>]*>[\s\S]*?<\/li>/g) || [];
    return decorativas ? tarjetas.filter(isDecorative) : tarjetas.filter((card) => !isDecorative(card));
}

// Contenido del primer <span> cuya lista de clases incluye la dada, contando las
// etiquetas <span> anidadas para no cortarse en el cierre de un hijo, o null si no
// hay ninguno. La clase se compara como una clase entera, no como un prefijo: así
// .strip-card__notice no casa con .strip-card__notice-prefix (RF-27).
function contenidoDeSpan(texto, clase) {
    let desde = null;

    for (const etiqueta of texto.matchAll(/<span\b([^>]*)>/g)) {
        const clases = (etiqueta[1].match(/class="([^"]*)"/) || [])[1] || '';
        if (clases.split(/\s+/).includes(clase)) {
            desde = etiqueta.index + etiqueta[0].length;
            break;
        }
    }
    if (desde === null) return null;

    const CIERRE = '</span>';
    let nivel = 1;
    let cursor = desde;

    while (nivel > 0) {
        const abre = texto.indexOf('<span', cursor);
        const cierra = texto.indexOf(CIERRE, cursor);
        if (cierra === -1) return null; // el elemento no se cierra: el marcado está roto

        if (abre !== -1 && abre < cierra) {
            nivel++;
            cursor = abre + '<span'.length;
        } else {
            nivel--;
            cursor = cierra + CIERRE.length;
        }
    }

    return texto.slice(desde, cursor - CIERRE.length);
}

// Texto de .strip-card__name, o null si la tarjeta no lo tiene
function getCardName(card) {
    const dentro = contenidoDeSpan(card, 'strip-card__name');
    return dentro === null ? null : stripTags(dentro);
}

// Texto de .strip-card__notice, o null si la tarjeta no lo tiene. Devuelve el aviso
// completo aunque lleve el prefijo envuelto en su propio <span> (RF-27).
function getCardNotice(card) {
    const dentro = contenidoDeSpan(card, 'strip-card__notice');
    return dentro === null ? null : stripTags(dentro);
}

// Texto de .strip-card__notice-prefix, o null si el aviso no lo lleva envuelto (RF-27)
function getCardNoticePrefix(card) {
    const dentro = contenidoDeSpan(card, 'strip-card__notice-prefix');
    return dentro === null ? null : stripTags(dentro);
}

// Bloque de texto .strip-card__meta de una tarjeta: el nombre y el aviso agrupados
// (Cambio 003 de la spec 002). Devuelve el contenido del bloque, para poder leer el
// nombre y el aviso con getCardName y getCardNotice, o null si la tarjeta no lo tiene.
function getCardMeta(card) {
    return contenidoDeSpan(card, 'strip-card__meta');
}

// Imagen de la tarjeta con su texto alternativo, o null si no tiene ninguna
function getCardImage(card) {
    const match = card.match(/<img\b[^>]*>/);
    return match ? { src: getAttr(match[0], 'src'), alt: getAttr(match[0], 'alt') } : null;
}

// Las franjas de la sección: cada una con sus tarjetas originales y sus copias de relleno separadas.
// name: el rotulo de la franja ("instrumentos" o "efectos"); id y label: el id y el texto de su encabezado.
function getStrips(html) {
    return getStripBlocks(html).map((block) => {
        const etiquetaId = getAttr(block.match(/^<div\b[^>]*>/)[0], 'aria-labelledby');
        // El encabezado es hermano del bloque de la franja, así que se busca en toda la página
        const rotulo = etiquetaId ? html.match(new RegExp(`id="${etiquetaId}"[^>]*>([\\s\\S]*?)</h[1-6]>`)) : null;

        return {
            name: etiquetaId ? etiquetaId.replace(/^strip-/, '') : null,
            id: etiquetaId,
            label: rotulo ? stripTags(rotulo[1]) : null,
            cards: getStripCards(block, { decorativas: false }),
            fillers: getStripCards(block, { decorativas: true })
        };
    });
}

// Texto de un encabezado dentro de un bloque
function getHeadingText(block, tag = 'h3') {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return match ? stripTags(match[1]) : null;
}

// ============================================
// HELPERS PARA CSS
// ============================================

// Contenido de un bloque @media (busca el cierre contando llaves)
function getMediaBlock(css, query) {
    const start = css.indexOf(query);
    if (start === -1) return null;

    const open = css.indexOf('{', start);
    let depth = 0;

    for (let i = open; i < css.length; i++) {
        if (css[i] === '{') depth++;
        if (css[i] === '}') {
            depth--;
            if (depth === 0) return css.slice(open + 1, i);
        }
    }
    return null;
}

// Declaraciones de la primera regla que empieza por un selector, o null
function getRule(css, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}'));
    return match ? match[1] : null;
}

// Variables declaradas en :root
function getRootVariables(css) {
    const match = css.match(/:root\s*\{([^}]*)\}/);
    return match ? match[1] : '';
}

// Valor de un atributo dentro de una etiqueta
function getAttr(tag, name) {
    const match = tag.match(new RegExp(`${name}="([^"]*)"`));
    return match ? match[1] : null;
}

// Todas las imágenes del documento con su texto alternativo
function getImageSources(html) {
    return [...html.matchAll(/<img\b[^>]*>/g)].map((tag) => ({
        tag: tag[0],
        src: getAttr(tag[0], 'src'),
        alt: getAttr(tag[0], 'alt')
    }));
}

// Dominios de las imágenes del documento
function getImageDomains(html) {
    return [...new Set(getImageSources(html).map((img) => {
        const match = img.src ? img.src.match(/^https?:\/\/([^/]+)/) : null;
        return match ? match[1] : null;
    }).filter(Boolean))];
}

// Código completo de una función (busca el cierre contando llaves)
function getFunctionSource(code, name) {
    const start = code.indexOf(`function ${name}(`);
    if (start === -1) return null;

    let depth = 0;
    const open = code.indexOf('{', start);

    for (let i = open; i < code.length; i++) {
        if (code[i] === '{') depth++;
        if (code[i] === '}') {
            depth--;
            if (depth === 0) return code.slice(start, i + 1);
        }
    }
    return null;
}

module.exports = {
    PROJECT_ROOT,
    readProjectFile,
    stripTags,
    getIds,
    getInternalHrefs,
    getBrokenLinks,
    countMatches,
    getHref,
    getSection,
    getBlock,
    getHeadingText,
    isDecorative,
    getStripBlocks,
    getStripCards,
    getCardName,
    getCardNotice,
    getCardMeta,
    getCardNoticePrefix,
    getCardImage,
    getStrips,
    getDivsByClass,
    getHeroGallery,
    getGalleryBlocks,
    getGalleryColumns,
    getGalleryCards,
    getGalleryImage,
    getScrim,
    reglasDe,
    reglaDe,
    leerAnimacion,
    getKeyframes,
    recorridoDe,
    segundosDe,
    especificidad,
    anula,
    getMediaBlock,
    getRule,
    getRootVariables,
    getFunctionSource,
    getAttr,
    getImageSources,
    getImageDomains
};
