#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Alexander Rind.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import DOMWidget, CallbackDispatcher, register
from traitlets import Unicode, Instance, List, Float, observe, validate, TraitError
from ._frontend import module_name, module_version
import pandas as pd


@register
class LensWidget(DOMWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('LensModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('LensView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    value = Unicode('none').tag(sync=True)
    """ experimental variable from tutorial """

    x_field = Unicode('').tag(sync=True)
    """ column name used for x axis. While it is an empty string no marks are rendered/updated. """
    y_field = Unicode('').tag(sync=True)
    """ column name used for y axis. While it is an empty string no marks are rendered/updated. """
    data = Instance(klass=pd.DataFrame)

    # value_trait=List(Float()), key_trait=Unicode()).tag(sync=True)
    # _marks = Dict(traits={'x': List(Float()),
    #               'y': List(Float())}).tag(sync=True)
    _marks_x = List(Float()).tag(sync=True)
    """ internal data with mark x positions as column vector """
    _marks_y = List(Float()).tag(sync=True)
    """ internal data with mark y positions as column vector """

    def __init__(self, data=None, x_field=None, y_field=None, **kwargs):
        super().__init__(**kwargs)
        self._click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_button_msg)

        # if isinstance(data, pd.DataFrame) == True:
        if data is None:
            self.data = pd.DataFrame()
        else:
            if x_field == None and y_field == None:
                self.data = data
            else:
                self.set_data(data, x_field, y_field)

    def set_data(self, data, x_field, y_field):
        self.x_field = ''
        self.y_field = ''
        self.data = data
        self.x_field = x_field
        self.y_field = y_field

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

    def on_click(self, callback, remove=False):
        """Register a callback to execute when the button is clicked.
        The callback will be called with one argument, the clicked button
        widget instance.
        Parameters
        ----------
        remove: bool (optional)
            Set to true to remove the callback from the list of callbacks.
        """
        self._click_handlers.register_callback(callback, remove=remove)

    def click(self):
        """Programmatically trigger a click event.
        This will call the callbacks registered to the clicked button
        widget instance.
        """
        self._click_handlers(self)

    def _handle_button_msg(self, _, content, buffers):
        """Handle a msg from the front-end.
        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'click':
            self.click()
