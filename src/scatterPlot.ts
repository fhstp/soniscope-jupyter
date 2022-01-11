import { DOMWidgetView } from '@jupyter-widgets/base';
import * as d3 from 'd3';

const width = 200;
const height = 300;
const MARGIN = { top: 20, right: 20, bottom: 30, left: 50 };
const RADIUS = 2;

export function setupScatterPlot(view: DOMWidgetView): void {
  // const g =
  d3.select(view.el)
    .append('svg')
    .attr('width', width + MARGIN.left + MARGIN.right)
    .attr('height', height + MARGIN.top + MARGIN.bottom)
    .append('g')
    .classed('substrate', true)
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');
}

export function updateScatterPlot(view: DOMWidgetView): void {
  console.log('%% updated scatter ');

  const xValues = view.model.get('_marks_x') as number[];
  const xMin = d3.min(xValues) || 0;
  const xMax = d3.max(xValues) || 1;
  const yValues = view.model.get('_marks_y') as number[];
  const yMin = d3.min(yValues) || 0;
  const yMax = d3.max(yValues) || 1;

  // set the ranges
  const x = d3.scaleLinear().range([0, width]).domain([xMin, xMax]);
  const y = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]);

  console.log('%% x domain: [' + xMin + ' ,' + xMax + ']');

  console.log('%% length x: ' + xValues.length + ' , y: ' + yValues.length);

  const g = d3.select(view.el).select('g.substrate');

  // add the scatterplot without data transformations
  // <https://stackoverflow.com/a/17872039/1140589>
  g.selectAll('circle.dot')
    .data(xValues.length < yValues.length ? xValues : yValues)
    .join('circle')
    .classed('dot', true)
    .attr('r', RADIUS)
    .attr('cx', (d, i) => x(xValues[i]))
    .attr('cy', (d, i) => y(yValues[i]));
}
