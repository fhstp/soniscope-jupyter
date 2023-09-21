// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

import { DOMWidgetView } from '@jupyter-widgets/base';
import * as d3 from 'd3';
import { LensCursor } from './lensCursor';

const MARGIN = { top: 18, right: 30, bottom: 30, left: 30 };
const MARK_RADIUS = 2;

export class ScatterPlot {
  private view: DOMWidgetView;
  private lensCursor;

  constructor(view: DOMWidgetView) {
    this.view = view;

    const g = d3
      .select(view.el)
      .append('svg')
      .attr('width', 100)
      .attr('height', 100)
      .append('g')
      .classed('substrate', true)
      .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

    // get some temporary scales just for showing axes
    const x = prepareScale([], [0, 100]);
    const y = prepareScale([], [100, 0]);

    // add the X Axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + 100 + ')')
      .call(d3.axisBottom(x));

    // add the Y axis
    g.append('g').attr('class', 'y axis').call(d3.axisLeft(y));

    // add the color legend
    g.append('g')
      .attr('id', 'legend')
      .append('text')
      .classed('label', true)
      .style('text-anchor', 'end');

    this.lensCursor = new LensCursor(view, g);

    this.updateSubstrateSize();
    this.view.model.on(
      'change:substrate_width change:substrate_height',
      () => this.updateSubstrateSize(),
      this.view
    );
    this.view.model.on(
      'change:_marks_x change:_marks_y change:_marks_color',
      this.updateScatterPlotData,
      this
    );
  }

  private updateSubstrateSize() {
    const substWidth = this.view.model.get('substrate_width') as number;
    const substHeight = this.view.model.get('substrate_height') as number;

    const selSvg = d3
      .select(this.view.el)
      .select('svg')
      .attr('width', substWidth + MARGIN.left + MARGIN.right)
      .attr('height', substHeight + MARGIN.top + MARGIN.bottom);

    selSvg
      .select('.x.axis')
      .attr('transform', 'translate(0,' + substHeight + ')');

    selSvg
      .select('#legend')
      .attr('transform', 'translate(' + (substWidth + MARGIN.right) + ', -2)');

    this.updateScatterPlotData();
  }

  public updateScatterPlotData(): void {
    const substWidth = this.view.model.get('substrate_width') as number;
    const substHeight = this.view.model.get('substrate_height') as number;

    const xValues = this.view.model.get('_marks_x') as number[];
    const yValues = this.view.model.get('_marks_y') as number[];
    const cValues = this.view.model.get('_marks_color') as string[];

    // set the scales
    const xScale = prepareScale(xValues, [0, substWidth]);
    const yScale = prepareScale(yValues, [substHeight, 0]);
    this.lensCursor.transform = (x: number, y: number) => {
      return { x: xScale.invert(x), y: yScale.invert(y) };
    };

    // const colorValues = [...new Set(cValues)];
    const colorValues = d3
      .rollups(
        cValues,
        (v) => v.length,
        (d) => d
      )
      .sort((a, b) => (a[1] < b[1] ? 1 : -1))
      .map((v) => v[0]);
    // console.log(colorValues);
    // a.last_nom.localeCompare(b.last_nom))

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(colorValues);

    // console.log('%% length x: ' + xValues.length + ' , y: ' + yValues.length);

    const gSubstrate = d3.select(this.view.el).select('g.substrate');

    // add the scatterplot without data transformations
    // <https://stackoverflow.com/a/17872039/1140589>
    gSubstrate
      .selectAll('circle.dot')
      .data(xValues.length < yValues.length ? xValues : yValues)
      .join('circle')
      .classed('dot', true)
      .attr('r', MARK_RADIUS)
      .attr('fill', (d, i) => colorScale(cValues[i]))
      .attr('cx', (d, i) => (isNaN(xValues[i]) ? -100 : xScale(xValues[i])))
      .attr('cy', (d, i) => (isNaN(yValues[i]) ? -100 : yScale(yValues[i])));

    // update the X Axis
    gSubstrate.select('.x.axis').call(d3.axisBottom(xScale) as any);
    gSubstrate
      .selectAll('.x.label')
      .data([this.view.model.get('x_field')])
      .join('text')
      .attr('class', 'x label')
      // .attr("transform", "rotate(-90)")
      .attr('y', substHeight + 26)
      .attr('x', substWidth + MARGIN.right / 2)
      .style('text-anchor', 'end')
      .text((d) => d);

    // update the Y axis
    gSubstrate.select('.y.axis').call(d3.axisLeft(yScale) as any);
    gSubstrate
      .selectAll('.y.label')
      .data([this.view.model.get('y_field')])
      .join('text')
      .attr('class', 'y label')
      // .attr("transform", "rotate(-90)")
      .attr('y', -8)
      .attr('x', -MARGIN.left)
      .style('text-anchor', 'start')
      .text((d) => d);

    // update the legend
    const gLegend = gSubstrate.select('g#legend');
    gLegend.select('text.label').text(this.view.model.get('color_field'));

    gLegend
      .selectAll('text.axis')
      .data(colorValues)
      .join('text')
      .attr('class', 'axis')
      .text((d: string) => d)
      .style('text-anchor', 'end')
      .attr('x', '-9')
      .attr('y', (d, i) => i * 14 + 14);

    gLegend
      .selectAll('rect')
      .data(colorValues)
      .join('rect')
      .attr('x', '-7')
      .attr('y', (d, i) => i * 14 + 7)
      .attr('width', '7')
      .attr('height', '7')
      .style('fill', (d: string) => colorScale(d));
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
