import {Puzzle} from './cycles';
import {oneSolutionStep} from './solver';
import {randItem} from './utils';

var puzzleMesh = new Puzzle();
console.log(puzzleMesh);

var svg = d3.select('body').append('svg');

var xscale = d3.scale.linear()
  .domain(d3.extent(puzzleMesh.verts, (d) => d.x))
var xscaleZero = xscale.copy();

var yscale = d3.scale.linear()
  .domain(d3.extent(puzzleMesh.verts, (d) => d.y))
var yscaleZero = yscale.copy();

var lineOpen = d3.svg.line()
    .x((v) => xscale(v.x))
    .y((v) => yscale(v.y));

var lineClosed = lineOpen.interpolate('linear-closed');

var elems = {
    faces: svg.append('g').classed('faces', true),
    faceNums: svg.append('g').classed('face-nums', true),
    edges: svg.append('g').classed('edges', true),
    verts: svg.append('g').classed('verts', true),
    voronoi: svg.append('g').classed('voronois', true),
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
  svg
    .attr('width', size)
    .attr('height', size);
  update();
}
rescaleGraph();
window.onresize = rescaleGraph;

function update() {
    // Join
    var faces = elems.faces.selectAll('.face').data(puzzleMesh.faces, (f) => f.id);
    var faceNums = elems.faceNums.selectAll('.face-num').data(puzzleMesh.faces, (f) => 'n' + f.id);
    var edges = elems.edges.selectAll('.edge').data(puzzleMesh.edges, (e) => e.id);
    var verts = elems.verts.selectAll('.vert').data(puzzleMesh.verts, (v) => v.id);
    var voronoi = elems.voronoi.selectAll('.voronoi').data(puzzleMesh.voronoi());

    // Enter
    faces.enter().append('path').classed('face', true);
    faceNums.enter().append('text').classed('face-num', true);
    edges.enter().append('path').classed('edge', true);
    verts.enter().append('circle').classed('vert', true);
    voronoi.enter().append('path').classed('voronoi', true);

    // Update
    faces
      .attr('d', (f) => lineClosed(f.verts()));
    faceNums
      .attr('x', (f) => xscale(f.center().x))
      .attr('y', (f) => yscale(f.center().y))
      .text((f) => f.hint)
      .style('font-size', (f) => yscaleZero(0.6) + 'px');
    edges
      .attr('d', (e) => lineOpen(e.verts()))
      .attr('edge-state', (e) => e.state);
    verts
      .attr('cx', (v) => xscale(v.x))
      .attr('cy', (v) => yscale(v.y))
      .attr('r', 3);
    voronoi
      .attr('d', (poly) => 'M' + poly.map((p) => [xscale(p[0]), yscale(p[1])]).join('L'))
      .datum((d) => d.point)
      .on('click', voronoiOnClick)
      ;

    // Exit
    faces.exit().remove();
    faceNums.exit().remove();
    edges.exit().remove();
    verts.exit().remove();
    voronoi.exit().remove();
}


function voronoiOnClick(d) {
  var edgeStateTransitions = {true: false, false: 'none', 'none': true};
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
  for (var e of puzzleMesh.edges) {
    e.state = 'none';
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
// var solvingInterval = setInterval(nextSolutionStep, 1000);
