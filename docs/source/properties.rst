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
