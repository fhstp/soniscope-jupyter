=============
Widget Properties
=============

data
-----
a pandas dataframe to be displayed.

*Note:* the complete dataframe is not synced with the frontend.

x_field, y_field
-----
column name to use for x-axis resp. y-axis.
While it is an empty string no marks are rendered/updated.

color_field
-----
column name to use for a categorical color encoding.
While it is an empty string all marks are rendered in the same color.
The palette uses the default colors from `Vega Lite`_ and Tableau_.

.. _`Vega Lite`: https://vega.github.io/vega-lite/docs/scale.html#scheme
.. _Tableau: https://www.tableau.com/about/blog/2016/7/colors-upgrade-tableau-10-56782

shape
-----
shape of the lens cursor.

Supported values:

* `'circle'`: circular lens around the mouse pointer
* `'square'`: square lens around the mouse pointer
* `'xonly'`: lens follows mouse pointer along x-axis and extends to all values along the y-axis
* `'yonly'`: lens follows mouse pointer along y-axis and extends to all values along the x-axis
* `'none'`: lens is disabled

size
-----
size of the lens relative to smaller side of the widget's substrate.

substrate_height, substrate_width
-----
size of the widget's substrate (i.e., the area between axes, where marks are plotted).
The widget itself is larger to accommodate the axes and their labels.
