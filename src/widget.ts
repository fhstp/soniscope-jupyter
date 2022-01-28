// Copyright (c) Alexander Rind & the SoniVis team.
// Distributed under the terms of the MIT License (see LICENSE.txt).

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';
import { ScatterPlot } from './scatterPlot';

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

      x_field: '',
      y_field: '',
      _marks_x: [] as number[],
      _marks_y: [] as number[],
      size: 0.1,
      shape: 'circle',
      width: 500,
      height: 500,
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
  // private scatterPlot: ScatterPlot;

  render(): void {
    // this.scatterPlot =
    new ScatterPlot(this);
  }
}
