// ============================================
// TESTS: MECÁNICA DE LAS DOS FRANJAS (Spec 002 · RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-14)
// Incluye el Cambio 003: el bloque de texto de la tarjeta (RF-14, RF-23, RF-24, RF-26)
// Comprueba el HTML (rótulos y copias de relleno) y el CSS (bucle, pausa, bloque de texto, reducir movimiento)
// Las funciones puras de lectura de CSS viven en ./helpers.js (Spec 003 · T1)
// ============================================
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    readProjectFile, getSection, getStripBlocks, getStrips, getHref, getMediaBlock, isDecorative,
    reglasDe, reglaDe, leerAnimacion, recorridoDe, segundosDe, especificidad, anula
} = require('./helpers');

const html = readProjectFile('index.html');
const css = readProjectFile('css/styles.css');

const section = getSection(html, 'sintetizadores');
const bloques = getStripBlocks(section || '');
const strips = getStrips(section || '');

// Rótulos de las dos franjas, en orden de lectura (RF-8)
const ROTULOS = ['Instrumentos incluidos', 'Efectos incluidos'];

// El bloque @media de "reducir movimiento" anula la animación, así que se excluye al leer el CSS normal
const indiceReducir = css.indexOf('prefers-reduced-motion');
const cssNormal = indiceReducir === -1 ? css : css.slice(0, indiceReducir);

// ============================================
// LECTURA DEL CSS (lo que no es de las franjas vive en ./helpers.js)
// ============================================

// Declaraciones de las reglas que afectan a la pista de una franja, opcionalmente con una pseudo-clase
function reglasDeLaPista(texto, pseudo) {
    return reglasDe(texto)
        .filter((regla) => regla.selectores.some(
            (selector) => /\.strip-track$/.test(selector) && (!pseudo || selector.includes(pseudo))
        ))
        .map((regla) => regla.declaraciones);
}

// Las animaciones que se aplican a las pistas, una por franja
function animacionesDeLasPistas() {
    const encontradas = [];

    reglasDeLaPista(cssNormal).forEach((declaraciones) => {
        const animacion = leerAnimacion(declaraciones);
        if (animacion && !encontradas.some((otra) => otra.nombre === animacion.nombre)) {
            encontradas.push(animacion);
        }
    });

    return encontradas;
}

// Las dos animaciones del bucle, comprobando que están las dos
function dosAnimaciones() {
    const animaciones = animacionesDeLasPistas();
    assert.equal(
        animaciones.length, 2,
        `se esperaban 2 animaciones para las pistas (una por franja) y hay ${animaciones.length}`
    );
    return animaciones;
}

// ============================================
// RÓTULOS DE LAS DOS FRANJAS (RF-8)
// ============================================
test('RF-8 · la sección de Sintetizadores tiene una franja rotulada por cada encabezado', () => {
    assert.ok(section, 'falta <section id="sintetizadores">');
    assert.equal(strips.length, 2, `se esperaban 2 franjas rotuladas y hay ${strips.length}`);
    assert.equal(bloques.length, 2, `se esperaban 2 bloques de franja y hay ${bloques.length}`);
});

ROTULOS.forEach((rotulo, indice) => {
    test(`RF-8 · la franja ${indice + 1} se rotula con el encabezado "${rotulo}"`, () => {
        const strip = strips[indice];
        assert.ok(strip, `no hay ninguna franja para el rótulo "${rotulo}"`);

        assert.ok(strip.id, `la franja de "${rotulo}" no declara aria-labelledby`);
        assert.equal(strip.label, rotulo, `el encabezado de la franja no dice "${rotulo}"`);
        assert.match(
            bloques[indice], new RegExp(`aria-labelledby="${strip.id}"`),
            'la franja no apunta con aria-labelledby al identificador de su encabezado'
        );
        assert.match(
            section, new RegExp(`<h3[^>]*id="${strip.id}"`),
            `falta el encabezado <h3 id="${strip.id}"> que rotula la franja`
        );
    });
});

