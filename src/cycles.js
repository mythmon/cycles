import {Mesh} from "./mesh";

var PUZZLE_SIZE = 5;

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

  var loopNodes = makeLoop(mesh);
  console.log('loop:', loopNodes);

  for (e of mesh.edges) {
    e.state = false;
  }

  for (var i = 0; i < loopNodes.length; i++) {
    v1 = loopNodes[i];
    v2 = loopNodes[(i + 1) % loopNodes.length];
    console.log(i, v1, v2);
    e = v1.getEdgeTo(v2);
    e.state = true;
  }

  for (e of mesh.edges) {
    e.state = 'none';
  }

  return mesh;
}

function makeLoop(mesh) {
  // DFS search to try and make a loop.
  // var goalLength = mesh.verts.length / 2;
  var goalLength = 2;
  var start = mesh.verts[Math.floor(Math.random() * mesh.verts.length)];
  var seen = {};
  var todo = [start];
  var vert;
  var loop = [];
  var foundLoop = false;

  while (todo.length > 0) {
    vert = todo.pop();
    console.log(vert);
    if (loop.length > goalLength && vert.id === start.id) {
      foundLoop = true;
      break;
    }
    if (seen[vert.id]) {
      continue;
    }
    seen[vert.id] = true;
    todo = todo.concat(vert.connectedVerts());
    loop.push(vert);
  }

  if (foundLoop) {
    return loop;
  } else {
    return null;
  }
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
