#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Alexander Rind & the SoniVis team.
# Distributed under the terms of the MIT License (see LICENSE.txt).

"""
jupyter widget that shows a scatter plot with a lens and fires an event with filtered data whenever the plot is clicked
"""

from ipywidgets import DOMWidget, CallbackDispatcher, register
from traitlets import Unicode, Instance, List, Float, observe, validate, TraitError
from ._frontend import module_name, module_version
import pandas as pd
import numpy as np


@register
class LensWidget(DOMWidget):
    """
    jupyter widget that shows a scatter plot with a lens and fires an event with filtered data whenever the plot is clicked
    """
    _model_name = Unicode('LensModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('LensView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    size = Float(0.1).tag(sync=True)
    """ size of the lens relative to smallest side of the widget """
    shape = Unicode('circle').tag(sync=True)
    """ shape of the lens cursor, 'circle' or 'square' """
    x_field = Unicode('').tag(sync=True)
    """ column name used for x axis. While it is an empty string no marks are rendered/updated. """
    y_field = Unicode('').tag(sync=True)
    """ column name used for y axis. While it is an empty string no marks are rendered/updated. """
    data = Instance(klass=pd.DataFrame)
    """ pandas dataframe to be displayed """

    # value_trait=List(Float()), key_trait=Unicode()).tag(sync=True)
    # _marks = Dict(traits={'x': List(Float()),
    #               'y': List(Float())}).tag(sync=True)
    _marks_x = List(Float()).tag(sync=True)
    """ internal data with mark x positions as column vector """
    _marks_y = List(Float()).tag(sync=True)
    """ internal data with mark y positions as column vector """

    def __init__(self, data=None, x_field=None, y_field=None, **kwargs):
        super().__init__(**kwargs)
        self._lens_click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_frontend_msg)

        # if isinstance(data, pd.DataFrame) == True:
        if data is None:
            self.data = pd.DataFrame()
        else:
            if x_field == None and y_field == None:
                self.data = data
            else:
                self.set_data(data, x_field, y_field)

    def set_data(self, data: pd.DataFrame, x_field: str, y_field: str):
        """
        sets data frame and columns used for axes at the same time
        """
        self.x_field = ''
        self.y_field = ''
        self.data = data
        self.x_field = x_field
        self.y_field = y_field

    @validate('shape')
    def _valid_shape(self, proposal):
        # print('§§lens§§ check x')
        if not (proposal['value'] == 'circle' or proposal['value'] == 'square'):
            raise TraitError('The shape can only be \'circle\' or \'square\'.')
        return proposal['value']

    @validate('data')
    def _valid_data(self, proposal):
        # print('§§lens§§ check data')

        if not (self.x_field == '' or self.x_field in proposal['value']):
            raise TraitError('The x field is not a column of the data frame.')

        if not (self.y_field == '' or self.y_field in proposal['value']):
            raise TraitError('The y field is not a column of the data frame.')

        return proposal['value']

    @validate('x_field')
    def _valid_x_field(self, proposal):
        # print('§§lens§§ check x')
        if not (proposal['value'] == '' or proposal['value'] in self.data):
            raise TraitError('The x field is not a column of the data frame.')
        return proposal['value']

    @validate('y_field')
    def _valid_y_field(self, proposal):
        if not (proposal['value'] == '' or proposal['value'] in self.data):
            raise TraitError('The y field is not a column of the data frame.')
        return proposal['value']

    @observe('data')
    def _observe_data(self, change):
        # print('§§lens§§ update data')
        if self.x_field != '' and self.y_field != '':
            self._marks_x = change.new[self.x_field].tolist()
            self._marks_y = change.new[self.y_field].tolist()

    @observe('x_field', 'y_field')
    def _observe_fields(self, change):
        # print('§§lens§§ update field ' + change.name + ' to ' + change.new)
        if change.new != '':
            if change.name == 'x_field':
                self._marks_x = self.data[change.new].tolist()
            else:
                self._marks_y = self.data[change.new].tolist()

    def on_lens_click(self, callback, remove=False):
        """Register a callback to execute when the lens widget is clicked.
        The callback will be called with three argument, x and y values
        clicked and the filtered dataframe.
        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._lens_click_handlers.register_callback(callback, remove=remove)

    def lens_click(self, event: str, x: float, y: float, edgeX: float, edgeY: float):
        """Programmatically trigger a lens click event.
        This will call the callbacks registered to the clicked lens
        widget instance.
        """
        xRel = self.data[self.x_field] - x
        xRad = edgeX - x
        yRel = self.data[self.y_field] - y
        yRad = edgeY - y

        if self.shape == 'square':
            distances = np.maximum(xRel.abs() / xRad, yRel.abs() / yRad)
        elif self.shape == 'circle':
            distances = np.sqrt(xRel**2 / xRad**2 + yRel**2 / yRad**2)
            # filtered = self.data.loc[distances <= 1]
            # self._lens_click_handlers(self, x, y, filtered, distances)
        else:
            raise TraitError('Other lens shape not supported yet')

        filtered = self.data.loc[distances <= 1]
        self._lens_click_handlers(self, x, y, filtered, distances)

    def _handle_frontend_msg(self, _widget, payload, _buffers):
        """Handle a msg from the front-end.
        Parameters
        ----------
        payload: dict
            Content of the msg.
        """
        if payload.get('event', '') == 'lens':
            self.lens_click(**payload)
