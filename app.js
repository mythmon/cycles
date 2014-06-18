(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Puzzle: {get: function() {
      return Puzzle;
    }},
  __esModule: {value: true}
});
var Mesh = $traceurRuntime.assertObject(require('./mesh')).Mesh;
var $__11 = $traceurRuntime.assertObject(require('./utils')),
    shuffle = $__11.shuffle,
    randInt = $__11.randInt,
    randItem = $__11.randItem,
    randItemWeighted = $__11.randItemWeighted;
var isSolvable = $traceurRuntime.assertObject(require('./solver')).isSolvable;
var PUZZLE_SIZE = 8;
function square(x, y) {
  return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
}
var Puzzle = function Puzzle() {
  var $__12;
  $traceurRuntime.superCall(this, $Puzzle.prototype, "constructor", []);
  var startMakingPuzzle = +new Date();
  var x,
      y,
      i,
      f,
      e,
      v1,
      v2;
  for (x = 0; x < PUZZLE_SIZE; x++) {
    for (y = 0; y < PUZZLE_SIZE; y++) {
      ($__12 = this).addFace.apply($__12, $traceurRuntime.toObject(square(x, y)));
    }
  }
  for (var $__1 = this.edges[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done; ) {
    e = $__2.value;
    {
      e.state = 'none';
    }
  }
  for (var $__3 = this.faces[Symbol.iterator](),
      $__4; !($__4 = $__3.next()).done; ) {
    f = $__4.value;
    {
      f.color = 'grey';
    }
  }
  this.colorFaces();
  for (var $__5 = this.edges[Symbol.iterator](),
      $__6; !($__6 = $__5.next()).done; ) {
    e = $__6.value;
    {
      e.state = e.aFace.color !== (e.bFace || {color: 'black'}).color;
    }
  }
  for (var $__7 = this.faces[Symbol.iterator](),
      $__8; !($__8 = $__7.next()).done; ) {
    f = $__8.value;
    {
      f.color = 'grey';
      f.hint = f.edges.filter((function(e) {
        return e.state === true;
      })).length;
    }
  }
  for (var $__9 = this.edges[Symbol.iterator](),
      $__10; !($__10 = $__9.next()).done; ) {
    e = $__10.value;
    {
      e.state = 'none';
    }
  }
  this.removeHints();
  var doneMakingPuzzle = new Date();
  console.log('Made puzzle in', doneMakingPuzzle - startMakingPuzzle, 'ms');
};
var $Puzzle = Puzzle;
($traceurRuntime.createClass)(Puzzle, {
  canColor: function(face, color) {
    if (face.color !== 'grey') {
      return false;
    }
    for (var $__1 = face.neighbors()[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var n = $__2.value;
      {
        if (n === undefined) {
          n = {color: 'black'};
        }
        if (n.color === color) {
          return true;
        }
      }
    }
    return false;
  },
  colorFaces: function() {
    var color;
    var todo = this.faces.length - 1;
    var f;
    var choices,
        choice;
    randItem(this.faces).color = 'white';
    while (todo > 0) {
      color = randItem(['white', 'black']);
      if (todo <= 0) {
        clearInterval(interval);
        return;
      }
      choices = [];
      for (var $__1 = this.faces.filter((function(f) {
        return f.color === 'grey';
      }))[Symbol.iterator](),
          $__2; !($__2 = $__1.next()).done; ) {
        f = $__2.value;
        {
          if (this.canColor(f, color)) {
            choices.push({
              color: color,
              face: f,
              score: this.faceScore(f, color) + Math.random() - 0.5
            });
          }
        }
      }
      shuffle(choices);
      choices.sort((function(b, a) {
        return a.score - b.score;
      }));
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
    }
  },
  transitionsAroundCount: function(face, color) {
    var neighbors = face.neighborsCorners();
    var edgeCounts = {};
    var edgeMap = {};
    var potentials = [];
    var fromNull = 0;
    for (var $__3 = neighbors[Symbol.iterator](),
        $__4; !($__4 = $__3.next()).done; ) {
      var n = $__4.value;
      {
        if (n) {
          for (var $__1 = n.edges[Symbol.iterator](),
              $__2; !($__2 = $__1.next()).done; ) {
            var e = $__2.value;
            {
              if (e.id) {
                edgeCounts[e.id] = (edgeCounts[e.id] || 0) + 1;
                edgeMap[e.id] = e;
              }
            }
          }
        } else {
          if (color === 'black') {
            fromNull = 2;
          }
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
    }).length;
  },
  faceScore: function(face, color) {
    var cost = 1;
    var neighbors = face.neighborsCorners();
    var score = neighbors.length + 1;
    for (var $__1 = neighbors[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var n = $__2.value;
      {
        if (n && n.color !== color) {
          score -= cost;
        }
      }
    }
    return score;
  },
  gridHasHoles: function() {
    var hasPathToNull = function(start) {
      var todo = [start];
      var seen = {};
      while (todo.length) {
        var f = todo.pop();
        if (seen[f.id]) {
          continue;
        }
        seen[f.id] = true;
        for (var $__1 = f.neighbors()[Symbol.iterator](),
            $__2; !($__2 = $__1.next()).done; ) {
          var n = $__2.value;
          {
            if (!n) {
              return true;
            }
            if (n.color === 'grey' && !seen[n.id]) {
              todo.push(n);
            }
          }
        }
      }
      return false;
    };
    for (var $__1 = this.faces.filter((function(f) {
      return f.color === 'grey';
    }))[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var f = $__2.value;
      {
        if (!hasPathToNull(f)) {
          return true;
        }
      }
    }
    return false;
  },
  resetEdges: function() {
    console.log('clearing');
    for (var $__1 = this.edges[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var e = $__2.value;
      {
        e.state = 'none';
      }
    }
  },
  removeHints: function() {
    var theHintWas;
    var faces = shuffle(this.faces);
    this.resetEdges();
    if (!isSolvable(this)) {
      this.resetEdges();
      alert('I screwed up. Please refresh.');
      throw 'Puzzle not solvable with all hints.';
    }
    this.resetEdges();
    for (var $__1 = faces[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var f = $__2.value;
      {
        theHintWas = f.hint;
        f.hint = null;
        if (!isSolvable(this)) {
          f.hint = theHintWas;
        }
        this.resetEdges();
      }
    }
  }
}, {}, Mesh);

},{"./mesh":3,"./solver":4,"./utils":5}],2:[function(require,module,exports){
"use strict";
var Puzzle = $traceurRuntime.assertObject(require('./cycles')).Puzzle;
var oneSolutionStep = $traceurRuntime.assertObject(require('./solver')).oneSolutionStep;
var randItem = $traceurRuntime.assertObject(require('./utils')).randItem;
var puzzleMesh = new Puzzle();
console.log(puzzleMesh);
var svg = d3.select('body').append('svg');
var xscale = d3.scale.linear().domain(d3.extent(puzzleMesh.verts, (function(d) {
  return d.x;
})));
var xscaleZero = xscale.copy();
var yscale = d3.scale.linear().domain(d3.extent(puzzleMesh.verts, (function(d) {
  return d.y;
})));
var yscaleZero = yscale.copy();
var lineOpen = d3.svg.line().x((function(v) {
  return xscale(v.x);
})).y((function(v) {
  return yscale(v.y);
}));
var lineClosed = lineOpen.interpolate('linear-closed');
var elems = {
  faces: svg.append('g').classed('faces', true),
  faceNums: svg.append('g').classed('face-nums', true),
  edges: svg.append('g').classed('edges', true),
  verts: svg.append('g').classed('verts', true),
  voronoi: svg.append('g').classed('voronois', true)
};
function rescaleGraph() {
  var size;
  if (window.innerWidth > window.innerHeight) {
    size = window.innerHeight * 0.9;
  } else {
    size = window.innerWidth * 0.9;
  }
  var margin = size * 0.1;
  xscale.range([margin, size - margin]);
  yscale.range([margin, size - margin]);
  xscaleZero.range([0, size - 2 * margin]);
  yscaleZero.range([0, size - 2 * margin]);
  svg.attr('width', size).attr('height', size);
  update();
}
rescaleGraph();
window.onresize = rescaleGraph;
function update() {
  var faces = elems.faces.selectAll('.face').data(puzzleMesh.faces, (function(f) {
    return f.id;
  }));
  var faceNums = elems.faceNums.selectAll('.face-num').data(puzzleMesh.faces, (function(f) {
    return 'n' + f.id;
  }));
  var edges = elems.edges.selectAll('.edge').data(puzzleMesh.edges, (function(e) {
    return e.id;
  }));
  var verts = elems.verts.selectAll('.vert').data(puzzleMesh.verts, (function(v) {
    return v.id;
  }));
  var voronoi = elems.voronoi.selectAll('.voronoi').data(puzzleMesh.voronoi());
  faces.enter().append('path').classed('face', true);
  faceNums.enter().append('text').classed('face-num', true);
  edges.enter().append('path').classed('edge', true);
  verts.enter().append('circle').classed('vert', true);
  voronoi.enter().append('path').classed('voronoi', true);
  faces.attr('d', (function(f) {
    return lineClosed(f.verts());
  }));
  faceNums.attr('x', (function(f) {
    return xscale(f.center().x);
  })).attr('y', (function(f) {
    return yscale(f.center().y);
  })).text((function(f) {
    return f.hint;
  })).style('font-size', (function(f) {
    return yscaleZero(0.6) + 'px';
  }));
  edges.attr('d', (function(e) {
    return lineOpen(e.verts());
  })).attr('edge-state', (function(e) {
    return e.state;
  }));
  verts.attr('cx', (function(v) {
    return xscale(v.x);
  })).attr('cy', (function(v) {
    return yscale(v.y);
  })).attr('r', 3);
  voronoi.attr('d', (function(poly) {
    return 'M' + poly.map((function(p) {
      return [xscale(p[0]), yscale(p[1])];
    })).join('L');
  })).datum((function(d) {
    return d.point;
  })).on('click', voronoiOnClick);
  ;
  faces.exit().remove();
  faceNums.exit().remove();
  edges.exit().remove();
  verts.exit().remove();
  voronoi.exit().remove();
}
function voronoiOnClick(d) {
  var edgeStateTransitions = {
    true: false,
    false: 'none',
    'none': true
  };
  if (d.type === 'edge') {
    d.edge.state = edgeStateTransitions[d.edge.state];
  }
  update();
}
function nextSolutionStep() {
  var madeChange = oneSolutionStep(puzzleMesh);
  update();
  return madeChange;
}
var stop = false;
function solveAll() {
  var madeChange = nextSolutionStep();
  if (!stop && madeChange) {
    requestAnimationFrame(solveAll);
  }
}
function stopSolving() {
  stop = true;
}
function clear() {
  for (var $__0 = puzzleMesh.edges[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    var e = $__1.value;
    {
      e.state = 'none';
    }
  }
}
function removeHints() {
  puzzleMesh.removeHints();
}
function animate() {
  update();
  requestAnimationFrame(animate);
}
d3.select('body').append('button').text('Solve Step').on('click', nextSolutionStep);
d3.select('body').append('button').text('Solve All').on('click', solveAll);
d3.select('body').append('button').text('Stop').on('click', stopSolving);
d3.select('body').append('button').text('Clear').on('click', clear);
animate();

},{"./cycles":1,"./solver":4,"./utils":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Vert: {get: function() {
      return Vert;
    }},
  Edge: {get: function() {
      return Edge;
    }},
  Face: {get: function() {
      return Face;
    }},
  Mesh: {get: function() {
      return Mesh;
    }},
  __esModule: {value: true}
});
var getId = $traceurRuntime.assertObject(require('./utils')).getId;
var Vert = function Vert(x, y, edges) {
  this.x = x;
  this.y = y;
  this.edges = edges;
  this.id = getId();
};
($traceurRuntime.createClass)(Vert, {
  connectedVerts: function() {
    var $__0 = this;
    var vs = [];
    for (var $__2 = this.edges[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var e = $__3.value;
      {
        vs.push(e.vert1);
        vs.push(e.vert2);
      }
    }
    return vs.filter((function(v) {
      return v.id !== $__0.id;
    }));
  },
  getEdgeTo: function(vert) {
    for (var $__2 = this.edges[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var e = $__3.value;
      {
        if (e.vert1 === this && e.vert2 === vert || e.vert1 === vert && e.vert2 === this) {
          return e;
        }
      }
    }
    throw new Error(("Unknown connection from " + this.toString() + " to " + vert.toString()));
  },
  toString: function() {
    return ("[" + this.x + "," + this.y + "]");
  }
}, {});
var Edge = function Edge(vert1, vert2, aFace, aNext, aPrev, bFace, bNext, bPrev) {
  this.vert1 = vert1;
  this.vert2 = vert2;
  this.aFace = aFace;
  this.aNext = aNext;
  this.aPrev = aPrev;
  this.bFace = bFace;
  this.bNext = bNext;
  this.bPrev = bPrev;
  this.id = getId();
  this.vert1.edges.push(this);
  this.vert2.edges.push(this);
};
($traceurRuntime.createClass)(Edge, {verts: function() {
    return [this.vert1, this.vert2];
  }}, {});
var Face = function Face(edges) {
  this.edges = edges;
  this.id = getId();
};
($traceurRuntime.createClass)(Face, {
  verts: function() {
    var vs = [];
    for (var $__2 = this.edges[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var e = $__3.value;
      {
        if (e.aFace === this) {
          vs.push(e.vert1);
        } else {
          vs.push(e.vert2);
        }
      }
    }
    return vs;
  },
  center: function() {
    if (this._center) {
      return this._center;
    }
    var totalX = 0;
    var totalY = 0;
    var verts = this.verts();
    for (var $__2 = verts[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var v = $__3.value;
      {
        totalX += v.x;
        totalY += v.y;
      }
    }
    return this._center = {
      x: totalX / verts.length,
      y: totalY / verts.length
    };
  },
  neighbors: function() {
    if (this._neighbors) {
      return this._neighbors;
    }
    var ns = [];
    for (var $__2 = this.edges[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var e = $__3.value;
      {
        if (e.aFace === this) {
          ns.push(e.bFace);
        } else {
          ns.push(e.aFace);
        }
      }
    }
    this._neighbors = ns;
    return ns;
  },
  neighborsCorners: function() {
    if (this._neighborsCorners) {
      return this._neighborsCorners;
    }
    var ns = [];
    var faceMap = {};
    faceMap[this.id] = true;
    for (var $__4 = this.verts()[Symbol.iterator](),
        $__5; !($__5 = $__4.next()).done; ) {
      var v = $__5.value;
      {
        for (var $__2 = v.edges[Symbol.iterator](),
            $__3; !($__3 = $__2.next()).done; ) {
          var e = $__3.value;
          {
            if (!faceMap[e.aFace.id]) {
              faceMap[e.aFace.id] = true;
              ns.push(e.aFace);
            }
            if (e.bFace && !faceMap[e.bFace.id]) {
              faceMap[e.bFace.id] = true;
              ns.push(e.bFace);
            }
            if (e.bFace === undefined && !faceMap[undefined]) {
              faceMap[undefined] = true;
              ns.push(undefined);
            }
          }
        }
      }
    }
    return ns;
  }
}, {});
function vertKey($__7) {
  var x = $__7[0],
      y = $__7[1];
  return (x + "," + y);
}
function vertPairKey(v1, v2) {
  var $__8;
  if (v1.id > v2.id) {
    ($__8 = [v2, v1], v1 = $__8[0], v2 = $__8[1], $__8);
  }
  return (v1.id + "," + v2.id);
}
var Mesh = function Mesh() {
  this.verts = [];
  this.edges = [];
  this.faces = [];
  this.vertMap = {};
  this.edgeMap = {};
};
($traceurRuntime.createClass)(Mesh, {
  addFace: function() {
    for (var points = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      points[$__6] = arguments[$__6];
    var faceVerts = [];
    var faceEdges = [];
    var key,
        i;
    for (var $__2 = points[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var $__8 = $traceurRuntime.assertObject($__3.value),
          x = $__8[0],
          y = $__8[1];
      {
        key = vertKey([x, y]);
        if (this.vertMap[key]) {
          faceVerts.push(this.vertMap[key]);
        } else {
          var v = new Vert(x, y, []);
          this.verts.push(v);
          this.vertMap[key] = v;
          faceVerts.push(v);
        }
      }
    }
    var face = new Face([]);
    for (i = 0; i < faceVerts.length; i++) {
      var v1 = faceVerts[i];
      var v2 = faceVerts[(i + 1) % faceVerts.length];
      key = vertPairKey(v1, v2);
      if (this.edgeMap[key]) {
        faceEdges.push(this.edgeMap[key]);
      } else {
        e = new Edge(v1, v2);
        faceEdges.push(e);
        this.edges.push(e);
        this.edgeMap[key] = e;
      }
    }
    for (i = 0; i < faceEdges.length; i++) {
      var ePrev = faceEdges[i];
      var e = faceEdges[(i + 1) % faceEdges.length];
      var eNext = faceEdges[(i + 2) % faceEdges.length];
      if (e.aFace) {
        e.bNext = eNext;
        e.bPrev = ePrev;
        e.bFace = face;
      } else {
        e.aNext = eNext;
        e.aPrev = ePrev;
        e.aFace = face;
      }
    }
    face.edges = faceEdges;
    this.faces.push(face);
    return face;
  },
  getEdgeFrom: function($__8, $__9) {
    var x1 = $__8[0],
        y1 = $__8[1];
    var x2 = $__9[0],
        y2 = $__9[1];
    var v1 = this.vertMap[vertKey([x1, y1])];
    var v2 = this.vertMap[vertKey([x2, y2])];
    if (v1 === undefined) {
      throw new Error(("Unknown vert: [" + x1 + "," + y1 + "]"));
    }
    if (v2 === undefined) {
      throw new Error(("Unknown vert: [" + x2 + "," + y2 + "]"));
    }
    var key = vertPairKey(v1, v2);
    var edge = this.edgeMap[key];
    if (edge === undefined) {
      throw new Error(("Unknown edge from [" + x1 + "," + y1 + "] to [" + x2 + "," + y2 + "]"));
    }
    return edge;
  },
  voronoi: function() {
    var points = [];
    var x,
        y,
        center;
    for (var $__2 = this.faces[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var f = $__3.value;
      {
        center = f.center();
        center.type = 'face';
        center.face = f;
        points.push(center);
      }
    }
    for (var $__4 = this.edges[Symbol.iterator](),
        $__5; !($__5 = $__4.next()).done; ) {
      var e = $__5.value;
      {
        x = (e.vert1.x + e.vert2.x) / 2;
        y = (e.vert1.y + e.vert2.y) / 2;
        points.push({
          x: x,
          y: y,
          type: 'edge',
          edge: e
        });
      }
    }
    var xExtent = d3.extent(points, (function(d) {
      return d.x;
    }));
    var yExtent = d3.extent(points, (function(d) {
      return d.y;
    }));
    var voro = d3.geom.voronoi().x((function(d) {
      return d.x;
    })).y((function(d) {
      return d.y;
    })).clipExtent([[xExtent[0] - 1, yExtent[0] - 1], [xExtent[1] + 1, yExtent[1] + 1]]);
    return voro(points);
  }
}, {});

},{"./utils":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  isSolvable: {get: function() {
      return isSolvable;
    }},
  oneSolutionStep: {get: function() {
      return oneSolutionStep;
    }},
  __esModule: {value: true}
});
function isSolvable(puzzle) {
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
  return puzzle.edges.filter((function(e) {
    return e.state === 'none';
  })).length === 0;
}
function oneSolutionStep(puzzle) {
  for (var i = 0; i < solvingMethods.length; i++) {
    var ret;
    try {
      ret = solvingMethods[i](puzzle);
    } catch (e) {
      console.error(e);
      return false;
    }
    if (ret) {
      return true;
    }
  }
  return false;
}
var solvingMethods = [singleVertPatterns, fillNums, emptyNums];
function _getUnsetEdge(d) {
  var unsetEdges = d.edges.filter((function(e) {
    return e.state === 'none';
  }));
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
  var a = d.edges.length;
  var t = 0,
      f = 0,
      n = 0;
  for (var $__0 = d.edges[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    var e = $__1.value;
    {
      if (e.state === true) {
        t++;
      } else if (e.state === false) {
        f++;
      } else if (e.state === 'none') {
        n++;
      }
    }
  }
  return {
    a: a,
    t: t,
    f: f,
    n: n
  };
}
function singleVertPatterns(puzzle) {
  for (var $__0 = puzzle.verts[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    var v = $__1.value;
    {
      var $__4 = $traceurRuntime.assertObject(_componentCounts(v)),
          a = $__4.a,
          t = $__4.t,
          f = $__4.f,
          n = $__4.n;
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
  }
  return false;
}
function fillNums(puzzle) {
  for (var $__0 = puzzle.faces.filter((function(f) {
    return f.hint !== null;
  }))[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    var face = $__1.value;
    {
      var $__4 = $traceurRuntime.assertObject(_componentCounts(face)),
          a = $__4.a,
          t = $__4.t,
          f = $__4.f,
          n = $__4.n;
      if (t > face.hint) {
        throw "Logic error, face with too many edges set.";
      }
      if (f === a - face.hint && n > 0) {
        return _setOneEdge(face);
      }
    }
  }
}
function emptyNums(puzzle) {
  for (var $__0 = puzzle.faces.filter((function(f) {
    return f.hint !== null;
  }))[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    var face = $__1.value;
    {
      var $__4 = $traceurRuntime.assertObject(_componentCounts(face)),
          a = $__4.a,
          t = $__4.t,
          f = $__4.f,
          n = $__4.n;
      if (t === face.hint && n > 0) {
        return _clearOneEdge(face);
      }
    }
  }
}
function facesInCorners(puzzle) {
  for (var $__2 = puzzle.faces.filter((function(f) {
    return f.hint !== null;
  }))[Symbol.iterator](),
      $__3; !($__3 = $__2.next()).done; ) {
    var face = $__3.value;
    {
      var faceCounts = _componentCounts(face);
      if (faceCounts.a - faceCounts.t - faceCounts.n < face.hint) {
        for (var $__0 = face.verts()[Symbol.iterator](),
            $__1; !($__1 = $__0.next()).done; ) {
          var vert = $__1.value;
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

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  getId: {get: function() {
      return getId;
    }},
  shuffle: {get: function() {
      return shuffle;
    }},
  randInt: {get: function() {
      return randInt;
    }},
  randItem: {get: function() {
      return randItem;
    }},
  randItemWeighted: {get: function() {
      return randItemWeighted;
    }},
  __esModule: {value: true}
});
var getId = (function() {
  var _nextId = 1;
  return function getId() {
    return _nextId++;
  };
})();
function shuffle(array) {
  var $__4;
  var index;
  var counter = array.length;
  while (counter > 0) {
    index = randInt(counter);
    counter--;
    ($__4 = [array[index], array[counter]], array[counter] = $__4[0], array[index] = $__4[1], $__4);
  }
  return array;
}
function randInt(a) {
  var $__4;
  var b = arguments[1] !== (void 0) ? arguments[1] : 0;
  if (a > b) {
    ($__4 = [b, a], a = $__4[0], b = $__4[1], $__4);
  }
  return Math.floor(Math.random() * (b - a)) + a;
}
function randItem(arr) {
  return arr[randInt(0, arr.length)];
}
function randItemWeighted(arr, weightFunc) {
  var a;
  var total = 0;
  for (var $__0 = arr[Symbol.iterator](),
      $__1; !($__1 = $__0.next()).done; ) {
    a = $__1.value;
    {
      total += weightFunc(a);
    }
  }
  var choice = Math.random() * total;
  for (var $__2 = arr[Symbol.iterator](),
      $__3; !($__3 = $__2.next()).done; ) {
    a = $__3.value;
    {
      choice -= weightFunc(a);
      if (choice < 0) {
        return a;
      }
    }
  }
  throw new Error('No item picked. Probably a shitty weightFunc.');
}

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9teXRobW9uL3NyYy9jeWNsZXMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvbXl0aG1vbi9zcmMvY3ljbGVzL2J1aWxkL3NyYy9jeWNsZXMuanMiLCIvaG9tZS9teXRobW9uL3NyYy9jeWNsZXMvYnVpbGQvc3JjL2Zha2VfNGE2YTllZGUuanMiLCIvaG9tZS9teXRobW9uL3NyYy9jeWNsZXMvYnVpbGQvc3JjL21lc2guanMiLCIvaG9tZS9teXRobW9uL3NyYy9jeWNsZXMvYnVpbGQvc3JjL3NvbHZlci5qcyIsIi9ob21lL215dGhtb24vc3JjL2N5Y2xlcy9idWlsZC9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4cG9ydHMsIHtcbiAgUHV6emxlOiB7Z2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBQdXp6bGU7XG4gICAgfX0sXG4gIF9fZXNNb2R1bGU6IHt2YWx1ZTogdHJ1ZX1cbn0pO1xudmFyIE1lc2ggPSAkdHJhY2V1clJ1bnRpbWUuYXNzZXJ0T2JqZWN0KHJlcXVpcmUoJy4vbWVzaCcpKS5NZXNoO1xudmFyICRfXzExID0gJHRyYWNldXJSdW50aW1lLmFzc2VydE9iamVjdChyZXF1aXJlKCcuL3V0aWxzJykpLFxuICAgIHNodWZmbGUgPSAkX18xMS5zaHVmZmxlLFxuICAgIHJhbmRJbnQgPSAkX18xMS5yYW5kSW50LFxuICAgIHJhbmRJdGVtID0gJF9fMTEucmFuZEl0ZW0sXG4gICAgcmFuZEl0ZW1XZWlnaHRlZCA9ICRfXzExLnJhbmRJdGVtV2VpZ2h0ZWQ7XG52YXIgaXNTb2x2YWJsZSA9ICR0cmFjZXVyUnVudGltZS5hc3NlcnRPYmplY3QocmVxdWlyZSgnLi9zb2x2ZXInKSkuaXNTb2x2YWJsZTtcbnZhciBQVVpaTEVfU0laRSA9IDg7XG5mdW5jdGlvbiBzcXVhcmUoeCwgeSkge1xuICByZXR1cm4gW1t4LCB5XSwgW3ggKyAxLCB5XSwgW3ggKyAxLCB5ICsgMV0sIFt4LCB5ICsgMV1dO1xufVxudmFyIFB1enpsZSA9IGZ1bmN0aW9uIFB1enpsZSgpIHtcbiAgdmFyICRfXzEyO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKHRoaXMsICRQdXp6bGUucHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIFtdKTtcbiAgdmFyIHN0YXJ0TWFraW5nUHV6emxlID0gK25ldyBEYXRlKCk7XG4gIHZhciB4LFxuICAgICAgeSxcbiAgICAgIGksXG4gICAgICBmLFxuICAgICAgZSxcbiAgICAgIHYxLFxuICAgICAgdjI7XG4gIGZvciAoeCA9IDA7IHggPCBQVVpaTEVfU0laRTsgeCsrKSB7XG4gICAgZm9yICh5ID0gMDsgeSA8IFBVWlpMRV9TSVpFOyB5KyspIHtcbiAgICAgICgkX18xMiA9IHRoaXMpLmFkZEZhY2UuYXBwbHkoJF9fMTIsICR0cmFjZXVyUnVudGltZS50b09iamVjdChzcXVhcmUoeCwgeSkpKTtcbiAgICB9XG4gIH1cbiAgZm9yICh2YXIgJF9fMSA9IHRoaXMuZWRnZXNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgJF9fMjsgISgkX18yID0gJF9fMS5uZXh0KCkpLmRvbmU7ICkge1xuICAgIGUgPSAkX18yLnZhbHVlO1xuICAgIHtcbiAgICAgIGUuc3RhdGUgPSAnbm9uZSc7XG4gICAgfVxuICB9XG4gIGZvciAodmFyICRfXzMgPSB0aGlzLmZhY2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzQ7ICEoJF9fNCA9ICRfXzMubmV4dCgpKS5kb25lOyApIHtcbiAgICBmID0gJF9fNC52YWx1ZTtcbiAgICB7XG4gICAgICBmLmNvbG9yID0gJ2dyZXknO1xuICAgIH1cbiAgfVxuICB0aGlzLmNvbG9yRmFjZXMoKTtcbiAgZm9yICh2YXIgJF9fNSA9IHRoaXMuZWRnZXNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgJF9fNjsgISgkX182ID0gJF9fNS5uZXh0KCkpLmRvbmU7ICkge1xuICAgIGUgPSAkX182LnZhbHVlO1xuICAgIHtcbiAgICAgIGUuc3RhdGUgPSBlLmFGYWNlLmNvbG9yICE9PSAoZS5iRmFjZSB8fCB7Y29sb3I6ICdibGFjayd9KS5jb2xvcjtcbiAgICB9XG4gIH1cbiAgZm9yICh2YXIgJF9fNyA9IHRoaXMuZmFjZXNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgJF9fODsgISgkX184ID0gJF9fNy5uZXh0KCkpLmRvbmU7ICkge1xuICAgIGYgPSAkX184LnZhbHVlO1xuICAgIHtcbiAgICAgIGYuY29sb3IgPSAnZ3JleSc7XG4gICAgICBmLmhpbnQgPSBmLmVkZ2VzLmZpbHRlcigoZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gZS5zdGF0ZSA9PT0gdHJ1ZTtcbiAgICAgIH0pKS5sZW5ndGg7XG4gICAgfVxuICB9XG4gIGZvciAodmFyICRfXzkgPSB0aGlzLmVkZ2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzEwOyAhKCRfXzEwID0gJF9fOS5uZXh0KCkpLmRvbmU7ICkge1xuICAgIGUgPSAkX18xMC52YWx1ZTtcbiAgICB7XG4gICAgICBlLnN0YXRlID0gJ25vbmUnO1xuICAgIH1cbiAgfVxuICB0aGlzLnJlbW92ZUhpbnRzKCk7XG4gIHZhciBkb25lTWFraW5nUHV6emxlID0gbmV3IERhdGUoKTtcbiAgY29uc29sZS5sb2coJ01hZGUgcHV6emxlIGluJywgZG9uZU1ha2luZ1B1enpsZSAtIHN0YXJ0TWFraW5nUHV6emxlLCAnbXMnKTtcbn07XG52YXIgJFB1enpsZSA9IFB1enpsZTtcbigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFB1enpsZSwge1xuICBjYW5Db2xvcjogZnVuY3Rpb24oZmFjZSwgY29sb3IpIHtcbiAgICBpZiAoZmFjZS5jb2xvciAhPT0gJ2dyZXknKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAodmFyICRfXzEgPSBmYWNlLm5laWdoYm9ycygpW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMjsgISgkX18yID0gJF9fMS5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIG4gPSAkX18yLnZhbHVlO1xuICAgICAge1xuICAgICAgICBpZiAobiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbiA9IHtjb2xvcjogJ2JsYWNrJ307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4uY29sb3IgPT09IGNvbG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBjb2xvckZhY2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29sb3I7XG4gICAgdmFyIHRvZG8gPSB0aGlzLmZhY2VzLmxlbmd0aCAtIDE7XG4gICAgdmFyIGY7XG4gICAgdmFyIGNob2ljZXMsXG4gICAgICAgIGNob2ljZTtcbiAgICByYW5kSXRlbSh0aGlzLmZhY2VzKS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgd2hpbGUgKHRvZG8gPiAwKSB7XG4gICAgICBjb2xvciA9IHJhbmRJdGVtKFsnd2hpdGUnLCAnYmxhY2snXSk7XG4gICAgICBpZiAodG9kbyA8PSAwKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjaG9pY2VzID0gW107XG4gICAgICBmb3IgKHZhciAkX18xID0gdGhpcy5mYWNlcy5maWx0ZXIoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGYuY29sb3IgPT09ICdncmV5JztcbiAgICAgIH0pKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgJF9fMjsgISgkX18yID0gJF9fMS5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICBmID0gJF9fMi52YWx1ZTtcbiAgICAgICAge1xuICAgICAgICAgIGlmICh0aGlzLmNhbkNvbG9yKGYsIGNvbG9yKSkge1xuICAgICAgICAgICAgY2hvaWNlcy5wdXNoKHtcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgICBmYWNlOiBmLFxuICAgICAgICAgICAgICBzY29yZTogdGhpcy5mYWNlU2NvcmUoZiwgY29sb3IpICsgTWF0aC5yYW5kb20oKSAtIDAuNVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzaHVmZmxlKGNob2ljZXMpO1xuICAgICAgY2hvaWNlcy5zb3J0KChmdW5jdGlvbihiLCBhKSB7XG4gICAgICAgIHJldHVybiBhLnNjb3JlIC0gYi5zY29yZTtcbiAgICAgIH0pKTtcbiAgICAgIHdoaWxlIChjaG9pY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2hvaWNlID0gY2hvaWNlcy5wb3AoKTtcbiAgICAgICAgY2hvaWNlLmZhY2UuY29sb3IgPSBjaG9pY2UuY29sb3I7XG4gICAgICAgIGlmICh0aGlzLmdyaWRIYXNIb2xlcygpKSB7XG4gICAgICAgICAgY2hvaWNlLmZhY2UuY29sb3IgPSAnZ3JleSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9kby0tO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB0cmFuc2l0aW9uc0Fyb3VuZENvdW50OiBmdW5jdGlvbihmYWNlLCBjb2xvcikge1xuICAgIHZhciBuZWlnaGJvcnMgPSBmYWNlLm5laWdoYm9yc0Nvcm5lcnMoKTtcbiAgICB2YXIgZWRnZUNvdW50cyA9IHt9O1xuICAgIHZhciBlZGdlTWFwID0ge307XG4gICAgdmFyIHBvdGVudGlhbHMgPSBbXTtcbiAgICB2YXIgZnJvbU51bGwgPSAwO1xuICAgIGZvciAodmFyICRfXzMgPSBuZWlnaGJvcnNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAkX180OyAhKCRfXzQgPSAkX18zLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICB2YXIgbiA9ICRfXzQudmFsdWU7XG4gICAgICB7XG4gICAgICAgIGlmIChuKSB7XG4gICAgICAgICAgZm9yICh2YXIgJF9fMSA9IG4uZWRnZXNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAkX18yOyAhKCRfXzIgPSAkX18xLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgICB2YXIgZSA9ICRfXzIudmFsdWU7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlmIChlLmlkKSB7XG4gICAgICAgICAgICAgICAgZWRnZUNvdW50c1tlLmlkXSA9IChlZGdlQ291bnRzW2UuaWRdIHx8IDApICsgMTtcbiAgICAgICAgICAgICAgICBlZGdlTWFwW2UuaWRdID0gZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29sb3IgPT09ICdibGFjaycpIHtcbiAgICAgICAgICAgIGZyb21OdWxsID0gMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgZWRnZUlkIGluIGVkZ2VDb3VudHMpIHtcbiAgICAgIHZhciBjb3VudCA9IGVkZ2VDb3VudHNbZWRnZUlkXTtcbiAgICAgIGlmIChjb3VudCA9PT0gMikge1xuICAgICAgICBwb3RlbnRpYWxzLnB1c2goZWRnZU1hcFtlZGdlSWRdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBvdGVudGlhbHMuZmlsdGVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBhRmFjZSA9IGUuYUZhY2UgfHwge2NvbG9yOiAnYmxhY2snfTtcbiAgICAgIHZhciBiRmFjZSA9IGUuYkZhY2UgfHwge2NvbG9yOiAnYmxhY2snfTtcbiAgICAgIHJldHVybiBhRmFjZS5jb2xvciAhPT0gYkZhY2UuY29sb3I7XG4gICAgfSkubGVuZ3RoO1xuICB9LFxuICBmYWNlU2NvcmU6IGZ1bmN0aW9uKGZhY2UsIGNvbG9yKSB7XG4gICAgdmFyIGNvc3QgPSAxO1xuICAgIHZhciBuZWlnaGJvcnMgPSBmYWNlLm5laWdoYm9yc0Nvcm5lcnMoKTtcbiAgICB2YXIgc2NvcmUgPSBuZWlnaGJvcnMubGVuZ3RoICsgMTtcbiAgICBmb3IgKHZhciAkX18xID0gbmVpZ2hib3JzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMjsgISgkX18yID0gJF9fMS5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIG4gPSAkX18yLnZhbHVlO1xuICAgICAge1xuICAgICAgICBpZiAobiAmJiBuLmNvbG9yICE9PSBjb2xvcikge1xuICAgICAgICAgIHNjb3JlIC09IGNvc3Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNjb3JlO1xuICB9LFxuICBncmlkSGFzSG9sZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYXNQYXRoVG9OdWxsID0gZnVuY3Rpb24oc3RhcnQpIHtcbiAgICAgIHZhciB0b2RvID0gW3N0YXJ0XTtcbiAgICAgIHZhciBzZWVuID0ge307XG4gICAgICB3aGlsZSAodG9kby5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGYgPSB0b2RvLnBvcCgpO1xuICAgICAgICBpZiAoc2VlbltmLmlkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW5bZi5pZF0gPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciAkX18xID0gZi5uZWlnaGJvcnMoKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAkX18yOyAhKCRfXzIgPSAkX18xLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgdmFyIG4gPSAkX18yLnZhbHVlO1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlmICghbikge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuLmNvbG9yID09PSAnZ3JleScgJiYgIXNlZW5bbi5pZF0pIHtcbiAgICAgICAgICAgICAgdG9kby5wdXNoKG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgZm9yICh2YXIgJF9fMSA9IHRoaXMuZmFjZXMuZmlsdGVyKChmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZi5jb2xvciA9PT0gJ2dyZXknO1xuICAgIH0pKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICRfXzI7ICEoJF9fMiA9ICRfXzEubmV4dCgpKS5kb25lOyApIHtcbiAgICAgIHZhciBmID0gJF9fMi52YWx1ZTtcbiAgICAgIHtcbiAgICAgICAgaWYgKCFoYXNQYXRoVG9OdWxsKGYpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICByZXNldEVkZ2VzOiBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnY2xlYXJpbmcnKTtcbiAgICBmb3IgKHZhciAkX18xID0gdGhpcy5lZGdlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICRfXzI7ICEoJF9fMiA9ICRfXzEubmV4dCgpKS5kb25lOyApIHtcbiAgICAgIHZhciBlID0gJF9fMi52YWx1ZTtcbiAgICAgIHtcbiAgICAgICAgZS5zdGF0ZSA9ICdub25lJztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlbW92ZUhpbnRzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhlSGludFdhcztcbiAgICB2YXIgZmFjZXMgPSBzaHVmZmxlKHRoaXMuZmFjZXMpO1xuICAgIHRoaXMucmVzZXRFZGdlcygpO1xuICAgIGlmICghaXNTb2x2YWJsZSh0aGlzKSkge1xuICAgICAgdGhpcy5yZXNldEVkZ2VzKCk7XG4gICAgICBhbGVydCgnSSBzY3Jld2VkIHVwLiBQbGVhc2UgcmVmcmVzaC4nKTtcbiAgICAgIHRocm93ICdQdXp6bGUgbm90IHNvbHZhYmxlIHdpdGggYWxsIGhpbnRzLic7XG4gICAgfVxuICAgIHRoaXMucmVzZXRFZGdlcygpO1xuICAgIGZvciAodmFyICRfXzEgPSBmYWNlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICRfXzI7ICEoJF9fMiA9ICRfXzEubmV4dCgpKS5kb25lOyApIHtcbiAgICAgIHZhciBmID0gJF9fMi52YWx1ZTtcbiAgICAgIHtcbiAgICAgICAgdGhlSGludFdhcyA9IGYuaGludDtcbiAgICAgICAgZi5oaW50ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpc1NvbHZhYmxlKHRoaXMpKSB7XG4gICAgICAgICAgZi5oaW50ID0gdGhlSGludFdhcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0RWRnZXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0sIHt9LCBNZXNoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFB1enpsZSA9ICR0cmFjZXVyUnVudGltZS5hc3NlcnRPYmplY3QocmVxdWlyZSgnLi9jeWNsZXMnKSkuUHV6emxlO1xudmFyIG9uZVNvbHV0aW9uU3RlcCA9ICR0cmFjZXVyUnVudGltZS5hc3NlcnRPYmplY3QocmVxdWlyZSgnLi9zb2x2ZXInKSkub25lU29sdXRpb25TdGVwO1xudmFyIHJhbmRJdGVtID0gJHRyYWNldXJSdW50aW1lLmFzc2VydE9iamVjdChyZXF1aXJlKCcuL3V0aWxzJykpLnJhbmRJdGVtO1xudmFyIHB1enpsZU1lc2ggPSBuZXcgUHV6emxlKCk7XG5jb25zb2xlLmxvZyhwdXp6bGVNZXNoKTtcbnZhciBzdmcgPSBkMy5zZWxlY3QoJ2JvZHknKS5hcHBlbmQoJ3N2ZycpO1xudmFyIHhzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihkMy5leHRlbnQocHV6emxlTWVzaC52ZXJ0cywgKGZ1bmN0aW9uKGQpIHtcbiAgcmV0dXJuIGQueDtcbn0pKSk7XG52YXIgeHNjYWxlWmVybyA9IHhzY2FsZS5jb3B5KCk7XG52YXIgeXNjYWxlID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKGQzLmV4dGVudChwdXp6bGVNZXNoLnZlcnRzLCAoZnVuY3Rpb24oZCkge1xuICByZXR1cm4gZC55O1xufSkpKTtcbnZhciB5c2NhbGVaZXJvID0geXNjYWxlLmNvcHkoKTtcbnZhciBsaW5lT3BlbiA9IGQzLnN2Zy5saW5lKCkueCgoZnVuY3Rpb24odikge1xuICByZXR1cm4geHNjYWxlKHYueCk7XG59KSkueSgoZnVuY3Rpb24odikge1xuICByZXR1cm4geXNjYWxlKHYueSk7XG59KSk7XG52YXIgbGluZUNsb3NlZCA9IGxpbmVPcGVuLmludGVycG9sYXRlKCdsaW5lYXItY2xvc2VkJyk7XG52YXIgZWxlbXMgPSB7XG4gIGZhY2VzOiBzdmcuYXBwZW5kKCdnJykuY2xhc3NlZCgnZmFjZXMnLCB0cnVlKSxcbiAgZmFjZU51bXM6IHN2Zy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdmYWNlLW51bXMnLCB0cnVlKSxcbiAgZWRnZXM6IHN2Zy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdlZGdlcycsIHRydWUpLFxuICB2ZXJ0czogc3ZnLmFwcGVuZCgnZycpLmNsYXNzZWQoJ3ZlcnRzJywgdHJ1ZSksXG4gIHZvcm9ub2k6IHN2Zy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCd2b3Jvbm9pcycsIHRydWUpXG59O1xuZnVuY3Rpb24gcmVzY2FsZUdyYXBoKCkge1xuICB2YXIgc2l6ZTtcbiAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgc2l6ZSA9IHdpbmRvdy5pbm5lckhlaWdodCAqIDAuOTtcbiAgfSBlbHNlIHtcbiAgICBzaXplID0gd2luZG93LmlubmVyV2lkdGggKiAwLjk7XG4gIH1cbiAgdmFyIG1hcmdpbiA9IHNpemUgKiAwLjE7XG4gIHhzY2FsZS5yYW5nZShbbWFyZ2luLCBzaXplIC0gbWFyZ2luXSk7XG4gIHlzY2FsZS5yYW5nZShbbWFyZ2luLCBzaXplIC0gbWFyZ2luXSk7XG4gIHhzY2FsZVplcm8ucmFuZ2UoWzAsIHNpemUgLSAyICogbWFyZ2luXSk7XG4gIHlzY2FsZVplcm8ucmFuZ2UoWzAsIHNpemUgLSAyICogbWFyZ2luXSk7XG4gIHN2Zy5hdHRyKCd3aWR0aCcsIHNpemUpLmF0dHIoJ2hlaWdodCcsIHNpemUpO1xuICB1cGRhdGUoKTtcbn1cbnJlc2NhbGVHcmFwaCgpO1xud2luZG93Lm9ucmVzaXplID0gcmVzY2FsZUdyYXBoO1xuZnVuY3Rpb24gdXBkYXRlKCkge1xuICB2YXIgZmFjZXMgPSBlbGVtcy5mYWNlcy5zZWxlY3RBbGwoJy5mYWNlJykuZGF0YShwdXp6bGVNZXNoLmZhY2VzLCAoZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmLmlkO1xuICB9KSk7XG4gIHZhciBmYWNlTnVtcyA9IGVsZW1zLmZhY2VOdW1zLnNlbGVjdEFsbCgnLmZhY2UtbnVtJykuZGF0YShwdXp6bGVNZXNoLmZhY2VzLCAoZnVuY3Rpb24oZikge1xuICAgIHJldHVybiAnbicgKyBmLmlkO1xuICB9KSk7XG4gIHZhciBlZGdlcyA9IGVsZW1zLmVkZ2VzLnNlbGVjdEFsbCgnLmVkZ2UnKS5kYXRhKHB1enpsZU1lc2guZWRnZXMsIChmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUuaWQ7XG4gIH0pKTtcbiAgdmFyIHZlcnRzID0gZWxlbXMudmVydHMuc2VsZWN0QWxsKCcudmVydCcpLmRhdGEocHV6emxlTWVzaC52ZXJ0cywgKGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdi5pZDtcbiAgfSkpO1xuICB2YXIgdm9yb25vaSA9IGVsZW1zLnZvcm9ub2kuc2VsZWN0QWxsKCcudm9yb25vaScpLmRhdGEocHV6emxlTWVzaC52b3Jvbm9pKCkpO1xuICBmYWNlcy5lbnRlcigpLmFwcGVuZCgncGF0aCcpLmNsYXNzZWQoJ2ZhY2UnLCB0cnVlKTtcbiAgZmFjZU51bXMuZW50ZXIoKS5hcHBlbmQoJ3RleHQnKS5jbGFzc2VkKCdmYWNlLW51bScsIHRydWUpO1xuICBlZGdlcy5lbnRlcigpLmFwcGVuZCgncGF0aCcpLmNsYXNzZWQoJ2VkZ2UnLCB0cnVlKTtcbiAgdmVydHMuZW50ZXIoKS5hcHBlbmQoJ2NpcmNsZScpLmNsYXNzZWQoJ3ZlcnQnLCB0cnVlKTtcbiAgdm9yb25vaS5lbnRlcigpLmFwcGVuZCgncGF0aCcpLmNsYXNzZWQoJ3Zvcm9ub2knLCB0cnVlKTtcbiAgZmFjZXMuYXR0cignZCcsIChmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGxpbmVDbG9zZWQoZi52ZXJ0cygpKTtcbiAgfSkpO1xuICBmYWNlTnVtcy5hdHRyKCd4JywgKGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4geHNjYWxlKGYuY2VudGVyKCkueCk7XG4gIH0pKS5hdHRyKCd5JywgKGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4geXNjYWxlKGYuY2VudGVyKCkueSk7XG4gIH0pKS50ZXh0KChmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGYuaGludDtcbiAgfSkpLnN0eWxlKCdmb250LXNpemUnLCAoZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB5c2NhbGVaZXJvKDAuNikgKyAncHgnO1xuICB9KSk7XG4gIGVkZ2VzLmF0dHIoJ2QnLCAoZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiBsaW5lT3BlbihlLnZlcnRzKCkpO1xuICB9KSkuYXR0cignZWRnZS1zdGF0ZScsIChmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUuc3RhdGU7XG4gIH0pKTtcbiAgdmVydHMuYXR0cignY3gnLCAoZnVuY3Rpb24odikge1xuICAgIHJldHVybiB4c2NhbGUodi54KTtcbiAgfSkpLmF0dHIoJ2N5JywgKGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4geXNjYWxlKHYueSk7XG4gIH0pKS5hdHRyKCdyJywgMyk7XG4gIHZvcm9ub2kuYXR0cignZCcsIChmdW5jdGlvbihwb2x5KSB7XG4gICAgcmV0dXJuICdNJyArIHBvbHkubWFwKChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4gW3hzY2FsZShwWzBdKSwgeXNjYWxlKHBbMV0pXTtcbiAgICB9KSkuam9pbignTCcpO1xuICB9KSkuZGF0dW0oKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5wb2ludDtcbiAgfSkpLm9uKCdjbGljaycsIHZvcm9ub2lPbkNsaWNrKTtcbiAgO1xuICBmYWNlcy5leGl0KCkucmVtb3ZlKCk7XG4gIGZhY2VOdW1zLmV4aXQoKS5yZW1vdmUoKTtcbiAgZWRnZXMuZXhpdCgpLnJlbW92ZSgpO1xuICB2ZXJ0cy5leGl0KCkucmVtb3ZlKCk7XG4gIHZvcm9ub2kuZXhpdCgpLnJlbW92ZSgpO1xufVxuZnVuY3Rpb24gdm9yb25vaU9uQ2xpY2soZCkge1xuICB2YXIgZWRnZVN0YXRlVHJhbnNpdGlvbnMgPSB7XG4gICAgdHJ1ZTogZmFsc2UsXG4gICAgZmFsc2U6ICdub25lJyxcbiAgICAnbm9uZSc6IHRydWVcbiAgfTtcbiAgaWYgKGQudHlwZSA9PT0gJ2VkZ2UnKSB7XG4gICAgZC5lZGdlLnN0YXRlID0gZWRnZVN0YXRlVHJhbnNpdGlvbnNbZC5lZGdlLnN0YXRlXTtcbiAgfVxuICB1cGRhdGUoKTtcbn1cbmZ1bmN0aW9uIG5leHRTb2x1dGlvblN0ZXAoKSB7XG4gIHZhciBtYWRlQ2hhbmdlID0gb25lU29sdXRpb25TdGVwKHB1enpsZU1lc2gpO1xuICB1cGRhdGUoKTtcbiAgcmV0dXJuIG1hZGVDaGFuZ2U7XG59XG52YXIgc3RvcCA9IGZhbHNlO1xuZnVuY3Rpb24gc29sdmVBbGwoKSB7XG4gIHZhciBtYWRlQ2hhbmdlID0gbmV4dFNvbHV0aW9uU3RlcCgpO1xuICBpZiAoIXN0b3AgJiYgbWFkZUNoYW5nZSkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzb2x2ZUFsbCk7XG4gIH1cbn1cbmZ1bmN0aW9uIHN0b3BTb2x2aW5nKCkge1xuICBzdG9wID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNsZWFyKCkge1xuICBmb3IgKHZhciAkX18wID0gcHV6emxlTWVzaC5lZGdlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAkX18xOyAhKCRfXzEgPSAkX18wLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgdmFyIGUgPSAkX18xLnZhbHVlO1xuICAgIHtcbiAgICAgIGUuc3RhdGUgPSAnbm9uZSc7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiByZW1vdmVIaW50cygpIHtcbiAgcHV6emxlTWVzaC5yZW1vdmVIaW50cygpO1xufVxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgdXBkYXRlKCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbn1cbmQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnYnV0dG9uJykudGV4dCgnU29sdmUgU3RlcCcpLm9uKCdjbGljaycsIG5leHRTb2x1dGlvblN0ZXApO1xuZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdidXR0b24nKS50ZXh0KCdTb2x2ZSBBbGwnKS5vbignY2xpY2snLCBzb2x2ZUFsbCk7XG5kMy5zZWxlY3QoJ2JvZHknKS5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ1N0b3AnKS5vbignY2xpY2snLCBzdG9wU29sdmluZyk7XG5kMy5zZWxlY3QoJ2JvZHknKS5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ0NsZWFyJykub24oJ2NsaWNrJywgY2xlYXIpO1xuYW5pbWF0ZSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHBvcnRzLCB7XG4gIFZlcnQ6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFZlcnQ7XG4gICAgfX0sXG4gIEVkZ2U6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEVkZ2U7XG4gICAgfX0sXG4gIEZhY2U6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEZhY2U7XG4gICAgfX0sXG4gIE1lc2g6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE1lc2g7XG4gICAgfX0sXG4gIF9fZXNNb2R1bGU6IHt2YWx1ZTogdHJ1ZX1cbn0pO1xudmFyIGdldElkID0gJHRyYWNldXJSdW50aW1lLmFzc2VydE9iamVjdChyZXF1aXJlKCcuL3V0aWxzJykpLmdldElkO1xudmFyIFZlcnQgPSBmdW5jdGlvbiBWZXJ0KHgsIHksIGVkZ2VzKSB7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG4gIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgdGhpcy5pZCA9IGdldElkKCk7XG59O1xuKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoVmVydCwge1xuICBjb25uZWN0ZWRWZXJ0czogZnVuY3Rpb24oKSB7XG4gICAgdmFyICRfXzAgPSB0aGlzO1xuICAgIHZhciB2cyA9IFtdO1xuICAgIGZvciAodmFyICRfXzIgPSB0aGlzLmVkZ2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIGUgPSAkX18zLnZhbHVlO1xuICAgICAge1xuICAgICAgICB2cy5wdXNoKGUudmVydDEpO1xuICAgICAgICB2cy5wdXNoKGUudmVydDIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdnMuZmlsdGVyKChmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gdi5pZCAhPT0gJF9fMC5pZDtcbiAgICB9KSk7XG4gIH0sXG4gIGdldEVkZ2VUbzogZnVuY3Rpb24odmVydCkge1xuICAgIGZvciAodmFyICRfXzIgPSB0aGlzLmVkZ2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIGUgPSAkX18zLnZhbHVlO1xuICAgICAge1xuICAgICAgICBpZiAoZS52ZXJ0MSA9PT0gdGhpcyAmJiBlLnZlcnQyID09PSB2ZXJ0IHx8IGUudmVydDEgPT09IHZlcnQgJiYgZS52ZXJ0MiA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigoXCJVbmtub3duIGNvbm5lY3Rpb24gZnJvbSBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiIHRvIFwiICsgdmVydC50b1N0cmluZygpKSk7XG4gIH0sXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFwiW1wiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIl1cIik7XG4gIH1cbn0sIHt9KTtcbnZhciBFZGdlID0gZnVuY3Rpb24gRWRnZSh2ZXJ0MSwgdmVydDIsIGFGYWNlLCBhTmV4dCwgYVByZXYsIGJGYWNlLCBiTmV4dCwgYlByZXYpIHtcbiAgdGhpcy52ZXJ0MSA9IHZlcnQxO1xuICB0aGlzLnZlcnQyID0gdmVydDI7XG4gIHRoaXMuYUZhY2UgPSBhRmFjZTtcbiAgdGhpcy5hTmV4dCA9IGFOZXh0O1xuICB0aGlzLmFQcmV2ID0gYVByZXY7XG4gIHRoaXMuYkZhY2UgPSBiRmFjZTtcbiAgdGhpcy5iTmV4dCA9IGJOZXh0O1xuICB0aGlzLmJQcmV2ID0gYlByZXY7XG4gIHRoaXMuaWQgPSBnZXRJZCgpO1xuICB0aGlzLnZlcnQxLmVkZ2VzLnB1c2godGhpcyk7XG4gIHRoaXMudmVydDIuZWRnZXMucHVzaCh0aGlzKTtcbn07XG4oJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShFZGdlLCB7dmVydHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBbdGhpcy52ZXJ0MSwgdGhpcy52ZXJ0Ml07XG4gIH19LCB7fSk7XG52YXIgRmFjZSA9IGZ1bmN0aW9uIEZhY2UoZWRnZXMpIHtcbiAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB0aGlzLmlkID0gZ2V0SWQoKTtcbn07XG4oJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShGYWNlLCB7XG4gIHZlcnRzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdnMgPSBbXTtcbiAgICBmb3IgKHZhciAkX18yID0gdGhpcy5lZGdlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICRfXzM7ICEoJF9fMyA9ICRfXzIubmV4dCgpKS5kb25lOyApIHtcbiAgICAgIHZhciBlID0gJF9fMy52YWx1ZTtcbiAgICAgIHtcbiAgICAgICAgaWYgKGUuYUZhY2UgPT09IHRoaXMpIHtcbiAgICAgICAgICB2cy5wdXNoKGUudmVydDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZzLnB1c2goZS52ZXJ0Mik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZzO1xuICB9LFxuICBjZW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jZW50ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jZW50ZXI7XG4gICAgfVxuICAgIHZhciB0b3RhbFggPSAwO1xuICAgIHZhciB0b3RhbFkgPSAwO1xuICAgIHZhciB2ZXJ0cyA9IHRoaXMudmVydHMoKTtcbiAgICBmb3IgKHZhciAkX18yID0gdmVydHNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICB2YXIgdiA9ICRfXzMudmFsdWU7XG4gICAgICB7XG4gICAgICAgIHRvdGFsWCArPSB2Lng7XG4gICAgICAgIHRvdGFsWSArPSB2Lnk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jZW50ZXIgPSB7XG4gICAgICB4OiB0b3RhbFggLyB2ZXJ0cy5sZW5ndGgsXG4gICAgICB5OiB0b3RhbFkgLyB2ZXJ0cy5sZW5ndGhcbiAgICB9O1xuICB9LFxuICBuZWlnaGJvcnM6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9uZWlnaGJvcnMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9uZWlnaGJvcnM7XG4gICAgfVxuICAgIHZhciBucyA9IFtdO1xuICAgIGZvciAodmFyICRfXzIgPSB0aGlzLmVkZ2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIGUgPSAkX18zLnZhbHVlO1xuICAgICAge1xuICAgICAgICBpZiAoZS5hRmFjZSA9PT0gdGhpcykge1xuICAgICAgICAgIG5zLnB1c2goZS5iRmFjZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbnMucHVzaChlLmFGYWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9uZWlnaGJvcnMgPSBucztcbiAgICByZXR1cm4gbnM7XG4gIH0sXG4gIG5laWdoYm9yc0Nvcm5lcnM6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9uZWlnaGJvcnNDb3JuZXJzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbmVpZ2hib3JzQ29ybmVycztcbiAgICB9XG4gICAgdmFyIG5zID0gW107XG4gICAgdmFyIGZhY2VNYXAgPSB7fTtcbiAgICBmYWNlTWFwW3RoaXMuaWRdID0gdHJ1ZTtcbiAgICBmb3IgKHZhciAkX180ID0gdGhpcy52ZXJ0cygpW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fNTsgISgkX181ID0gJF9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyIHYgPSAkX181LnZhbHVlO1xuICAgICAge1xuICAgICAgICBmb3IgKHZhciAkX18yID0gdi5lZGdlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgdmFyIGUgPSAkX18zLnZhbHVlO1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlmICghZmFjZU1hcFtlLmFGYWNlLmlkXSkge1xuICAgICAgICAgICAgICBmYWNlTWFwW2UuYUZhY2UuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgbnMucHVzaChlLmFGYWNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlLmJGYWNlICYmICFmYWNlTWFwW2UuYkZhY2UuaWRdKSB7XG4gICAgICAgICAgICAgIGZhY2VNYXBbZS5iRmFjZS5pZF0gPSB0cnVlO1xuICAgICAgICAgICAgICBucy5wdXNoKGUuYkZhY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGUuYkZhY2UgPT09IHVuZGVmaW5lZCAmJiAhZmFjZU1hcFt1bmRlZmluZWRdKSB7XG4gICAgICAgICAgICAgIGZhY2VNYXBbdW5kZWZpbmVkXSA9IHRydWU7XG4gICAgICAgICAgICAgIG5zLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5zO1xuICB9XG59LCB7fSk7XG5mdW5jdGlvbiB2ZXJ0S2V5KCRfXzcpIHtcbiAgdmFyIHggPSAkX183WzBdLFxuICAgICAgeSA9ICRfXzdbMV07XG4gIHJldHVybiAoeCArIFwiLFwiICsgeSk7XG59XG5mdW5jdGlvbiB2ZXJ0UGFpcktleSh2MSwgdjIpIHtcbiAgdmFyICRfXzg7XG4gIGlmICh2MS5pZCA+IHYyLmlkKSB7XG4gICAgKCRfXzggPSBbdjIsIHYxXSwgdjEgPSAkX184WzBdLCB2MiA9ICRfXzhbMV0sICRfXzgpO1xuICB9XG4gIHJldHVybiAodjEuaWQgKyBcIixcIiArIHYyLmlkKTtcbn1cbnZhciBNZXNoID0gZnVuY3Rpb24gTWVzaCgpIHtcbiAgdGhpcy52ZXJ0cyA9IFtdO1xuICB0aGlzLmVkZ2VzID0gW107XG4gIHRoaXMuZmFjZXMgPSBbXTtcbiAgdGhpcy52ZXJ0TWFwID0ge307XG4gIHRoaXMuZWRnZU1hcCA9IHt9O1xufTtcbigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKE1lc2gsIHtcbiAgYWRkRmFjZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcG9pbnRzID0gW10sXG4gICAgICAgICRfXzYgPSAwOyAkX182IDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fNisrKVxuICAgICAgcG9pbnRzWyRfXzZdID0gYXJndW1lbnRzWyRfXzZdO1xuICAgIHZhciBmYWNlVmVydHMgPSBbXTtcbiAgICB2YXIgZmFjZUVkZ2VzID0gW107XG4gICAgdmFyIGtleSxcbiAgICAgICAgaTtcbiAgICBmb3IgKHZhciAkX18yID0gcG9pbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgdmFyICRfXzggPSAkdHJhY2V1clJ1bnRpbWUuYXNzZXJ0T2JqZWN0KCRfXzMudmFsdWUpLFxuICAgICAgICAgIHggPSAkX184WzBdLFxuICAgICAgICAgIHkgPSAkX184WzFdO1xuICAgICAge1xuICAgICAgICBrZXkgPSB2ZXJ0S2V5KFt4LCB5XSk7XG4gICAgICAgIGlmICh0aGlzLnZlcnRNYXBba2V5XSkge1xuICAgICAgICAgIGZhY2VWZXJ0cy5wdXNoKHRoaXMudmVydE1hcFtrZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdiA9IG5ldyBWZXJ0KHgsIHksIFtdKTtcbiAgICAgICAgICB0aGlzLnZlcnRzLnB1c2godik7XG4gICAgICAgICAgdGhpcy52ZXJ0TWFwW2tleV0gPSB2O1xuICAgICAgICAgIGZhY2VWZXJ0cy5wdXNoKHYpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBmYWNlID0gbmV3IEZhY2UoW10pO1xuICAgIGZvciAoaSA9IDA7IGkgPCBmYWNlVmVydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2MSA9IGZhY2VWZXJ0c1tpXTtcbiAgICAgIHZhciB2MiA9IGZhY2VWZXJ0c1soaSArIDEpICUgZmFjZVZlcnRzLmxlbmd0aF07XG4gICAgICBrZXkgPSB2ZXJ0UGFpcktleSh2MSwgdjIpO1xuICAgICAgaWYgKHRoaXMuZWRnZU1hcFtrZXldKSB7XG4gICAgICAgIGZhY2VFZGdlcy5wdXNoKHRoaXMuZWRnZU1hcFtrZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGUgPSBuZXcgRWRnZSh2MSwgdjIpO1xuICAgICAgICBmYWNlRWRnZXMucHVzaChlKTtcbiAgICAgICAgdGhpcy5lZGdlcy5wdXNoKGUpO1xuICAgICAgICB0aGlzLmVkZ2VNYXBba2V5XSA9IGU7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBmYWNlRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlUHJldiA9IGZhY2VFZGdlc1tpXTtcbiAgICAgIHZhciBlID0gZmFjZUVkZ2VzWyhpICsgMSkgJSBmYWNlRWRnZXMubGVuZ3RoXTtcbiAgICAgIHZhciBlTmV4dCA9IGZhY2VFZGdlc1soaSArIDIpICUgZmFjZUVkZ2VzLmxlbmd0aF07XG4gICAgICBpZiAoZS5hRmFjZSkge1xuICAgICAgICBlLmJOZXh0ID0gZU5leHQ7XG4gICAgICAgIGUuYlByZXYgPSBlUHJldjtcbiAgICAgICAgZS5iRmFjZSA9IGZhY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLmFOZXh0ID0gZU5leHQ7XG4gICAgICAgIGUuYVByZXYgPSBlUHJldjtcbiAgICAgICAgZS5hRmFjZSA9IGZhY2U7XG4gICAgICB9XG4gICAgfVxuICAgIGZhY2UuZWRnZXMgPSBmYWNlRWRnZXM7XG4gICAgdGhpcy5mYWNlcy5wdXNoKGZhY2UpO1xuICAgIHJldHVybiBmYWNlO1xuICB9LFxuICBnZXRFZGdlRnJvbTogZnVuY3Rpb24oJF9fOCwgJF9fOSkge1xuICAgIHZhciB4MSA9ICRfXzhbMF0sXG4gICAgICAgIHkxID0gJF9fOFsxXTtcbiAgICB2YXIgeDIgPSAkX185WzBdLFxuICAgICAgICB5MiA9ICRfXzlbMV07XG4gICAgdmFyIHYxID0gdGhpcy52ZXJ0TWFwW3ZlcnRLZXkoW3gxLCB5MV0pXTtcbiAgICB2YXIgdjIgPSB0aGlzLnZlcnRNYXBbdmVydEtleShbeDIsIHkyXSldO1xuICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoKFwiVW5rbm93biB2ZXJ0OiBbXCIgKyB4MSArIFwiLFwiICsgeTEgKyBcIl1cIikpO1xuICAgIH1cbiAgICBpZiAodjIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKChcIlVua25vd24gdmVydDogW1wiICsgeDIgKyBcIixcIiArIHkyICsgXCJdXCIpKTtcbiAgICB9XG4gICAgdmFyIGtleSA9IHZlcnRQYWlyS2V5KHYxLCB2Mik7XG4gICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2VNYXBba2V5XTtcbiAgICBpZiAoZWRnZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoKFwiVW5rbm93biBlZGdlIGZyb20gW1wiICsgeDEgKyBcIixcIiArIHkxICsgXCJdIHRvIFtcIiArIHgyICsgXCIsXCIgKyB5MiArIFwiXVwiKSk7XG4gICAgfVxuICAgIHJldHVybiBlZGdlO1xuICB9LFxuICB2b3Jvbm9pOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gW107XG4gICAgdmFyIHgsXG4gICAgICAgIHksXG4gICAgICAgIGNlbnRlcjtcbiAgICBmb3IgKHZhciAkX18yID0gdGhpcy5mYWNlc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICRfXzM7ICEoJF9fMyA9ICRfXzIubmV4dCgpKS5kb25lOyApIHtcbiAgICAgIHZhciBmID0gJF9fMy52YWx1ZTtcbiAgICAgIHtcbiAgICAgICAgY2VudGVyID0gZi5jZW50ZXIoKTtcbiAgICAgICAgY2VudGVyLnR5cGUgPSAnZmFjZSc7XG4gICAgICAgIGNlbnRlci5mYWNlID0gZjtcbiAgICAgICAgcG9pbnRzLnB1c2goY2VudGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgJF9fNCA9IHRoaXMuZWRnZXNbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAkX181OyAhKCRfXzUgPSAkX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICB2YXIgZSA9ICRfXzUudmFsdWU7XG4gICAgICB7XG4gICAgICAgIHggPSAoZS52ZXJ0MS54ICsgZS52ZXJ0Mi54KSAvIDI7XG4gICAgICAgIHkgPSAoZS52ZXJ0MS55ICsgZS52ZXJ0Mi55KSAvIDI7XG4gICAgICAgIHBvaW50cy5wdXNoKHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHksXG4gICAgICAgICAgdHlwZTogJ2VkZ2UnLFxuICAgICAgICAgIGVkZ2U6IGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB4RXh0ZW50ID0gZDMuZXh0ZW50KHBvaW50cywgKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLng7XG4gICAgfSkpO1xuICAgIHZhciB5RXh0ZW50ID0gZDMuZXh0ZW50KHBvaW50cywgKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLnk7XG4gICAgfSkpO1xuICAgIHZhciB2b3JvID0gZDMuZ2VvbS52b3Jvbm9pKCkueCgoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQueDtcbiAgICB9KSkueSgoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQueTtcbiAgICB9KSkuY2xpcEV4dGVudChbW3hFeHRlbnRbMF0gLSAxLCB5RXh0ZW50WzBdIC0gMV0sIFt4RXh0ZW50WzFdICsgMSwgeUV4dGVudFsxXSArIDFdXSk7XG4gICAgcmV0dXJuIHZvcm8ocG9pbnRzKTtcbiAgfVxufSwge30pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHBvcnRzLCB7XG4gIGlzU29sdmFibGU6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGlzU29sdmFibGU7XG4gICAgfX0sXG4gIG9uZVNvbHV0aW9uU3RlcDoge2dldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gb25lU29sdXRpb25TdGVwO1xuICAgIH19LFxuICBfX2VzTW9kdWxlOiB7dmFsdWU6IHRydWV9XG59KTtcbmZ1bmN0aW9uIGlzU29sdmFibGUocHV6emxlKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghb25lU29sdXRpb25TdGVwKHB1enpsZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coJ0FISEhIJywgZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBwdXp6bGUuZWRnZXMuZmlsdGVyKChmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUuc3RhdGUgPT09ICdub25lJztcbiAgfSkpLmxlbmd0aCA9PT0gMDtcbn1cbmZ1bmN0aW9uIG9uZVNvbHV0aW9uU3RlcChwdXp6bGUpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb2x2aW5nTWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByZXQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldCA9IHNvbHZpbmdNZXRob2RzW2ldKHB1enpsZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHJldCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbnZhciBzb2x2aW5nTWV0aG9kcyA9IFtzaW5nbGVWZXJ0UGF0dGVybnMsIGZpbGxOdW1zLCBlbXB0eU51bXNdO1xuZnVuY3Rpb24gX2dldFVuc2V0RWRnZShkKSB7XG4gIHZhciB1bnNldEVkZ2VzID0gZC5lZGdlcy5maWx0ZXIoKGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZS5zdGF0ZSA9PT0gJ25vbmUnO1xuICB9KSk7XG4gIGlmICh1bnNldEVkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2luZWxpZ2libGUgb2JqZWN0IHRvIHNldE9uOicsIGQpO1xuICAgIHRocm93ICdMb2dpYyBlcnJvciwgdHJpZWQgdG8gc2V0L2NsZWFyIG9uIGluZWxpZ2libGUgb2JqZWN0Lic7XG4gIH1cbiAgcmV0dXJuIHVuc2V0RWRnZXNbMF07XG59XG5mdW5jdGlvbiBfc2V0T25lRWRnZShkKSB7XG4gIF9nZXRVbnNldEVkZ2UoZCkuc3RhdGUgPSB0cnVlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIF9jbGVhck9uZUVkZ2UoZCkge1xuICBfZ2V0VW5zZXRFZGdlKGQpLnN0YXRlID0gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gX2NvbXBvbmVudENvdW50cyhkKSB7XG4gIHZhciBhID0gZC5lZGdlcy5sZW5ndGg7XG4gIHZhciB0ID0gMCxcbiAgICAgIGYgPSAwLFxuICAgICAgbiA9IDA7XG4gIGZvciAodmFyICRfXzAgPSBkLmVkZ2VzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzE7ICEoJF9fMSA9ICRfXzAubmV4dCgpKS5kb25lOyApIHtcbiAgICB2YXIgZSA9ICRfXzEudmFsdWU7XG4gICAge1xuICAgICAgaWYgKGUuc3RhdGUgPT09IHRydWUpIHtcbiAgICAgICAgdCsrO1xuICAgICAgfSBlbHNlIGlmIChlLnN0YXRlID09PSBmYWxzZSkge1xuICAgICAgICBmKys7XG4gICAgICB9IGVsc2UgaWYgKGUuc3RhdGUgPT09ICdub25lJykge1xuICAgICAgICBuKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgYTogYSxcbiAgICB0OiB0LFxuICAgIGY6IGYsXG4gICAgbjogblxuICB9O1xufVxuZnVuY3Rpb24gc2luZ2xlVmVydFBhdHRlcm5zKHB1enpsZSkge1xuICBmb3IgKHZhciAkX18wID0gcHV6emxlLnZlcnRzW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzE7ICEoJF9fMSA9ICRfXzAubmV4dCgpKS5kb25lOyApIHtcbiAgICB2YXIgdiA9ICRfXzEudmFsdWU7XG4gICAge1xuICAgICAgdmFyICRfXzQgPSAkdHJhY2V1clJ1bnRpbWUuYXNzZXJ0T2JqZWN0KF9jb21wb25lbnRDb3VudHModikpLFxuICAgICAgICAgIGEgPSAkX180LmEsXG4gICAgICAgICAgdCA9ICRfXzQudCxcbiAgICAgICAgICBmID0gJF9fNC5mLFxuICAgICAgICAgIG4gPSAkX180Lm47XG4gICAgICBpZiAodCArIGYgKyBuICE9PSBhKSB7XG4gICAgICAgIHRocm93ICdBbGdvcml0aG0gZXJyb3IsIG4rdCtmICE9IGEnO1xuICAgICAgfVxuICAgICAgaWYgKGYgPT09IGEgLSAxICYmIG4gPiAwKSB7XG4gICAgICAgIHJldHVybiBfY2xlYXJPbmVFZGdlKHYpO1xuICAgICAgfVxuICAgICAgaWYgKG4gPT09IDEgJiYgdCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gX3NldE9uZUVkZ2Uodik7XG4gICAgICB9XG4gICAgICBpZiAodCA9PT0gMiAmJiBuID4gMCkge1xuICAgICAgICByZXR1cm4gX2NsZWFyT25lRWRnZSh2KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZmlsbE51bXMocHV6emxlKSB7XG4gIGZvciAodmFyICRfXzAgPSBwdXp6bGUuZmFjZXMuZmlsdGVyKChmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGYuaGludCAhPT0gbnVsbDtcbiAgfSkpW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzE7ICEoJF9fMSA9ICRfXzAubmV4dCgpKS5kb25lOyApIHtcbiAgICB2YXIgZmFjZSA9ICRfXzEudmFsdWU7XG4gICAge1xuICAgICAgdmFyICRfXzQgPSAkdHJhY2V1clJ1bnRpbWUuYXNzZXJ0T2JqZWN0KF9jb21wb25lbnRDb3VudHMoZmFjZSkpLFxuICAgICAgICAgIGEgPSAkX180LmEsXG4gICAgICAgICAgdCA9ICRfXzQudCxcbiAgICAgICAgICBmID0gJF9fNC5mLFxuICAgICAgICAgIG4gPSAkX180Lm47XG4gICAgICBpZiAodCA+IGZhY2UuaGludCkge1xuICAgICAgICB0aHJvdyBcIkxvZ2ljIGVycm9yLCBmYWNlIHdpdGggdG9vIG1hbnkgZWRnZXMgc2V0LlwiO1xuICAgICAgfVxuICAgICAgaWYgKGYgPT09IGEgLSBmYWNlLmhpbnQgJiYgbiA+IDApIHtcbiAgICAgICAgcmV0dXJuIF9zZXRPbmVFZGdlKGZhY2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gZW1wdHlOdW1zKHB1enpsZSkge1xuICBmb3IgKHZhciAkX18wID0gcHV6emxlLmZhY2VzLmZpbHRlcigoZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmLmhpbnQgIT09IG51bGw7XG4gIH0pKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAkX18xOyAhKCRfXzEgPSAkX18wLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgdmFyIGZhY2UgPSAkX18xLnZhbHVlO1xuICAgIHtcbiAgICAgIHZhciAkX180ID0gJHRyYWNldXJSdW50aW1lLmFzc2VydE9iamVjdChfY29tcG9uZW50Q291bnRzKGZhY2UpKSxcbiAgICAgICAgICBhID0gJF9fNC5hLFxuICAgICAgICAgIHQgPSAkX180LnQsXG4gICAgICAgICAgZiA9ICRfXzQuZixcbiAgICAgICAgICBuID0gJF9fNC5uO1xuICAgICAgaWYgKHQgPT09IGZhY2UuaGludCAmJiBuID4gMCkge1xuICAgICAgICByZXR1cm4gX2NsZWFyT25lRWRnZShmYWNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGZhY2VzSW5Db3JuZXJzKHB1enpsZSkge1xuICBmb3IgKHZhciAkX18yID0gcHV6emxlLmZhY2VzLmZpbHRlcigoZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmLmhpbnQgIT09IG51bGw7XG4gIH0pKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgdmFyIGZhY2UgPSAkX18zLnZhbHVlO1xuICAgIHtcbiAgICAgIHZhciBmYWNlQ291bnRzID0gX2NvbXBvbmVudENvdW50cyhmYWNlKTtcbiAgICAgIGlmIChmYWNlQ291bnRzLmEgLSBmYWNlQ291bnRzLnQgLSBmYWNlQ291bnRzLm4gPCBmYWNlLmhpbnQpIHtcbiAgICAgICAgZm9yICh2YXIgJF9fMCA9IGZhY2UudmVydHMoKVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAkX18xOyAhKCRfXzEgPSAkX18wLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgdmFyIHZlcnQgPSAkX18xLnZhbHVlO1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhciB2ZXJ0Q291bnRzID0gX2NvbXBvbmVudENvdW50cyh2ZXJ0KTtcbiAgICAgICAgICAgIGlmICh2ZXJ0Q291bnRzLnQgPT09IDAgJiYgdmVydENvdW50cy5uID09PSAyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfc2V0T25lRWRnZSh2ZXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXhwb3J0cywge1xuICBnZXRJZDoge2dldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZ2V0SWQ7XG4gICAgfX0sXG4gIHNodWZmbGU6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNodWZmbGU7XG4gICAgfX0sXG4gIHJhbmRJbnQ6IHtnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJhbmRJbnQ7XG4gICAgfX0sXG4gIHJhbmRJdGVtOiB7Z2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByYW5kSXRlbTtcbiAgICB9fSxcbiAgcmFuZEl0ZW1XZWlnaHRlZDoge2dldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmFuZEl0ZW1XZWlnaHRlZDtcbiAgICB9fSxcbiAgX19lc01vZHVsZToge3ZhbHVlOiB0cnVlfVxufSk7XG52YXIgZ2V0SWQgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBfbmV4dElkID0gMTtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldElkKCkge1xuICAgIHJldHVybiBfbmV4dElkKys7XG4gIH07XG59KSgpO1xuZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xuICB2YXIgJF9fNDtcbiAgdmFyIGluZGV4O1xuICB2YXIgY291bnRlciA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGNvdW50ZXIgPiAwKSB7XG4gICAgaW5kZXggPSByYW5kSW50KGNvdW50ZXIpO1xuICAgIGNvdW50ZXItLTtcbiAgICAoJF9fNCA9IFthcnJheVtpbmRleF0sIGFycmF5W2NvdW50ZXJdXSwgYXJyYXlbY291bnRlcl0gPSAkX180WzBdLCBhcnJheVtpbmRleF0gPSAkX180WzFdLCAkX180KTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5mdW5jdGlvbiByYW5kSW50KGEpIHtcbiAgdmFyICRfXzQ7XG4gIHZhciBiID0gYXJndW1lbnRzWzFdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1sxXSA6IDA7XG4gIGlmIChhID4gYikge1xuICAgICgkX180ID0gW2IsIGFdLCBhID0gJF9fNFswXSwgYiA9ICRfXzRbMV0sICRfXzQpO1xuICB9XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoYiAtIGEpKSArIGE7XG59XG5mdW5jdGlvbiByYW5kSXRlbShhcnIpIHtcbiAgcmV0dXJuIGFycltyYW5kSW50KDAsIGFyci5sZW5ndGgpXTtcbn1cbmZ1bmN0aW9uIHJhbmRJdGVtV2VpZ2h0ZWQoYXJyLCB3ZWlnaHRGdW5jKSB7XG4gIHZhciBhO1xuICB2YXIgdG90YWwgPSAwO1xuICBmb3IgKHZhciAkX18wID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzE7ICEoJF9fMSA9ICRfXzAubmV4dCgpKS5kb25lOyApIHtcbiAgICBhID0gJF9fMS52YWx1ZTtcbiAgICB7XG4gICAgICB0b3RhbCArPSB3ZWlnaHRGdW5jKGEpO1xuICAgIH1cbiAgfVxuICB2YXIgY2hvaWNlID0gTWF0aC5yYW5kb20oKSAqIHRvdGFsO1xuICBmb3IgKHZhciAkX18yID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICRfXzM7ICEoJF9fMyA9ICRfXzIubmV4dCgpKS5kb25lOyApIHtcbiAgICBhID0gJF9fMy52YWx1ZTtcbiAgICB7XG4gICAgICBjaG9pY2UgLT0gd2VpZ2h0RnVuYyhhKTtcbiAgICAgIGlmIChjaG9pY2UgPCAwKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIGl0ZW0gcGlja2VkLiBQcm9iYWJseSBhIHNoaXR0eSB3ZWlnaHRGdW5jLicpO1xufVxuIl19
