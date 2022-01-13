// Copyright (c) Alexander Rind
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';
import { hightlight, renderChart } from './bubbleDemo';
import { ScatterPlot } from './scatterPlot';
// import { updateLensDiameter } from './lensCursor';

export class LensModel extends DOMWidgetModel {
  defaults(): any {
    return {
      ...super.defaults(),
      _model_name: LensModel.model_name,
      _model_module: LensModel.model_module,
      _model_module_version: LensModel.model_module_version,
      _view_name: LensModel.view_name,
      _view_module: LensModel.view_module,
      _view_module_version: LensModel.view_module_version,
      value: 'none',
      x_field: '',
      y_field: '',
      _marks_x: [] as number[],
      _marks_y: [] as number[],
      diameter: 0.1,
      shape: 'circle',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'LensModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'LensView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class LensView extends DOMWidgetView {
  // private _demoLabel: HTMLDivElement;
  private scatterPlot: ScatterPlot;

  render(): void {
    // this._demoLabel = document.createElement('div');
    // this._demoLabel.classList.add('custom-widget');
    // this.el.appendChild(this._demoLabel);

    // const d3div = document.createElement('div');
    // this.el.appendChild(d3div);
    // renderChart(d3div, this.model, this);
    renderChart(this.el, this.model, this);
    // setupScatterPlot(this);
    this.scatterPlot = new ScatterPlot(this);

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
    this.model.on('change:_marks_x', this.value_changed, this);
    this.model.on('change:_marks_y', this.value_changed, this);
  }

  value_changed(): void {
    // this._demoLabel.textContent = JSON.stringify(this.model.get('_marks_x'));

    console.log('field ' + this.model.get('x_field'));
    console.log(this.model.get('_marks_x'));
    hightlight(this.el, this.model.get('value'));
    this.scatterPlot.updateScatterPlot(this);
  }
}
