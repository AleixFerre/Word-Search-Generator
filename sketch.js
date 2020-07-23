// Code by Aleix Ferré
// Github: https://github.com/CatalaHD
// P5 Sketch: https://editor.p5js.org/thecatalahd/sketches/1cSFvJQgN
// Note: All the following comments and variable name are in Catalan

let mida = 10; // Mida nxn del tauler

let paraules = ['paraula', 'word', 'altra', 'salamandra', 'tu', 'coja', 'mom'];
paraules = paraules.map(function(x) {
    // Tallem el string per fer-lo com a maxim de la mida del tauler
    x = x.substring(0, mida);
    // ho posem en majuscula
    return x.toUpperCase()
});

// Ordenem les paraules mes llargues primer perque:
// De forma probabilistica és molt millor que les paraules que ocupen mes lloc al tauler
// es posin primer ocupant el lloc disponible
// I després que es posin les mes petites que poden espaiar-se millor
// 
// Evita deadlocks i infinite loops amés de fer més ràpid el codi ja que
// tarda molt menys en trobar una configuració possible
paraules.sort(esMenor);

let lletres = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
let tauler = []; // Tauler on hi han les lletres que es veuen en pantalla
let taulerSol = []; // Tauler que indica a cada casella si hi ha una paraula de la solucio
let colors = []; // Tauler que indica el color de cada casella
let roboto; // Font
let correctionTerm; // Terme de correció del pivot de la font
let maxIters = 10000; // Maxim d'iteracions per trobar una combinació possible. Per evitar deadlocks
let iters = maxIters; // Nombre d'iteracions actuals
let midaTxt; // Mida de la font actuals en pixels

function preload() {
    correctionTerm = createVector(-1, -3);
    roboto = loadFont('assets/Roboto-Black.ttf');
}

function setup() {
    let canvas = createCanvas(400, 400);

    let btn = createButton("Shuffle");
    btn.mousePressed(omplirTauler);
    btn.style("font-size", "32px");

    textFont(roboto);

    omplirTauler(); // Algoritme que omple el tauler
}

function draw() {
    background(225);

    // Calculem la mida de cada caixa
    let relacioX = width / mida;
    let relacioY = height / mida;

    // Dibuixem el tauler
    for (i = 0; i < mida; i++) {
        for (j = 0; j < mida; j++) {

            let a = createVector(i * relacioX, j * relacioY);
            let b = createVector(a.x + relacioX, a.y);
            let c = createVector(a.x, a.y + relacioY);

            noStroke();

            // Si es una casella de solucio
            if (taulerSol[i * mida + j]) {
                // Hi pintem el seu color
                fill(colors[i * mida + j]);
                rect(a.x, a.y, relacioX, relacioY);
            }


            // Hi dibuixem la lletra on toca
            textSize(300 / mida);
            textAlign(CENTER, CENTER);
            let col = colors[i * mida + j];
            if (!col) {
                col = "#FFFFFF";
            }
            fill(invertColor(col));
            text(tauler[i * mida + j],
                a.x + relacioX / 2 + correctionTerm.x,
                a.y + relacioY / 2 + correctionTerm.y);

            stroke("red"); // Cambiem el color
            strokeWeight(5);
            newline(a, b); // Dibuixem la linia horitzontal superior
            newline(a, c); // Dibuixem la linia vertical esquerra
        }
    }

    // Omplim les ultimes dues linies
    line(0, height, width, height); // Inferior completa
    line(width, 0, width, height); // Dreta completa

}

function potPosarParaula(paraula, columna, vertical, offset, reverse) {
    // Retorna bool: si la paraula no interfereix amb cap altra existent
    //!! TENINT EN COMPTE QUE LES LLETRES IGUALS SON VALIDES I ES PODEN XOCAR ENTRE SI
    // 
    // paraula: string de la paraula
    // columna: int [0-mida] d'una posicio valida aleatoria dins del tauler
    // vertical: bool que indica si la paraula ha d'anar en horitzontal(false) o vertical(true)
    // offset: int que indica la quantitat de caselles desde el 0 des d'on posar la paraula
    // -- TODO -- reverse: bool que indica si la paraula s'escriurà del dret(false) o del reves(true)

    let valid = true;

    // Prevenim que peti, encara que hi pot haber diferents errors en la generació del tauler
    iters--;
    if (iters <= 0) {
        iters = maxIters;
        return true;
    }

    // Per cada lletra de la paraula
    for (j = 0; j < paraula.length; j++) {
        // Calculem la posicio linear del tauler
        let index;
        if (vertical) {
            index = columna * mida + j + offset;
        } else {
            index = (j + offset) * mida + columna;
        }

        // Si no hi ha res al tauler, podem posar-la
        if (tauler[index]) {
            // En el cas de que hi hagi alguna cosa i aquella lletra no sigui la que necessitem
            if (tauler[index] != paraula[j]) {
                // La posicio no és valida
                valid = false;
                break;
            }
        }
    }
    return valid;
}

// Sobreescrivim la funcio "line" perque accepti vectors
function newline(a, b) {
    line(a.x, a.y, b.x, b.y);
}

// Funció que retorna la resta entre mides entre les dues paraules per calcular l'ordenament
function esMenor(a, b) {
    return b.length - a.length;
}

function omplirTauler() {

    // Esborrem els tres vectors
    netejarTauler();

    // Primer posem les paraules de la taula de paraules a fins del tauler
    for (i = 0; i < paraules.length; i++) {
        let color = getRandomColor(); // Generem un color aleatori per la paraula
        let reverse = random(0.0, 1.0) < 0.5; // TODO Ens diu si la paraula s'escriu al reves
        let r = floor(random(0, mida)); // Numero de la columna/fila aleatoria
        let vertical = random(0.0, 1.0) < 0.5; // Si es mostra en vertical o horitzontal
        let offset = floor(random(0, mida - paraules[i].length)); // Desplaçament dins de la columna o fila

        // Mentres no hi hagi un valor valid
        while (!potPosarParaula(paraules[i], r, vertical, offset, reverse)) {
            // Anem generant numeros aleatoris per les variables
            r = floor(random(0, mida));
            vertical = random(0.0, 1.0) < 0.5;
            offset = floor(random(0, mida - paraules[i].length));
        }

        // Posem la paraula on toca. Per cada lletra de la paraula
        for (j = 0; j < paraules[i].length; j++) {
            // Calculem l'index lineal
            let index;
            if (vertical) {
                index = r * mida + j + offset;
            } else {
                index = (j + offset) * mida + r;
            }

            // Modifiquem els taulers
            tauler[index] = paraules[i][j];
            taulerSol[index] = true;
            colors[index] = color;
        }
    }

    // A les caselles on no hi ha res, hi posem una lletra aleatoria
    for (i = 0; i < mida; i++) {
        for (j = 0; j < mida; j++) {
            if (!taulerSol[i * mida + j]) {
                tauler[i * mida + j] = lletraAleatoria();
                taulerSol[i * mida + j] = false;
            }
        }
    }
}

// Funcio que retorna un color aleatori en HEX
// See: https://stackoverflow.com/a/1484514/13295607
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Funció que inverteix els colors que li entren en HEX
// See: https://jsfiddle.net/salman/f9Re3/
//      --> JS script line 10
function invertColor(hexTripletColor) {
    let color = hexTripletColor;
    color = color.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xFFFFFF ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color; // prepend #
    return color;
}

// Funció que retorna una lletra aleatoria del vector de lletres
function lletraAleatoria() {
    return random(lletres);
}

// Funció que esborra els taulers
function netejarTauler() {
    tauler = [];
    taulerSol = [];
    colors = [];
}