// ============================================
// COPIAS DE RELLENO (RF-6, RF-7)
// ============================================
test('RF-6 · RF-7 · las copias de relleno son decorativas, no se pulsan ni se enfocan', () => {
    assert.ok(strips.length, 'no hay ninguna franja que comprobar');

    strips.forEach((strip, indice) => {
        const rotulo = ROTULOS[indice];

        assert.ok(strip.fillers.length > 0, `la franja de "${rotulo}" no tiene copias de relleno`);
        assert.equal(
            strip.cards.length, strip.fillers.length,
            `la franja de "${rotulo}" debe repetir cada tarjeta original una vez para que el bucle sea continuo`
        );
        strip.fillers.forEach((copia, i) => {
            assert.ok(isDecorative(copia), `la copia ${i + 1} de "${rotulo}" no lleva aria-hidden="true"`);
            assert.equal(getHref(copia), null, `la copia ${i + 1} de "${rotulo}" no debería tener href`);
            assert.doesNotMatch(copia, /\stabindex=/, `la copia ${i + 1} de "${rotulo}" no debería tener tabindex`);
        });
    });
});

// ============================================
// BUCLE DE LAS DOS FRANJAS (RF-9)
// ============================================
test('RF-9 · cada franja se anima con su propia animación', () => {
    const [primera, segunda] = dosAnimaciones();
    assert.notEqual(primera.nombre, segunda.nombre, 'las dos franjas no pueden usar la misma animación: irían en el mismo sentido');
});

test('RF-9 · las dos franjas giran en sentidos opuestos', () => {
    const [primera, segunda] = dosAnimaciones();

    const recorridoA = recorridoDe(primera.nombre, css);
    const recorridoB = recorridoDe(segunda.nombre, css);
    assert.ok(recorridoA, `falta el bloque @keyframes ${primera.nombre} con su translateX`);
    assert.ok(recorridoB, `falta el bloque @keyframes ${segunda.nombre} con su translateX`);

    const deltaA = recorridoA.fin - recorridoA.inicio;
    const deltaB = recorridoB.fin - recorridoB.inicio;
    assert.ok(
        deltaA * deltaB < 0,
        `las dos franjas deberían ir en sentidos opuestos, pero ${primera.nombre} va de ${recorridoA.inicio}% a ${recorridoA.fin}% y ${segunda.nombre} de ${recorridoB.inicio}% a ${recorridoB.fin}%`
    );
});

test('RF-9 · una de las dos animaciones termina en -50% para que el bucle sea continuo', () => {
    const [primera, segunda] = dosAnimaciones();

    const recorridoA = recorridoDe(primera.nombre, css);
    const recorridoB = recorridoDe(segunda.nombre, css);
    assert.ok(recorridoA && recorridoB, 'las dos animaciones necesitan su bloque @keyframes con su translateX');

    assert.ok(
        [recorridoA.fin, recorridoB.fin].includes(-50),
        `una de las dos animaciones debería terminar en translateX(-50%), pero terminan en ${recorridoA.fin}% y ${recorridoB.fin}%`
    );
});

test('RF-9 · las dos franjas tardan lo mismo en una vuelta (entre 25 y 35 segundos)', () => {
    const [primera, segunda] = dosAnimaciones();

    assert.ok(primera.duracion, `la animación ${primera.nombre} no declara duración`);
    assert.ok(segunda.duracion, `la animación ${segunda.nombre} no declara duración`);

    const segundosPrimera = segundosDe(primera.duracion, css);
    const segundosSegunda = segundosDe(segunda.duracion, css);
    assert.equal(
        segundosSegunda, segundosPrimera,
        `las dos franjas deben girar a la misma velocidad: ${primera.duracion} y ${segunda.duracion}`
    );
    assert.ok(
        segundosPrimera >= 25 && segundosPrimera <= 35,
        `una vuelta debería durar entre 25 y 35 segundos y dura ${segundosPrimera}`
    );
});

// ============================================
// PAUSA CON PUNTERO Y CON TECLADO (RF-10)
// ============================================
[
    { pseudo: ':hover', motivo: 'al pasar el puntero por encima de la franja' },
    { pseudo: ':focus-within', motivo: 'al enfocar una tarjeta con el teclado' }
].forEach(({ pseudo, motivo }) => {
    test(`RF-10 · la franja se detiene ${motivo}`, () => {
        const reglas = reglasDeLaPista(cssNormal, pseudo);

        assert.ok(reglas.length, `no hay ninguna regla de pausa con ${pseudo} sobre la pista de la franja`);
        reglas.forEach((declaraciones) => {
            assert.match(
                declaraciones, /animation-play-state\s*:\s*paused/,
                `${motivo} la pista debería quedar en animation-play-state: paused para reanudar sin salto`
            );
        });
    });
});

