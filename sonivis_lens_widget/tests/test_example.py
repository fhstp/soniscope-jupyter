#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Alexander Rind & the SoniVis team.
# Distributed under the terms of the MIT License (see LICENSE.txt).

import pytest
import pandas as pd
from traitlets.traitlets import TraitError

from ..lens_widget import LensWidget

df = pd.DataFrame({'var1': {0: 1, 1: 2, 2: 3, 3: 4, 4: 5},
                   'var2': {0: 1, 1: 4, 2: 9, 3: 16, 4: 25}})


def test_example_creation_blank():
    w = LensWidget()
    assert w.data.size == 0
    assert len(w._marks_x) == 0


def test_widget_create_other_datatype():
    with pytest.raises(TraitError):
        LensWidget([1, 3])


def test_example_creation_w_data():
    w = LensWidget(df)
    assert w.data.size == df.size
    assert len(w._marks_x) == 0


def test_example_creation_full():
    w = LensWidget(df, 'var1', 'var2')
    assert w.data.size == df.size
    assert len(w._marks_x) == len(df.index)


def test_example_creation_w_data():
    w = LensWidget()
    w.data = df
    w.x_field = 'var1'
    w.y_field = 'var2'
    assert w.data.size == df.size
    assert len(w._marks_x) == len(df.index)


def test_example_set_wrong_field():
    w = LensWidget(df, 'var1', 'var2')
    with pytest.raises(TraitError):
        w.x_field = 'var5'
