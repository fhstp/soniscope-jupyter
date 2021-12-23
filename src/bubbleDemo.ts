// BEGIN copy/paste from my playground
import { DOMWidgetView, WidgetModel } from '@jupyter-widgets/base';
import * as d3 from 'd3';

const width = 400;
const height = 400;
const MARKS = 16;

export function renderChart(
  domElement: HTMLElement,
  model: WidgetModel,
  view: DOMWidgetView
): void {
  const svg = d3
    .select(domElement)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // some fruits categories and a color scale
  const fruits = ['Apple', 'Banana', 'Cherry', 'Orange'];
  const color = d3.scaleOrdinal([
    d3.schemeTableau10[4],
    d3.schemeTableau10[5],
    d3.schemeTableau10[2],
    d3.schemeTableau10[1],
  ]);
  appendLegend(svg, fruits, color);

  // random generate fruit items
  const data = [];

  for (let i = 0; i < MARKS; i++) {
    data.push({
      type: fruits[Math.floor(Math.random() * fruits.length)],
      count: Math.ceil(Math.random() * 10),
    });
  }

  // pack layout as in <https://observablehq.com/@d3/bubble-chart>
  const root = d3
    .pack()
    .size([width - 2, height - 2])
    .padding(3)(d3.hierarchy({ children: data }).sum((d: any) => d.count));

  // simply draw circles
  // var node =
  svg
    .selectAll('circle')
    .data(root.leaves())
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d: any) => color(d.data.type))
    .on('mouseenter', (evt, d: any) => {
      model.set('value', d.data.type);
      model.save_changes();
    })
    .on('mouseleave', (evt, d: any) => {
      if (model.get('value') === d.data.type) {
        model.set('value', 'none');
        model.save_changes();
      }
    })
    .on('click', (evt, d: any) => {
      console.log('clicked on ' + d.data.type + ' ' + d.data.count);
      view.send({ event: 'click', fruit: d.data.type, count: d.data.count });
    })
    .append('title')
    .text((d: any) => d.data.type);
}

export function hightlight(domElement: HTMLElement, value: string): void {
  d3.select(domElement)
    .selectAll('circle')
    .attr('stroke-width', '3px')
    .attr('stroke', (d: any) =>
      d.data.type === value ? d3.schemeTableau10[0] : 'none'
    );
}

function appendLegend(
  svg: d3.Selection<SVGSVGElement, any, HTMLElement | null, any>,
  allTypes: string[],
  color: d3.ScaleOrdinal<string, string>
) {
  const legendEntries = svg
    .append('g')
    .attr('id', 'legend')
    .selectAll('g')
    .data(allTypes)
    .enter()
    .append('g')
    .attr('transform', (d, i) => {
      return 'translate(' + 15 + ', ' + (i * 16 + 15) + ')';
    });

  legendEntries.append('text').text((d) => d);

  legendEntries
    .append('rect')
    .attr('x', '-10')
    .attr('y', '-7')
    .attr('width', '7')
    .attr('height', '7')
    .style('fill', (d) => color(d));
}
