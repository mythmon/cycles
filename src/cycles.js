import {Mesh} from './mesh';
import {shuffle, randInt, randItem, randItemWeighted} from './utils';
import {isSolvable} from './solver';

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

    // setup
    for (e of this.edges) {
      e.state = 'none';
    }
    for (f of this.faces) {
      f.color = 'grey';
    }
    this.colorFaces();

    // add hints
    for (e of this.edges) {
      e.state = e.aFace.color !== (e.bFace || {color: 'black'}).color;
    }
    for (f of this.faces) {
      f.color = 'grey';
      f.hint = f.edges.filter((e) => e.state === true).length;
    }
    for (e of this.edges) {
      e.state = 'none';
    }

    this.removeHints();

    var doneMakingPuzzle = new Date();
    console.log('Made puzzle in', doneMakingPuzzle - startMakingPuzzle, 'ms');
  }

  canColor(face, color) {
    if (face.color !== 'grey') {
      return false;
    }
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
    var color;
    var todo = this.faces.length - 1;
    var f;
    var choices, choice;

    randItem(this.faces).color = 'white';

    while (todo > 0) {
    // var interval = setInterval(function() {
      color = randItem(['white', 'black']);
      if (todo <= 0) {
        clearInterval(interval);
        return;
      }
      choices = [];
      for (f of this.faces.filter((f) => f.color === 'grey')) {
        if (this.canColor(f, color)) {
          choices.push({
            color: color,
            face: f,
            score: this.faceScore(f, color) + Math.random() - 0.5,
          });
        }
      }

      shuffle(choices);
      choices.sort((b, a) => a.score - b.score);
      while (choices.length > 0) {
        choice = choices.pop();
        choice.face.color = choice.color;
        if (this.gridHasHoles()) {
          choice.face.color = 'grey';
        } else {
          todo--;
          break;
        }
      }
    // }.bind(this), 0);
    }
  }

  transitionsAroundCount(face, color) {
    var neighbors = face.neighborsCorners();
    var edgeCounts = {};
    var edgeMap = {};
    var potentials = [];
    var fromNull = 0;

    for (var n of neighbors) {
      if (n) {
        for (var e of n.edges) {
          if (e.id) {
            edgeCounts[e.id] = (edgeCounts[e.id] || 0) + 1;
            edgeMap[e.id] = e;
          }
        }
      } else {
        if (color === 'black') {
          fromNull = 2;
        }
      }
    }

    for (var edgeId in edgeCounts) {
      var count = edgeCounts[edgeId];
      if (count === 2) {
        potentials.push(edgeMap[edgeId]);
      }
    }

    return potentials.filter(function(e) {
      var aFace = e.aFace || {color: 'black'};
      var bFace = e.bFace || {color: 'black'};
      return aFace.color !== bFace.color;
      // return ((aFace.color === 'grey' && bFace.color === color) ||
              // (aFace.color === color && bFace.color === 'grey'));
    }).length;
  }

  faceScore(face, color) {
    var cost = 1;
    var neighbors = face.neighborsCorners();
    // var score = Math.pow(neighbors.length);
    var score = neighbors.length + 1;
    for (var n of neighbors) {
      if (n && n.color !== color) {
        score -= cost;
        // cost *= 2;
      }
    }
    return score;
  }

  gridHasHoles() {
    var hasPathToNull = function(start) {
      var todo = [start];
      var seen = {};
      while (todo.length) {
        var f = todo.pop();
        if (seen[f.id]) {
          continue;
        }
        seen[f.id] = true;
        for (var n of f.neighbors()) {
          if (!n) {
            return true;
          }
          if (n.color === 'grey' && !seen[n.id]) {
            todo.push(n);
          }
        }
      }
      return false;
    };

    for (var f of this.faces.filter((f) => f.color === 'grey')) {
      if (!hasPathToNull(f)) {
        return true;
      }
    }
    return false;
  }

  resetEdges() {
    console.log('clearing');
    for (var e of this.edges) {
      e.state = 'none';
    }
  }

  removeHints() {
    var theHintWas;
    var faces = shuffle(this.faces);
    this.resetEdges();

    if (!isSolvable(this)) {
      this.resetEdges();
      alert('I screwed up. Please refresh.')
      throw 'Puzzle not solvable with all hints.';
    }
    this.resetEdges();

    for (var f of faces) {
      theHintWas = f.hint;
      f.hint = null;
      if (!isSolvable(this)) {
        f.hint = theHintWas;
      }
      this.resetEdges();
    }
  }
}
