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
import { renderChart } from './bubbleDemo';

export class LensModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: LensModel.model_name,
      _model_module: LensModel.model_module,
      _model_module_version: LensModel.model_module_version,
      _view_name: LensModel.view_name,
      _view_module: LensModel.view_module,
      _view_module_version: LensModel.view_module_version,
      value: 'Hello World',
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
  private _demoLabel: HTMLDivElement;

  render() {
    this._demoLabel = document.createElement('div');
    this._demoLabel.classList.add('custom-widget');
    this.el.appendChild(this._demoLabel);

    const d3div = document.createElement('div');
    this.el.appendChild(d3div);
    renderChart(d3div, this.model);

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
  }

  value_changed() {
    this._demoLabel.textContent = this.model.get('value');
  }
}
