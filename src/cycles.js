import {Mesh} from './mesh';
import {shuffle, randInt, randItem, randItemWeighted} from './utils'

var PUZZLE_SIZE = 8;

function square(x, y) {
  return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
}

export class Puzzle extends Mesh {
  constructor() {
    super();
    var startMakingPuzzle = +new Date();
    var x, y, i , f, e, v1, v2;

    for (x = 0; x < PUZZLE_SIZE; x++) {
      for (y = 0; y < PUZZLE_SIZE; y++) {
        this.addFace(...square(x, y));
      }
    }

    for (e of this.edges) {
      e.state = 'none';
    }
    for (f of this.faces) {
      f.color = 'grey';
    }
    this.colorFaces();

    var doneMakingPuzzle = new Date();
    console.log('Made puzzle in', doneMakingPuzzle - startMakingPuzzle, 'ms');
  }

  canColor(face, color) {
    for (var n of face.neighbors()) {
      if (n === undefined) {
        n = {color: 'black'};
      }
      if (n.color === color) {
        return true;
      }
    }
    return false;
  }

  colorFaces() {
    var todo = this.faces.slice();
    shuffle(todo);
    todo.pop().color = 'white';

    while(todo.length) {
      var color = randItem(['white', 'black']);
      var possibleFaces = todo.filter((f) => this.canColor(f, color));
      var face = randItem(possibleFaces);
      face.color = color;
      todo = todo.filter((f) => f.id !== face.id);
    }
    console.log('black:', this.faces.filter((f) => f.color === 'black').length);
    console.log('white:', this.faces.filter((f) => f.color === 'white').length);
  }
}