// ============================================
// BLOQUE DE TEXTO DE LA TARJETA · CAMBIO 003 (RF-14, RF-23, RF-24, RF-26)
// El nombre y el aviso viven juntos en .strip-card__meta. En reposo el bloque está
// oculto solo visualmente, con opacity: 0, así que sigue en el árbol accesible; y
// se revela entero al pasar el puntero o al enfocar la tarjeta con el teclado.
// Al salir del flujo no reserva sitio, así que la tarjeta no cambia de alto.
// En la rama sin puntero el bloque es una banda con el nombre siempre visible.
// ============================================

// Reglas de la hoja con su posición y con si están dentro de un @media.
// No se apoya en reglasDe a propósito. Al repartir el texto con
// /([^{}]+)\{([^}]*)\}/g pasan dos cosas: el "@media ... {" se pega al selector de
// la primera regla del bloque, y su declaración se traga hasta el primer }.
// Con una regla por bloque eso solo afectaba a la primera, pero con el bloque de
// las franjas, que tiene varias, el resto pasaba por regla normal y el test tomaba
// por revelado de la base una regla que estaba dentro del media query. Aquí se
// lleva la cuenta de las llaves y se lee el bloque entero de cada regla, así que
// todas se detectan y los índices son los de este recorrido.
function reglasConMedia(texto) {
    const sinComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const PRELUDA_MEDIA = /@media\b[^;{}]*?\)\s*/;
    const reglas = [];
    const abiertos = [];
    let pendientes = '';

    for (let i = 0; i < sinComentarios.length; i++) {
        const caracter = sinComentarios[i];

        if (caracter === '{') {
            const abreMedia = /@media\b[^;{}]*$/.test(pendientes);
            const cierre = sinComentarios.indexOf('}', i);
            if (cierre === -1) break;

            // La primera regla del bloque: el prefijo @media no es selector
            const cabecera = abreMedia
                ? pendientes.replace(PRELUDA_MEDIA, '').replace(/@media\s+[a-z]+\s+/, '')
                : pendientes;

            // La llave se cuenta siempre, aunque no abra ninguna regla: si no, las
            // reglas siguientes del bloque se creerían de la base
            abiertos.push(abreMedia);
            pendientes = '';

            if (cabecera.trim()) {
                reglas.push({
                    selectores: cabecera.split(',').map((s) => s.trim()).filter(Boolean),
                    declaraciones: sinComentarios.slice(i + 1, cierre),
                    enMedia: abreMedia || abiertos.slice(0, -1).some(Boolean),
                    indice: reglas.length
                });
            }
        } else if (caracter === '}') {
            abiertos.pop();
            pendientes = '';
        } else {
            pendientes += caracter;
        }
    }

    return reglas;
}

// Una regla trata del bloque de texto de la tarjeta si alguno de sus selectores lo nombra
const tocaElBloque = (regla, { pseudo, sinMedia } = {}) => regla.selectores.some((selector) =>
    selector.includes('.strip-card__meta') &&
    (!pseudo || selector.includes(pseudo)) &&
    (!sinMedia || !regla.enMedia)
);

// Declaraciones de las reglas que afectan al bloque de texto, opcionalmente con una pseudo-clase
function reglasDelBloque(texto, pseudo) {
    return reglasConMedia(texto)
        .filter((regla) => tocaElBloque(regla, { pseudo }))
        .map((regla) => regla.declaraciones);
}

// La guarda de las copias de relleno, con su posición en la hoja
function guardasDeRelleno(texto) {
    return reglasConMedia(texto)
        .filter((regla) => regla.selectores.some(
            (selector) => selector.includes('.strip-card--filler') && selector.includes('.strip-card__meta')
        ));
}

test('RF-14 · RF-22 · el bloque de texto se esconde con opacity: 0 y no con visibility ni con display', () => {
    const declaraciones = reglaDe(cssNormal, '.strip-card__meta');

    assert.ok(declaraciones, 'no hay ninguna regla para .strip-card__meta');
    assert.match(
        declaraciones, /opacity\s*:\s*0/,
        'el bloque de texto debería esconderse con opacity: 0 para seguir disponible para los lectores de pantalla'
    );
    assert.doesNotMatch(declaraciones, /visibility\s*:\s*hidden/, 'visibility: hidden saca el bloque de texto del árbol accesible');
    assert.doesNotMatch(declaraciones, /display\s*:\s*none/, 'display: none saca el bloque de texto del árbol accesible y hace saltar la tarjeta');
});

