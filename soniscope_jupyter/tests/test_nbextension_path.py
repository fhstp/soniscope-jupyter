#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Alexander Rind & the SoniVis team.
# Distributed under the terms of the MIT License (see LICENSE.txt).


def test_nbextension_path():
    # Check that magic function can be imported from package root:
    from soniscope_jupyter import _jupyter_nbextension_paths
    # Ensure that it can be called without incident:
    path = _jupyter_nbextension_paths()
    # Some sanity checks:
    assert len(path) == 1
    assert isinstance(path[0], dict)
