System.register([], function($__0) {
  "use strict";
  var getId,
      Vert,
      Edge,
      Face,
      Mesh;
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
  return {
    exports: {
      get Vert() {
        return Vert;
      },
      get Edge() {
        return Edge;
      },
      get Face() {
        return Face;
      },
      get Mesh() {
        return Mesh;
      },
      set Vert(value) {
        Vert = value;
      },
      set Edge(value) {
        Edge = value;
      },
      set Face(value) {
        Face = value;
      },
      set Mesh(value) {
        Mesh = value;
      }
    },
    execute: function() {
      getId = (function() {
        var _nextId = 0;
        return function getId() {
          return _nextId++;
        };
      })();
      Vert = (function() {
        var Vert = function Vert(x, y, edges) {
          this.x = x;
          this.y = y;
          this.edges = edges;
          this.id = getId();
        };
        return ($traceurRuntime.createClass)(Vert, {}, {});
      }());
      Edge = (function() {
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
        return ($traceurRuntime.createClass)(Edge, {verts: function() {
            return [this.vert1, this.vert2];
          }}, {});
      }());
      Face = (function() {
        var Face = function Face(edges) {
          this.edges = edges;
          this.id = getId();
        };
        return ($traceurRuntime.createClass)(Face, {
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
          }
        }, {});
      }());
      ;
      ;
      Mesh = (function() {
        var Mesh = function Mesh() {
          this.verts = [];
          this.edges = [];
          this.faces = [];
          this.vertMap = {};
          this.edgeMap = {};
        };
        return ($traceurRuntime.createClass)(Mesh, {
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
      }());
    }
  };
});