[ ':hover', ':focus-visible' ].forEach((pseudo) => {
    test(`RF-23 · el bloque de texto se revela con ${pseudo}`, () => {
        const reglas = reglasDelBloque(cssNormal, pseudo);

        assert.ok(reglas.length, `no hay ninguna regla que revele el bloque de texto con ${pseudo}`);
        reglas.forEach((declaraciones) => {
            assert.match(
                declaraciones, /opacity\s*:\s*1/,
                `con ${pseudo} el bloque de texto debería aparecer entero con opacity: 1, no solo el aviso`
            );
        });
    });
});

test('RF-24 · el bloque de texto está fuera del flujo para que la tarjeta no cambie de alto', () => {
    const declaraciones = reglaDe(cssNormal, '.strip-card__meta');
    assert.ok(declaraciones, 'no hay ninguna regla para .strip-card__meta');

    assert.match(
        declaraciones, /position\s*:\s*(absolute|fixed)/,
        'el bloque de texto debería salir del flujo: en el flujo, al revelarlo la tarjeta crecería y daría un salto'
    );
});

test('RF-23 · la imagen de la tarjeta declara su transición y crece un poco al interactuar', () => {
    const base = reglaDe(cssNormal, '.strip-card__image');
    assert.ok(base, 'no hay ninguna regla para .strip-card__image');
    assert.match(
        base, /transition\s*:[^;]*transform/,
        'la imagen debería declarar la transición de su transform, si no el cambio de tamaño sería un salto'
    );
    assert.match(
        base, /transform-origin\s*:\s*bottom/,
        'la imagen debería crecer desde abajo, no desde el centro: el borde superior es el que sube'
    );

    const interaccion = reglasDe(cssNormal)
        .filter((regla) => regla.selectores.some(
            (selector) => selector.includes('.strip-card__image') && selector.includes(':hover')
        ))
        .map((regla) => regla.declaraciones);

    assert.ok(interaccion.length, 'no hay ninguna regla que transforme la imagen al pasar el puntero por la tarjeta');
    interaccion.forEach((declaraciones) => {
        assert.match(declaraciones, /transform\s*:\s*scale\(/, 'la imagen debería crecer un poco con scale() al interactuar');
    });
});

test('RF-26 · la guarda de las copias de relleno las vuelve a ocultar y va después de las reglas de revelado', () => {
    const guardas = guardasDeRelleno(cssNormal);
    assert.ok(
        guardas.length > 0,
        'no hay ninguna regla que guarde el bloque de texto de las copias de relleno: con solo pointer-events: none la copia seguiría mostrando su texto si la franja se detuviera sobre ella'
    );

    guardas.forEach((regla) => {
        assert.match(
            regla.declaraciones, /opacity\s*:\s*0/,
            'la guarda debe volver a ocultar el bloque con opacity: 0, no basta con pointer-events: none'
        );
    });

    // Con la misma especificidad gana la regla que aparece después, así que la guarda va al final
    const revelados = reglasConMedia(cssNormal)
        .filter((regla) => tocaElBloque(regla, { sinMedia: true }) && /opacity\s*:\s*1/.test(regla.declaraciones));

    assert.ok(revelados.length > 0, 'no hay ninguna regla que revele el bloque de texto: la guarda no tiene a quién seguir');

    const ultimoRevelado = Math.max(...revelados.map((regla) => regla.indice));
    guardas
        .filter((regla) => !regla.enMedia)
        .forEach((regla) => {
            assert.ok(
                regla.indice > ultimoRevelado,
                `la guarda de las copias de relleno está en la posición ${regla.indice} y el último revelado en ${ultimoRevelado}: la guarda tiene que ir después para ganar con la misma especificidad`
            );
        });

    // Y tiene que ganar también a la rama sin puntero, donde el bloque de texto es
    // visible por defecto: si su especificidad no llegara, la copia mostraría su
    // nombre durante el bucle (RF-26)
    const reveladosSinPuntero = reglasConMedia(css)
        .filter((regla) => regla.enMedia && tocaElBloque({ ...regla, enMedia: false }) && /opacity\s*:\s*1/.test(regla.declaraciones));

    if (reveladosSinPuntero.length > 0) {
        guardas.forEach((guarda) => {
            reveladosSinPuntero.forEach((revelado) => {
                assert.ok(
                    anula(guarda.selectores[0], revelado.selectores[0]) || guarda.indice > revelado.indice,
                    `la guarda (${guarda.selectores[0]}) debería igualar o superar a "${revelado.selectores[0]}", que hace visible el bloque en un dispositivo sin puntero`
                );
            });
        });
    }
});

// Todos los bloques @media (hover: none) de la hoja, con su posición.
// La hoja ya traía uno de la spec 001 para el overlay de la galería, así que el
// del Cambio 003 es el segundo: buscar solo el primero daría el bloque equivocado
function bloquesSinPuntero(texto) {
    const bloques = [];
    let desde = 0;

    while (desde < texto.length) {
        const inicio = texto.indexOf('(hover: none)', desde);
        if (inicio === -1) break;

        const bloque = getMediaBlock(texto.slice(inicio), 'hover: none');
        if (!bloque) break;

        bloques.push({ inicio, bloque });
        desde = inicio + bloque.length;
    }

    return bloques;
}

test('RF-24 · la rama sin puntero deja el nombre siempre visible y va antes del bloque de reducir movimiento', () => {
    const deLasTarjetas = bloquesSinPuntero(css).filter(({ bloque }) => bloque.includes('.strip-card'));

    assert.equal(
        deLasTarjetas.length, 1,
        `debería haber un bloque @media (hover: none) para las tarjetas de las franjas y hay ${deLasTarjetas.length}`
    );

    const [{ inicio: indiceSinPuntero, bloque }] = deLasTarjetas;

    const nombre = reglaDe(bloque, '.strip-card__name');
    assert.ok(nombre, 'dentro de @media (hover: none) no hay ninguna regla para .strip-card__name');
    assert.match(
        nombre, /opacity\s*:\s*1/,
        'sin puntero no hay hover que revele nada: el nombre tiene que verse siempre, con opacity: 1'
    );

    // Lo que se exige de verdad es que la rama sin puntero vaya antes del bloque de
    // reducir movimiento, porque este fichero corta la hoja en su índice para leer el
    // CSS normal: una regla colocada después sería invisible para estos tests. Y que
    // el bloque de reducir movimiento vaya después de las reglas que asignan las
    // animaciones, que es lo que le hace ganar en la cascada. No hace falta que sea
    // el último bloque de la hoja: detrás queda @media print, que añadió la spec 003
    // para no imprimir las tarjetas, y su sitio importa por otro motivo: tiene que
    // declararse después de .hero-bg para poder ocultarla.
    assert.ok(indiceReducir > -1, 'no se encuentra el bloque @media (prefers-reduced-motion: reduce)');
    assert.ok(
        indiceSinPuntero < indiceReducir,
        `la rama sin puntero debería ir antes del bloque de "reducir movimiento": van en los índices ${indiceSinPuntero} y ${indiceReducir}`
    );
});

// ============================================
// REDUCIR MOVIMIENTO (RF-11)
// ============================================
test('RF-11 · con "reducir movimiento" las franjas no se animan solas pero se recorren a mano', () => {
    const bloque = getMediaBlock(css, 'prefers-reduced-motion: reduce');

    assert.ok(bloque, 'falta el bloque @media (prefers-reduced-motion: reduce)');
    assert.match(bloque, /animation\s*:\s*none/, 'las pistas deberían dejar de animarse');
    assert.match(bloque, /overflow-x\s*:\s*auto/, 'la franja debería poder recorrerse a mano con overflow-x: auto');

    // Selectores que ASIGNAN la animación a la pista fuera del media query
    const asignan = [];
    reglasDeLaPista(cssNormal).forEach((declaraciones) => {
        if (!leerAnimacion(declaraciones)) return;
        const regla = reglasDe(cssNormal).find((otra) => otra.declaraciones === declaraciones);
        regla.selectores
            .filter((selector) => /\.strip-track$/.test(selector))
            .forEach((selector) => asignan.push(selector));
    });
    assert.ok(asignan.length > 0, 'no se encuentra ninguna regla que asigne la animación a la pista');

    // Selectores del media query que la anulan con animation: none
    const anulan = [];
    reglasDe(bloque).forEach((regla) => {
        if (!/animation\s*:\s*none/.test(regla.declaraciones)) return;
        regla.selectores
            .filter((selector) => selector.includes('strip-track'))
            .forEach((selector) => anulan.push(selector));
    });
    assert.ok(anulan.length > 0, 'dentro del media query no hay ninguna regla que anule la animación de la pista');

    // Un media query no suma especificidad: si la regla anuladora es más débil, la animación sigue
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