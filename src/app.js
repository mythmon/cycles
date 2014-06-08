System.register(["./cycles"], function($__0) {
  "use strict";
  var puzzleMesh,
      svg,
      xscale,
      xscaleZero,
      yscale,
      yscaleZero,
      lineOpen,
      lineClosed,
      elems;
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
    var madeChange = $__0[0]["oneSolutionStep"](puzzleMesh);
    update();
    if (!madeChange) {
      alert("I can't solve anything more.");
    }
  }
  return {
    exports: {},
    execute: function() {
      ;
      puzzleMesh = $__0[0]["makePuzzleMesh"]();
      svg = d3.select('body').append('svg');
      xscale = d3.scale.linear().domain(d3.extent(puzzleMesh.verts, (function(d) {
        return d.x;
      })));
      xscaleZero = xscale.copy();
      yscale = d3.scale.linear().domain(d3.extent(puzzleMesh.verts, (function(d) {
        return d.y;
      })));
      yscaleZero = yscale.copy();
      lineOpen = d3.svg.line().x((function(v) {
        return xscale(v.x);
      })).y((function(v) {
        return yscale(v.y);
      }));
      lineClosed = lineOpen.interpolate('linear-closed');
      elems = {
        faces: svg.append('g').classed('faces', true),
        faceNums: svg.append('g').classed('face-nums', true),
        edges: svg.append('g').classed('edges', true),
        verts: svg.append('g').classed('verts', true),
        voronoi: svg.append('g').classed('voronois', true)
      };
      ;
      rescaleGraph();
      window.onresize = rescaleGraph;
      ;
      ;
      ;
      d3.select('body').append('button').text('Step Solve').on('click', nextSolutionStep);
      update();
    }
  };
});
