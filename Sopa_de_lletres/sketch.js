// Code by Aleix Ferré
// Github: https://github.com/CatalaHD

let mida = 10;

let paraules = ['paraula', 'word', 'altra', 'salamandra', 'tu', 'madre', 'la', 'coja', 'mom'];
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
let tauler = [];
let taulerSol = [];
let colors = [];
let roboto;
let correctionTerm;
let maxIters = 10000;
let iters = maxIters;

let slider;
let midaTxt;

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

  omplirTauler();
}

function draw() {
  background(225);

  let relacioX = width / mida;
  let relacioY = height / mida;

  // Dibuixem el tauler
  for (i = 0; i < mida; i++) {
    for (j = 0; j < mida; j++) {

      let a = createVector(i * relacioX, j * relacioY);
      let b = createVector(a.x + relacioX, a.y);
      let c = createVector(a.x, a.y + relacioY);

      noStroke();

      if (taulerSol[i * mida + j]) {
        fill(colors[i * mida + j]);
        rect(a.x, a.y, relacioX, relacioY);
      }

      textSize(300 / mida);
      textAlign(CENTER, CENTER);
      let col = colors[i * mida + j];
      if (!col) {
        col = "#FFFFFFFF";
      }

      fill(invertColor(col));
      text(tauler[i * mida + j],
        a.x + relacioX / 2 + correctionTerm.x,
        a.y + relacioY / 2 + correctionTerm.y);

      stroke("red"); // Change the color
      strokeWeight(5); // Make the points 10 pixels in size
      newline(a, b);
      newline(a, c);
    }
  }

  // Omplim les ultimes dues linies
  line(0, height, width, height);
  line(width, 0, width, height);

}

function potPosarParaula(paraula, columna, vertical, offset, reverse) {
  // Retorna bool: si la paraula no interfereix amb cap altra existent
  //!! TENINT EN COMPTE QUE LES LLETRES IGUALS SON VALIDES I ES PODEN XOCAR ENTRE SI
  // 
  // i: int de l'index de la paraula
  // columna: int [0-mida] d'una posicio valida aleatoria dins del tauler
  // vertical: bool que indica si la paraula ha d'anar en horitzontal(false) o vertical(true)
  // offset: int que indica la quantitat de caselles desde el 0 des d'on posar la paraula
  // reverse: bool que indica si la paraula s'escriurà del dret(false) o del reves(true)

  let valid = true;

  // Prevenim que peti, encara que hi pot haber diferents errors en la generació del tauler
  iters--;
  if (iters <= 0) {
    iters = maxIters;
    return true;
  }

  for (j = 0; j < paraula.length; j++) {
    let index;
    if (vertical) {
      index = columna * mida + j + offset;
    } else {
      index = (j + offset) * mida + columna;
    }

    if (tauler[index]) {
      if (tauler[index] != paraula[j]) {
        valid = false;
        break;
      }
    }
  }
  return valid;
}

function newline(a, b) {
  line(a.x, a.y, b.x, b.y);
}

function esMenor(a, b) {
  return b.length - a.length;
}

function omplirTauler() {

  netejarTauler();

  // Primer posem les paraules de la taula de paraules a fins del tauler
  for (i = 0; i < paraules.length; i++) {
    let color = getRandomColor();
    let reverse = random(0.0, 1.0) < 0.5; // TODO
    let r = floor(random(0, mida)); // Numero de la columna/fila aleatoria
    let vertical = random(0.0, 1.0) < 0.5; // Si es mostra en vertical o horitzontal
    let offset = floor(random(0, mida - paraules[i].length)); // Dins de la columna/fila, desplaçament

    // Mentres no hi hagi un valor valid
    while (!potPosarParaula(paraules[i], r, vertical, offset, reverse)) {
      // Anem generant numeros aleatoris per les variables
      r = floor(random(0, mida));
      vertical = random(0.0, 1.0) < 0.5;
      offset = floor(random(0, mida - paraules[i].length));
    }

    // Posem la paraula on toca
    for (j = 0; j < paraules[i].length; j++) {
      let index;
      if (vertical) {
        index = r * mida + j + offset;
      } else {
        index = (j + offset) * mida + r;
      }

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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

function lletraAleatoria() {
  return random(lletres);
}

function netejarTauler() {
  tauler = [];
  taulerSol = [];
  colors = [];
}