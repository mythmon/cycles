import {makePuzzleMesh} from "./cycles";

var WIDTH = 700;
var HEIGHT = 700;
var MARGIN = 25;

var puzzleMesh = makePuzzleMesh();

var svg = d3.select('body').append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

var xscale = d3.scale.linear()
  .domain(d3.extent(puzzleMesh.verts, (d) => d.x))
  .range([MARGIN, WIDTH - MARGIN]);
var xscaleZero = xscale.copy().range([0, WIDTH - MARGIN * 2]);

var yscale = d3.scale.linear()
  .domain(d3.extent(puzzleMesh.verts, (d) => d.y))
  .range([MARGIN, HEIGHT - MARGIN]);
var yscaleZero = yscale.copy().range([0, HEIGHT - MARGIN * 2]);

var lineOpen = d3.svg.line()
    .x((v) => xscale(v.x))
    .y((v) => yscale(v.y));

var lineClosed = lineOpen.interpolate('linear-closed');

var elems = {
    faces: svg.append('g').classed('faces', true),
    faceNums: svg.append('g').classed('face-nums', true),
    edges: svg.append('g').classed('edges', true),
    verts: svg.append('g').classed('verts', true),
    debug: svg.append('g').classed('debug', true),
};

function update() {
    // Join
    var faces = elems.faces.selectAll('.face').data(puzzleMesh.faces, (f) => f.id);
    var faceNums = elems.faceNums.selectAll('.faceNum').data(puzzleMesh.faces, (f) => f.id);
    var edges = elems.edges.selectAll('.edge').data(puzzleMesh.edges, (e) => e.id);
    var verts = elems.verts.selectAll('.vert').data(puzzleMesh.verts, (v) => v.id);
    var debug = elems.debug.selectAll('.voronoi').data(puzzleMesh.voronoi());

    // Enter
    faces.enter().append('path').classed('face', true);
    faceNums.enter().append('text').classed('face-num', true);
    edges.enter().append('path').classed('edge', true);
    verts.enter().append('circle').classed('vert', true);
    debug.enter().append('path').classed('voronoi', true);

    // Update
    faces.attr('d', (f) => lineClosed(f.verts()));
    faceNums
      .attr('x', (f) => xscale(f.center().x))
      .attr('y', (f) => yscale(f.center().y))
      .text((f) => f.edgeActiveCount)
      .style('font-size', (f) => yscaleZero(0.6) + 'px');
    edges
      .attr('d', (e) => lineOpen(e.verts()))
      .attr('edge-state', (e) => e.state)
    verts
      .attr('cx', (v) => xscale(v.x))
      .attr('cy', (v) => yscale(v.y))
      .attr('r', 3);
    debug
      // .attr('stroke', 'rgba(255,0,0,0.5)')
      // .attr('fill', (v) => v.point.type === 'edge' ? edgeColorScale(v.point.edge.state) : '#248')
      // .attr('fill', 'none')
      // .attr('stroke', 'none')
      // .style('fill-events', 'all')
      .attr('d', (poly) => 'M' + poly.map((p) => [xscale(p[0]), yscale(p[1])]).join('L'))
      .datum((d) => d.point)
      .on('click', voronoiOnClick)
      ;

    // Exit
    faces.exit().remove();
    faceNums.exit().remove();
    edges.exit().remove();
    verts.exit().remove();
    debug.exit().remove();
}


function anim() {
    for (var v of puzzleMesh.verts) {
        v.x += Math.random() * 0.02 - 0.01;
        v.y += Math.random() * 0.02 - 0.01;
    }
    update();
}

function voronoiOnClick(d) {
  var edgeStateTransitions = {true: false, false: 'none', 'none': true};
  if (d.type === 'edge') {
    d.edge.state = edgeStateTransitions[d.edge.state];
  }
  update();
}

update();
// d3.timer(anim);
