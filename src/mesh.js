import {getId} from './utils';

export class Vert {
  constructor(x, y, edges) {
    this.x = x;
    this.y = y;
    this.edges = edges;
    this.id = getId();
  }

  // All vertices that are distance 1 from this vertex.
  connectedVerts() {
    var vs = [];
    for (var e of this.edges) {
      vs.push(e.vert1);
      vs.push(e.vert2);
    }
    return vs.filter((v) => v.id !== this.id);
  }

  getEdgeTo(vert) {
    for (var e of this.edges) {
      if (e.vert1 === this && e.vert2 === vert ||
          e.vert1 === vert && e.vert2 === this) {
        return e;
      }
    }
    throw new Error(`Unknown connection from ${this.toString()} to ${vert.toString()}`);
  }

  toString() {
    return `[${this.x},${this.y}]`;
  }
}

export class Edge {
  constructor(vert1, vert2, aFace, aNext, aPrev, bFace, bNext, bPrev) {
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
  }

  verts() {
    return [this.vert1, this.vert2];
  }
}

export class Face {
  constructor(edges) {
    this.edges = edges;
    this.id = getId();
  }

  verts() {
    var vs = [];
    for (var e of this.edges) {
      if (e.aFace === this) {
        vs.push(e.vert1);
      } else {
        vs.push(e.vert2);
      }
    }
    return vs;
  }

  center() {
    if (this._center) {
      return this._center;
    }
    var totalX = 0;
    var totalY = 0;
    var verts = this.verts();
    for (var v of verts) {
      totalX += v.x;
      totalY += v.y;
    }
    return this._center = {x: totalX / verts.length, y: totalY / verts.length};
  }

  neighbors() {
    if (this._neighbors) {
      return this._neighbors;
    }
    var ns = [];
    for (var e of this.edges) {
      if (e.aFace === this) {
        ns.push(e.bFace);
      } else {
        ns.push(e.aFace);
      }
    }
    this._neighbors = ns;
    return ns;
  }

  neighborsCorners() {
    if (this._neighborsCorners) {
      return this._neighborsCorners;
    }
    var ns = [];
    var faceMap = {};
    faceMap[this.id] = true;

    for (var v of this.verts()) {
      for (var e of v.edges) {
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

    return ns;
  }
}

function vertKey([x, y]) {
  return `${x},${y}`;
}

function vertPairKey(v1, v2) {
  if (v1.id > v2.id) {
    [v1, v2] = [v2, v1];
  }
  return `${v1.id},${v2.id}`;
}

export class Mesh {
  constructor() {
    this.verts = [];
    this.edges = [];
    this.faces = [];
    this.vertMap = {};
    this.edgeMap = {};
  }

  addFace(...points) {
    var faceVerts = [];
    var faceEdges = [];
    var key, i;

    for (var [x, y] of points) {
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
        // re-using an edge
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
  }

  getEdgeFrom([x1, y1], [x2, y2]) {
    var v1 = this.vertMap[vertKey([x1, y1])];
    var v2 = this.vertMap[vertKey([x2, y2])];
    if (v1 === undefined) {
      throw new Error(`Unknown vert: [${x1},${y1}]`);
    }
    if (v2 === undefined) {
      throw new Error(`Unknown vert: [${x2},${y2}]`);
    }
    var key = vertPairKey(v1, v2);
    var edge = this.edgeMap[key];
    if (edge === undefined) {
      throw new Error(`Unknown edge from [${x1},${y1}] to [${x2},${y2}]`);
    }
    return edge;
  }

  voronoi() {
    var points = [];
    var x, y, center;
    for (var f of this.faces) {
      center = f.center();
      center.type = 'face';
      center.face = f;
      points.push(center);
    }
    for (var e of this.edges) {
      x = (e.vert1.x + e.vert2.x) / 2;
      y = (e.vert1.y + e.vert2.y) / 2;
      points.push({
        x: x,
        y: y,
        type: 'edge',
        edge: e,
      });
    }

    var xExtent = d3.extent(points, (d) => d.x);
    var yExtent = d3.extent(points, (d) => d.y);

    var voro = d3.geom.voronoi()
      .x((d) => d.x)
      .y((d) => d.y)
      .clipExtent([[xExtent[0] - 1, yExtent[0] - 1],
                   [xExtent[1] + 1, yExtent[1] + 1]]);

    return voro(points);
  }
}
