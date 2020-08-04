// Code by Aleix Ferré
// Github: https://github.com/CatalaHD
// P5 Sketch: https://editor.p5js.org/thecatalahd/sketches/1cSFvJQgN
// Note: All the following comments and variable name are in Catalan

let mida = 10; // Mida nxn del tauler

// Vector de paraules
let paraules = ['lowly', 'creature', 'vacation', 'habitual', 'hat', 'graceful', 'dinner', 'haunt', 'boast', 'fair'];

let lletres = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split(''); // Lletres disponibles a l'alfabet

let tauler = []; // Tauler on hi han les lletres que es veuen en pantalla
let taulerSol = []; // Tauler que indica a cada casella si hi ha una paraula de la solucio
let colors = []; // Tauler que indica el color de cada casella

let roboto; // Font
let correctionTerm; // Terme de correció del pivot de la font

let maxIters = 10000; // Maxim d'iteracions per trobar una combinació possible. Per evitar deadlocks
let iters = maxIters; // Nombre d'iteracions actuals
let midaTxt; // Mida de la font actuals en pixels

let checkboxReverse; // Checkbox que activa o desactiva el reverse
let enableReverse = false; // Bool que defineix si s'activa la possibilitat de posar la paraula al reves

let inputWords; // Input field
let saveBoardButton; // Save board button
let saveCanvasButton; // Save canvas button

// Funció de awake
function preload() {
    correctionTerm = createVector(-1, -3);
    roboto = loadFont('assets/Roboto-Black.ttf');
    arreglarParaules();
}

// Funció de start
function setup() {
    createDiv("<h1> WORD SEARCH GENERATOR </h1>");
    createCanvas(600, 600);

    checkbox = createCheckbox('Enable reverse', enableReverse);
    checkbox.changed(changeReverse);

    createDiv("Input your own words...");
    inputWords = createInput(paraules.toString(), "text");

    createDiv("<br>");
    saveCanvasButton = createButton("Save Frame");
    saveCanvasButton.mousePressed(save_canvas);

    saveBoardButton = createButton("Save Board Properties");
    saveBoardButton.mousePressed(saveProperties);


    let btn = createButton("Generate new board");
    btn.mousePressed(omplirTauler);

    textFont(roboto);

    // Algoritme que omple el tauler
    omplirTauler();
}

// Funció de dibuixar el tauler a cada frame
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
            textSize((width * 0.8) / mida);
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

// Funció que guarda el frame actual del canvas en format png
function save_canvas() {
    saveCanvas("canvas", "png");
}

// Funció que crea un JSON amb les propietats i les guarda al sistema
function saveProperties() {
    let properties = {
        words: paraules,
        board: tauler,
        solutionBoard: taulerSol,
        reverse: enableReverse
    };
    saveJSON(properties, "properties.json", true);
}

// Funció que canvia el valor del bool pel de la checkbox
function changeReverse(val) {
    enableReverse = this.checked();
}

// Funció que retorna si la paraula es pot posar al tauler
function potPosarParaula(paraula, columna, vertical, offset, reverse) {
    // Retorna bool: si la paraula no interfereix amb cap altra existent
    // TENINT EN COMPTE QUE LES LLETRES IGUALS SON VALIDES I ES PODEN XOCAR ENTRE SI
    // 
    // paraula: string de la paraula
    // columna: int [0-mida] d'una posicio valida aleatoria dins del tauler
    // vertical: bool que indica si la paraula ha d'anar en horitzontal(false) o vertical(true)
    // offset: int que indica la quantitat de caselles desde el 0 des d'on posar la paraula
    // reverse: bool que indica si la paraula s'escriurà del dret(false) o del reves(true)

    let valid = true;

    // Prevenim que peti, encara que hi pot haber diferents errors en la generació del tauler
    iters--;
    if (iters <= 0) {
        iters = maxIters;
        print("WARNING: Pot haber-hi errors en la generació del tauler.",
            "S'ha arribat al nombre màxim d'iteracions per posar la paraula.");
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

function convertStringToArray(str, delimiter = ',') {
    return str.replace(/ /g, '') // We remove all spaces form string
        .toUpperCase() // All upper case 
        .split(delimiter) // Make it an array separated with ,
        .filter(function(el) { // Removing all the empty spots
            // Retorna false si s'ha de borrar, true si el vull conservar
            // Es conserven tots els arrays NO BUITS I
            // que TOTS ELS SEUS CARACTERS estan de l'array de lletres
            let caractersValids = new RegExp(lletres.join("|")).test(el);
            return el != "" && caractersValids;
        });
}

function omplirTauler() {

    // Esborrem els tres vectors
    netejarTauler();

    paraules = convertStringToArray(inputWords.value());
    print(paraules);

    // Primer posem les paraules de la taula de paraules a fins del tauler
    for (i = 0; i < paraules.length; i++) {
        let color = getRandomColor(); // Generem un color aleatori per la paraula
        let reverse = random(0.0, 1.0) < 0.5; // Ens diu si la paraula s'escriu al reves
        let r = floor(random(0, mida)); // Numero de la columna/fila aleatoria
        let vertical = random(0.0, 1.0) < 0.5; // Si es mostra en vertical o horitzontal
        let offset = floor(random(0, mida - paraules[i].length)); // Desplaçament dins de la columna o fila

        let paraula = paraules[i];
        if (reverse && enableReverse) {
            paraula = paraula.split("").reverse().join("");
        }

        // Mentres no hi hagi un valor valid
        while (!potPosarParaula(paraula, r, vertical, offset, reverse)) {
            // Anem generant numeros aleatoris per les variables
            r = floor(random(0, mida));
            vertical = random(0.0, 1.0) < 0.5;
            offset = floor(random(0, mida - paraula.length));
        }

        // Posem la paraula on toca. Per cada lletra de la paraula
        for (j = 0; j < paraula.length; j++) {
            // Calculem l'index lineal
            let index;
            if (vertical) {
                index = r * mida + j + offset;
            } else {
                index = (j + offset) * mida + r;
            }

            // Modifiquem els taulers
            tauler[index] = paraula[j];
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

// Funció que fa que totes les paraules que s'inseteixen siguin valides
function arreglarParaules() {
    paraules = paraules.map(function(x) {
        // Tallem el string per fer-lo com a maxim de la mida del tauler
        x = x.substring(0, mida);
        // ho posem en majuscula
        return x.toUpperCase();
    });

    // Ordenem les paraules mes llargues primer perque:
    // De forma probabilistica és molt millor que les paraules que ocupen mes lloc al tauler
    // es posin primer ocupant el lloc disponible
    // I després que es posin les mes petites que poden espaiar-se millor
    // 
    // Evita deadlocks i infinite loops amés de fer més ràpid el codi ja que
    // tarda molt menys en trobar una configuració possible
    paraules.sort(esMenor);
}