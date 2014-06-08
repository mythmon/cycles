import {Mesh} from "./mesh";

var PUZZLE_SIZE = 4;
// var loopNodes = [
//     [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [5, 1], [6, 1], [6, 2],
//     [7, 2], [7, 1], [7, 0], [8, 0], [8, 1], [8, 2], [8, 3], [7, 3], [6, 3],
//     [6, 4], [5, 4], [5, 3], [4, 3], [4, 4], [4, 5], [5, 5], [6, 5], [6, 6],
//     [5, 6], [4, 6], [4, 7], [5, 7], [6, 7], [7, 7], [7, 6], [8, 6], [8, 5],
//     [7, 5], [7, 4], [8, 4], [9, 4], [9, 3], [9, 2], [9, 1], [9, 0], [10, 0],
//     [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [9, 5], [9, 6], [10, 6],
//     [10, 7], [9, 7], [8, 7], [8, 8], [7, 8], [6, 8], [6, 9], [7, 9], [8, 9],
//     [9, 9], [10, 9], [10, 10], [9, 10], [8, 10], [7, 10], [6, 10], [5, 10],
//     [5, 9], [4, 9], [4, 10], [3, 10], [2, 10], [2, 9], [3, 9], [3, 8], [2, 8],
//     [1, 8], [1, 9], [1, 10], [0, 10], [0, 9], [0, 8], [0, 7], [1, 7], [2, 7],
//     [3, 7], [3, 6], [3, 5], [2, 5], [1, 5], [1, 6], [0, 6], [0, 5], [0, 4],
//     [1, 4], [2, 4], [3, 4], [3, 3], [2, 3], [2, 2], [3, 2], [4, 2], [4, 1],
//     [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [0, 3], [0, 2], [0, 1]];
var loopNodes = [[2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [3, 3], [3, 2],
[2, 2], [2, 3], [1, 3], [0, 3], [0, 2], [1, 2], [1, 1], [2, 1]];

function square(x, y) {
  return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
}

export function makePuzzleMesh() {
  var mesh = new Mesh();
  var e, v1, v2;

  var hints = [0, 2, null, null, null, null, null, 1, 3, null, null, 3, null, null, 0, null];
  for (var x = 0; x < PUZZLE_SIZE; x++) {
    for (var y = 0; y < PUZZLE_SIZE; y++) {
      var f = mesh.addFace(...square(x, y));
      f.hint = hints[y * 4 + x];
    }
  }

  for (e of mesh.edges) {
    e.state = false;
  }

  for (var i = 0; i < loopNodes.length; i++) {
    v1 = loopNodes[i];
    v2 = loopNodes[(i + 1) % loopNodes.length];
    e = mesh.getEdgeFrom(v1, v2);
    e.state = true;
  }

  // for (f of mesh.faces) {
  //   f.hint = f.edges.filter((f) => f.state).length;
  // }

  for (e of mesh.edges) {
    e.state = 'none';
  }

  return mesh;
}

export function oneSolutionStep(puzzle) {
  for (var i = 0; i < solvingMethods.length; i++) {
    var ret = solvingMethods[i](puzzle);
    if (ret) {
      console.log('Stepped using strategy: ', solvingMethods[i].name);
      return true;
    }
  }
  return false;
}

/* Ever solving method in this should find one piece of evidence, make changes
* to the puzzle based on only that piece of evidence, and then return true.
* If no evidence it found, and thus no changes made, it should return false.
*/
var solvingMethods = [singleVertPatterns, fillNums, emptyNums, facesInCorners];

function _getUnsetEdge(d) {
  var unsetEdges = d.edges.filter((e) => e.state === 'none');
  if (unsetEdges.length === 0) {
    console.error('ineligible object to setOn:', d);
    throw new Error('Logic error, tried to set/clear on ineligible object.');
  }
  return unsetEdges[0];
}
function _setOneEdge(d) {
  _getUnsetEdge(d).state = true;
  return true;
}
function _clearOneEdge(d) {
  _getUnsetEdge(d).state = false;
  return true;
}
function _componentCounts(d) {
  var a = d.edges.length;
  var t = d.edges.filter((e) => e.state === true).length;
  var f = d.edges.filter((e) => e.state === false).length;
  var n = d.edges.filter((e) => e.state === 'none').length;
  return {a, t, f, n};
}

function singleVertPatterns(puzzle) {
  for (var v of puzzle.verts) {
    var {a, t, f, n} = _componentCounts(v);
    if (t + f + n !== a) {
      throw new Error('Algorithm error, n+t+f != a');
    }

    if (f === a - 1 && n > 0) {
      return _clearOneEdge(v);
    }
    if (n === 1 && t === 1) {
      return _setOneEdge(v);
    }
    if (t === 2 && n > 0) {
      return _clearOneEdge(v);
    }
  }
  return false;
}

function fillNums(puzzle) {
  for (var face of puzzle.faces.filter((f) => f.hint !== null)) {
    var {a, t, f, n} = _componentCounts(face);
    if (t > face.hint) {
      throw new Error("Logic error, face with too many edges set.");
    }
    if (f === a - face.hint && n > 0) {
      return _setOneEdge(face);
    }
  }
}

function emptyNums(puzzle) {
  for (var face of puzzle.faces.filter((f) => f.hint !== null)) {
    var {a, t, f, n} = _componentCounts(face);
    if (t === face.hint && n > 0) {
      return _clearOneEdge(face);
    }
  }
}

function facesInCorners(puzzle) {
  for (var face of puzzle.faces.filter((f) => f.hint !== null)) {
    var faceCounts = _componentCounts(face);
    // will marking two "n" edges as "f" make this face invalid?
    if (faceCounts.a - faceCounts.t - faceCounts.n < face.hint) {
      // Do any verts on this face have 2 "n" edges and no "t" edges.
      for (var vert of face.verts()) {
        var vertCounts = _componentCounts(vert);
        if (vertCounts.t === 0 && vertCounts.n === 2) {
          return _setOneEdge(vert);
        }
      }
    }
  }
}
