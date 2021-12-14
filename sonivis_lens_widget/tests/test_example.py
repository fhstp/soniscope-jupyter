#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Alexander Rind.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..lens_widget import LensWidget


def test_example_creation_blank():
    w = LensWidget()
    assert w.value == 'Hello World'
