// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

import { DOMWidgetView } from '@jupyter-widgets/base';
import * as d3 from 'd3';

const DEFAULT_OPACITY = 0.3;

export class LensCursor {
  private view: DOMWidgetView;
  private selLens: any;

  private smallerSize = 100;
  private rPixels = 10;
  public transform = (x: number, y: number): { x: number; y: number } => {
    return { x, y };
  };

  constructor(
    view: DOMWidgetView,
    gPlot: d3.Selection<SVGGElement, any, any, any>,
    areaWidth: number,
    areaHeight: number
  ) {
    this.view = view;
    this.smallerSize = Math.min(areaWidth, areaHeight);

    this.selLens = gPlot
      .append('g')
      .classed('cursor lens', true)
      .style('opacity', 0)
      .attr('transform', 'translate(0, 0)');
    this.updateLensShape();
    this.view.model.on('change:shape', () => this.updateLensShape(), this.view);
    this.updateLensSize();
    this.view.model.on('change:size', () => this.updateLensSize(), this.view);

    // add invisible rect to track mouse position (as last svg element)
    gPlot
      .append('rect')
      .classed('cursor overlay', true)
      .attr('x', 0)
      .attr('width', areaWidth)
      .attr('y', 0)
      .attr('height', areaHeight)
      // .on('touchstart', (event) => event.preventDefault())
      .on('mouseenter', () => {
        this.selLens.style('opacity', DEFAULT_OPACITY);
      })
      .on('mouseleave', () => {
        this.selLens.style('opacity', 0);
      })
      .on(
        'wheel',
        (evt: WheelEvent) => {
          evt.preventDefault();
          evt.stopPropagation();
          // TODO prevent screen from scrolling on Firefox
          const oldLensSize = this.view.model.get('size') as number;
          const scaledLensSize =
            oldLensSize * Math.pow(1.25, evt.deltaY / -100);
          const newLensSize = Math.min(1.5, Math.max(0.01, scaledLensSize));
          // console.log('g', evt, newLensSize);
          this.view.model.set('size', newLensSize);
          this.view.model.save_changes();
          return false;
        },
        { passive: false }
      )
      .on('mousemove', (evt: MouseEvent) => {
        const rawX = d3.pointer(evt)[0];
        const rawY = d3.pointer(evt)[1];
        // circle.attr('cx', rawX).attr('cy', rawY);
        this.selLens.attr('transform', `translate(${rawX}, ${rawY})`);
      })
      // .on('mousedown touchstart', mousedown);
      .on('pointerdown', (evt: PointerEvent) => {
        evt.preventDefault();
        // recover coordinate we need
        const rawX = d3.pointer(evt)[0];
        const rawY = d3.pointer(evt)[1];
        if (rawX < 0 || rawY < 0) {
          return;
        }
        // delegate coordinate transformations to caller
        const center = this.transform(rawX, rawY);
        // console.log(center);

        // TODO assumption of a linear scale
        const corner = this.transform(rawX + this.rPixels, rawY - this.rPixels);

        view.send({
          event: 'lens',
          ...center,
          edgeX: corner.x,
          edgeY: corner.y,
        });
      });

    // TODO change lense size by multi-touch cp. <https://observablehq.com/@d3/multitouch#cell-308>
  }

  private updateLensSize() {
    const lensSize = this.view.model.get('size') as number;
    // console.log('client swidth ', this.smallerSize);
    this.rPixels = (lensSize * this.smallerSize) / 2.0;
    // this.selLens.attr('r', this.rPixels);
    // console.log(this.selLens.selectAll('*'));
    this.selLens.selectAll('*').attr('transform', `scale(${this.rPixels})`);
  }

  private updateLensShape() {
    //   this.selLens.html('');
    if (this.view.model.get('shape') === 'circle') {
      this.selLens.html(
        `<circle r="1" cx="0", cy="0" transform="scale(${this.rPixels})"/>`
      );
    } else if (this.view.model.get('shape') === 'square') {
      this.selLens.html(
        `<rect x="-1" y="-1" width="2" height="2" transform="scale(${this.rPixels})"/>`
      );
    }
  }
}

export function removeLensCursor(
  gPlot: d3.Selection<d3.BaseType, any, any, any>
): void {
  gPlot.selectAll('.cursor').remove();
}
