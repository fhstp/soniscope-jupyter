// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

import { DOMWidgetView } from '@jupyter-widgets/base';
import * as d3 from 'd3';
import { LensCursor } from './lensCursor';

const width = 400;
const height = 400;
const MARGIN = { top: 20, right: 10, bottom: 30, left: 30 };
const RADIUS = 2;

export class ScatterPlot {
  private lensCursor;

  constructor(view: DOMWidgetView) {
    const g = d3
      .select(view.el)
      .append('svg')
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .classed('substrate', true)
      .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

    // set the scales
    const x = prepareScale([], [0, width]);
    const y = prepareScale([], [height, 0]);

    // add the X Axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // add the Y axis
    g.append('g').attr('class', 'y axis').call(d3.axisLeft(y));

    this.lensCursor = new LensCursor(view, g, width, height);
    console.log('end constr');
  }

  public updateScatterPlot(view: DOMWidgetView): void {
    console.log('%% updated scatter ');

    const xValues = view.model.get('_marks_x') as number[];
    const yValues = view.model.get('_marks_y') as number[];

    // set the scales
    const xScale = prepareScale(xValues, [0, width]);
    const yScale = prepareScale(yValues, [height, 0]);
    this.lensCursor.transform = (x: number, y: number) => {
      return { x: xScale.invert(x), y: yScale.invert(y) };
    };

    // console.log('%% length x: ' + xValues.length + ' , y: ' + yValues.length);

    const gSubstrate = d3.select(view.el).select('g.substrate');

    // add the scatterplot without data transformations
    // <https://stackoverflow.com/a/17872039/1140589>
    gSubstrate
      .selectAll('circle.dot')
      .data(xValues.length < yValues.length ? xValues : yValues)
      .join('circle')
      .classed('dot', true)
      .attr('r', RADIUS)
      .attr('cx', (d, i) => xScale(xValues[i]))
      .attr('cy', (d, i) => yScale(yValues[i]));

    // update the X Axis
    gSubstrate.select('.x.axis').call(d3.axisBottom(xScale) as any);
    gSubstrate
      .selectAll('.x.label')
      .data([view.model.get('x_field')])
      .join('text')
      .attr('class', 'x label')
      // .attr("transform", "rotate(-90)")
      .attr('y', height + 26)
      .attr('x', width + MARGIN.right)
      .style('text-anchor', 'end')
      .text((d) => d);

    // update the Y axis
    gSubstrate.select('.y.axis').call(d3.axisLeft(yScale) as any);
    gSubstrate
      .selectAll('.y.label')
      .data([view.model.get('y_field')])
      .join('text')
      .attr('class', 'y label')
      // .attr("transform", "rotate(-90)")
      .attr('y', -8)
      .attr('x', -MARGIN.left)
      .style('text-anchor', 'start')
      .text((d) => d);
  }
}

function prepareScale(
  values: number[],
  range: Iterable<number>
): d3.ScaleLinear<number, number, never> {
  const xMin = d3.min(values) || 0;
  const xMax = d3.max(values) || 1;
  // console.log('%% domain: [' + xMin + ' ,' + xMax + ']');
  const space = (xMax - xMin) * 0.05;
  const xSpacedMin = xMin - space < 0 && xMin >= 0 ? 0 : xMin - space;
  return d3
    .scaleLinear()
    .range(range)
    .domain([xSpacedMin, xMax + space]);
}
