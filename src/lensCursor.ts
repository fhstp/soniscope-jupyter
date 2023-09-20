// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

import { DOMWidgetView } from '@jupyter-widgets/base';
import * as d3 from 'd3';

const DEFAULT_OPACITY = 0.3;

export class LensCursor {
  private view: DOMWidgetView;
  private selLens: any;
  private selOverlay: any;
  private clipId: string;

  private smallerSize = 100;
  private rPixels = 10;
  public transform = (x: number, y: number): { x: number; y: number } => {
    return { x, y };
  };

  constructor(
    view: DOMWidgetView,
    gPlot: d3.Selection<SVGGElement, any, any, any>
  ) {
    this.view = view;

    // prepare a clip-path, which will be defined in updateSubstrateSize()
    this.clipId =
      'clip' + (Math.random().toString(36) + '00000000000000000').slice(2, 14);

    d3.select(this.view.el)
      .select('svg')
      .append('defs')
      .append('clipPath')
      .attr('id', this.clipId);

    this.selLens = gPlot
      .append('g')
      .attr('clip-path', `url(#${this.clipId})`)
      // clipping must happen before translation
      .append('g')
      .classed('cursor lens', true)
      .style('opacity', 0)
      .attr('transform', 'translate(0, 0)');
    this.updateLensShape();
    this.view.model.on('change:shape', () => this.updateLensShape(), this.view);

    // add invisible rect to track mouse position (as last svg element)
    this.selOverlay = gPlot
      .append('rect')
      .classed('cursor overlay', true)
      .attr('x', 0)
      // .on('touchstart', (event) => event.preventDefault())
      .on('mouseenter', () => {
        this.selLens.style('opacity', DEFAULT_OPACITY);
      })
      .on('mouseleave', () => {
        this.selLens.style('opacity', 0);
        view.send({
          event: 'lens_released',
        });
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
      .on('pointerup', () => {
        view.send({
          event: 'lens_released',
        });
      })
      .on('touchend', () => {
        // lens fade out
        this.selLens.transition().duration(800).style('opacity', 0);
      })
      .on('mousedown touchstart', (evt: UIEvent) => {
        evt.preventDefault();
        // recover coordinate we need
        let rawX = -1;
        let rawY = -1;
        if (evt.type === 'touchstart') {
          rawX = d3.pointers(evt)[0][0];
          rawY = d3.pointers(evt)[0][1];
        } else if (evt.type === 'mousedown') {
          rawX = d3.pointer(evt)[0];
          rawY = d3.pointer(evt)[1];
        }
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

        // lens positioned here
        this.selLens.attr('transform', `translate(${rawX}, ${rawY})`);

        // lens visible (fade out after touchend)
        this.selLens.style('opacity', DEFAULT_OPACITY);
      });

    // TODO change lense size by multi-touch cp. <https://observablehq.com/@d3/multitouch#cell-308>

    this.updateSubstrateSize();
    this.view.model.on(
      'change:substrate_width change:substrate_height',
      () => this.updateSubstrateSize(),
      this.view
    );

    this.updateLensSize();
    this.view.model.on('change:size', () => this.updateLensSize(), this.view);
  }

  private updateSubstrateSize() {
    const substWidth = this.view.model.get('substrate_width') as number;
    const substHeight = this.view.model.get('substrate_height') as number;
    this.selOverlay.attr('width', substWidth);
    this.selOverlay.attr('height', substHeight);

    d3.select(this.view.el)
      .select('#' + this.clipId)
      .html(
        `<rect x="0" y="0" width="${substWidth}" height="${substHeight}" />`
      );

    this.smallerSize = Math.min(substWidth, substHeight);

    this.updateLensSize();
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
    } else if (this.view.model.get('shape') === 'xonly') {
      this.selLens.html(
        `<rect x="-1" y="-40000" width="2" height="80000" transform="scale(${this.rPixels})"/>`
      );
    } else if (this.view.model.get('shape') === 'yonly') {
      this.selLens.html(
        `<rect x="-40000" y="-1" width="80000" height="2" transform="scale(${this.rPixels})"/>`
      );
    } else if (this.view.model.get('shape') === 'none') {
      this.selLens.html('');
    }
  }
}

export function removeLensCursor(
  gPlot: d3.Selection<d3.BaseType, any, any, any>
): void {
  gPlot.selectAll('.cursor').remove();
}
