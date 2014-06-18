export function isSolvable(puzzle) {
  while (true) {
    try {
      if (!oneSolutionStep(puzzle)) {
        break;
      }
    } catch (e) {
      console.log('AHHHH', e);
      return false;
    }
  }
  return puzzle.edges.filter((e) => e.state === 'none').length === 0;
}

export function oneSolutionStep(puzzle) {
  for (var i = 0; i < solvingMethods.length; i++) {
    var ret;
    try {
      ret = solvingMethods[i](puzzle);
    } catch (e) {
      console.error(e);
      return false;
    }
    if (ret) {
      // console.log('Stepped using strategy: ', solvingMethods[i].name);
      return true;
    }
  }
  return false;
}

/* Ever solving method in this should find one piece of evidence, make changes
* to the puzzle based on only that piece of evidence, and then return true.
* If no evidence it found, and thus no changes made, it should return false.
*/
// var solvingMethods = [singleVertPatterns, fillNums, emptyNums, facesInCorners];
var solvingMethods = [singleVertPatterns, fillNums, emptyNums];

function _getUnsetEdge(d) {
  var unsetEdges = d.edges.filter((e) => e.state === 'none');
  if (unsetEdges.length === 0) {
    console.error('ineligible object to setOn:', d);
    throw 'Logic error, tried to set/clear on ineligible object.';
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
  var a = 0, t = 0, f = 0, n = 0;
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
      throw 'Algorithm error, n+t+f != a';
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
      throw "Logic error, face with too many edges set.";
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
