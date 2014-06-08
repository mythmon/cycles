System.register(["./mesh"], function($__0) {
  "use strict";
  var PUZZLE_SIZE,
      loopNodes,
      solvingMethods;
  function square(x, y) {
    return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
  }
  function makePuzzleMesh() {
    var $__6;
    var mesh = new $__0[0]["Mesh"]();
    var e,
        v1,
        v2;
    var hints = [0, 2, null, null, null, null, null, 1, 3, null, null, 3, null, null, 0, null];
    for (var x = 0; x < PUZZLE_SIZE; x++) {
      for (var y = 0; y < PUZZLE_SIZE; y++) {
        var f = ($__6 = mesh).addFace.apply($__6, $traceurRuntime.toObject(square(x, y)));
        f.hint = hints[y * 4 + x];
      }
    }
    for (var $__1 = mesh.edges[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      e = $__2.value;
      {
        e.state = false;
      }
    }
    for (var i = 0; i < loopNodes.length; i++) {
      v1 = loopNodes[i];
      v2 = loopNodes[(i + 1) % loopNodes.length];
      e = mesh.getEdgeFrom(v1, v2);
      e.state = true;
    }
    for (var $__3 = mesh.edges[Symbol.iterator](),
        $__4; !($__4 = $__3.next()).done; ) {
      e = $__4.value;
      {
        e.state = 'none';
      }
    }
    return mesh;
  }
  function oneSolutionStep(puzzle) {
    for (var i = 0; i < solvingMethods.length; i++) {
      var ret = solvingMethods[i](puzzle);
      if (ret) {
        console.log('Stepped using strategy: ', solvingMethods[i].name);
        return true;
      }
    }
    return false;
  }
  function _getUnsetEdge(d) {
    var unsetEdges = d.edges.filter((function(e) {
      return e.state === 'none';
    }));
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
    var t = d.edges.filter((function(e) {
      return e.state === true;
    })).length;
    var f = d.edges.filter((function(e) {
      return e.state === false;
    })).length;
    var n = d.edges.filter((function(e) {
      return e.state === 'none';
    })).length;
    return {
      a: a,
      t: t,
      f: f,
      n: n
    };
  }
  function singleVertPatterns(puzzle) {
    for (var $__1 = puzzle.verts[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var v = $__2.value;
      {
        var $__5 = $traceurRuntime.assertObject(_componentCounts(v)),
            a = $__5.a,
            t = $__5.t,
            f = $__5.f,
            n = $__5.n;
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
    }
    return false;
  }
  function fillNums(puzzle) {
    for (var $__1 = puzzle.faces.filter((function(f) {
      return f.hint !== null;
    }))[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var face = $__2.value;
      {
        var $__5 = $traceurRuntime.assertObject(_componentCounts(face)),
            a = $__5.a,
            t = $__5.t,
            f = $__5.f,
            n = $__5.n;
        if (t > face.hint) {
          throw new Error("Logic error, face with too many edges set.");
        }
        if (f === a - face.hint && n > 0) {
          return _setOneEdge(face);
        }
      }
    }
  }
  function emptyNums(puzzle) {
    for (var $__1 = puzzle.faces.filter((function(f) {
      return f.hint !== null;
    }))[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var face = $__2.value;
      {
        var $__5 = $traceurRuntime.assertObject(_componentCounts(face)),
            a = $__5.a,
            t = $__5.t,
            f = $__5.f,
            n = $__5.n;
        if (t === face.hint && n > 0) {
          return _clearOneEdge(face);
        }
      }
    }
  }
  function facesInCorners(puzzle) {
    for (var $__3 = puzzle.faces.filter((function(f) {
      return f.hint !== null;
    }))[Symbol.iterator](),
        $__4; !($__4 = $__3.next()).done; ) {
      var face = $__4.value;
      {
        var faceCounts = _componentCounts(face);
        if (faceCounts.a - faceCounts.t - faceCounts.n < face.hint) {
          for (var $__1 = face.verts()[Symbol.iterator](),
              $__2; !($__2 = $__1.next()).done; ) {
            var vert = $__2.value;
            {
              var vertCounts = _componentCounts(vert);
              if (vertCounts.t === 0 && vertCounts.n === 2) {
                return _setOneEdge(vert);
              }
            }
          }
        }
      }
    }
  }
  return {
    exports: {
      get makePuzzleMesh() {
        return makePuzzleMesh;
      },
      get oneSolutionStep() {
        return oneSolutionStep;
      },
      set makePuzzleMesh(value) {
        makePuzzleMesh = value;
      },
      set oneSolutionStep(value) {
        oneSolutionStep = value;
      }
    },
    execute: function() {
      ;
      PUZZLE_SIZE = 4;
      loopNodes = [[2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [3, 3], [3, 2], [2, 2], [2, 3], [1, 3], [0, 3], [0, 2], [1, 2], [1, 1], [2, 1]];
      ;
      ;
      ;
      solvingMethods = [singleVertPatterns, fillNums, emptyNums, facesInCorners];
      ;
      ;
      ;
      ;
      ;
      ;
      ;
      ;
    }
  };
});
