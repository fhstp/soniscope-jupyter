# Development Logbook

This logbook chronicles my steps to make a Jupyter widget for SoniVis.
It has the steps taken with all pitfalls thus it is not a good tutorial ;-)

## Step 1: create project, setup and test

This is based on the tutorial <https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20Custom.html#Setup-a-dev-environment>.

in this project:

```bash
# create github repo & clone it

#setup from template
cookiecutter https://github.com/jupyter-widgets/widget-ts-cookiecutter

# merge created folder into cloned folder & commit

# active venv from `sonivis-jupyter`

`pip install -e ".[test, examples]"` # --> fails
`pip install -e .` # --> fails (error: [Errno 2] No such file or directory: 'LICENSE.txt')
git mv LICENSE LICENSE.txt
`pip install -e ".[test, examples]"` #  --> Successfully installed

# jupyter labextension develop --overwrite . # failed (OSError: Symlinks can be activated on Windows 10 for Python version 3.8 or higher by activating the 'Developer Mode'. That may not be allowed by your administrators.)
# Windows Startmenu "Entwicklerfunktionen verwenden" Entwicklermodus einschalten
# jupyter labextension develop --overwrite . # --> succeeds, but currently we still use Notebook no Lab

jupyter nbextension install --sys-prefix --symlink --overwrite --py sonivis_lens_widget
jupyter nbextension enable --sys-prefix --py sonivis_lens_widget

```

```bash
jupyter notebook
```

*Update:* `yarn` was required to build.
Either install it globally, install it inside the project's `node_modules`
```bash
npm install yarn
```
or we adapt the scripts in `package.json` to try without it (preferred).

## Step 2: Rename widget classes and components from Example... to Lens..

* Python part of widget: `sonivis_lens_widget/example.py`
  * change the import in `sonivis_lens_widget/__init__.py`
* JavaScript part of widget: `src/widget.ts`
  * change the import in `src/index.ts`
* n.b. also rename references in test and example code (otherwise the build action on GitHub fails)

## Step 3: integrate D3

in this project:

```bash
npm install --save d3
npm i --save-dev @types/d3
```

For unit tests, we need to adapt `jest.config.js`
(cp. <https://github.com/facebook/jest/issues/12036#issuecomment-981769870>)

```javascript
transformIgnorePatterns: ['/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates|(@jupyter(lab|-widgets)/.*)/)'],
```

n.b. you can run the test build locally:

```bash
yarn run lint:check
pytest
yarn run test
```

We can import D3 as usual & work with `DOMWidgetView`'s HTMLElement:

```javascript
import * as d3 from 'd3';

const parent = this.el;
const svg = d3.select(parent).append('svg');
```

To demonstrate D3, we simply display random data in a packed bubble chart (copied from my demo at <https://github.com/alex-rind/ts-playground/tree/master/webpack4-tsonly>).

## Step 4: get mouse events out of LensWidget via the synchronized WidgetModel

```javascript
mark.on('mouseenter', (evt, d: any) => {
  model.set('value', d.data.type);
  model.save_changes();
});
```

## Step 5: get mouse events out of LensWidget via message

The standard button widget has an `on_click` method that allows you to listen for the user clicking on the button.
The click event itself is **stateless**.

cp. implementation of standard button widget
- Python: <https://github.com/jupyter-widgets/ipywidgets/blob/master/python/ipywidgets/ipywidgets/widgets/widget_button.py>
- JavaScript: <https://github.com/jupyter-widgets/ipywidgets/blob/master/packages/controls/src/widget_button.ts>

We can listen directly on frontend messages received in the user code:
```python
def on_button_clicked(widget, payload, _b):
    with output:
        print(widget, payload)

source.on_msg(on_button_clicked)
```

The frontend `LensView` simply calls:
```javascript
  view.send({ event: 'click', fruit: d.data.type, count: d.data.count });
```
No change in class `LensModel`.


### 5b get events from backend to frontend

Jupyter Widgets use Backbone.js but process messages.

You can debug messages received with `all`:

```javascript
  view.on('all', () => console.log('hello view'));
  view.model.on('all', (arg) => console.log(arg));
```

To pass a app specific message use the method `custom`:

```python
  self.send({'method': 'custom', 'todo': 'highlight', 'idx': idx,})
```

```javascript
  view.model.on('msg:custom', (payload) => console.log(payload));
```

## Step 6: get mouse events out of LensWidget via event listener

If additional data transformation is needed on the backend side, we can adapt 3 functions from
<https://github.com/jupyter-widgets/ipywidgets/blob/master/python/ipywidgets/ipywidgets/widgets/widget_button.py>
into class LensWidget:

```python
from ipywidgets import DOMWidget, CallbackDispatcher

[...]
```

No changes to the TypeScript frontend.

## Step 7: get a table from python into the widget

We transport only visual properties and ids from backend to frontend.

using Traitlets for
- `data` a Pandas data frame, not synced
- `x_field` string column name, synced for label
- `_marks_x` list of x coordinates, private on Python side, synced to JavaScript

```python
w = LensWidget()
w.set_data(daily, 'temp', 'hum')
# or
w = LensWidget()
w.data = daily
w.x_field = 'temp'
w.y_field = 'hum'
# or
w = LensWidget(daily, 'temp', 'hum')
```

Add `pandas` dependency to `pyproject.toml`:
```
requires = ["jupyter_packaging==0.7.9", "jupyterlab==3.*", "pandas>=1.3.0", "setuptools>=40.8.0", "wheel"]
```
and to `setup.py`
```
install_requires = [
  ...
  'pandas>=1.3.0',
```

## Step 8: display scatterplot

Implementation decision: should we send data for each field separately?
- separately causes larger number of repaints
- together causes larger JSON payload when updating only parts of plot
- currently not sending JSON as long as at least one field name is empty ('')

- [X] show data
- [X] show axes and axes labels

## Step 9: display a circle lens under mouse

Events
- mouseenter -> activate lens cursor
- mouseleave -> deactivate lens cursor
- mousemove -> update lens cursor
- pointerdown -> send event with data coordinates
- wheel -> change diameter in model
- diameter model change -> change lens cursor radius

- [X] square lens cursor
- [ ] trigger visual pulse
- [ ] move lens cursor to DOM toplevel to increase performance
- [ ] resize diameter by multi-touch (cp. <https://observablehq.com/@d3/multitouch#cell-308>)
- [ ] sync x, y position as traitlet --> postpone, not urgently needed

## Step 10: react on click

- [X] pointerdown -> view.send()
- [X] transform screen coordinates to data values
- [X] pass coordinates of center & edge to know lens size in both dimensions
- [X] filter dataframe
- [X] trigger custom event

## Step 11: document & clean-up

- [X] make MIT license and copyright consistently
- [X] remove packed bubble chart demo

Deploy to pypi (cp. <https://towardsdatascience.com/how-to-build-your-first-python-package-6a00b02635c9>):

```
pip install twine hatch
# python setup.py sdist bdist_wheel
hatch build
twine check dist/soniscope_jupyter-0.1.5*
twine upload dist/soniscope_jupyter-0.1.5*
```

Automated tests (cp. Github build)

```
npm run lint:check  # wrong TypeScript version? does not matter?
npm run test
pytest
```

## Step 12: feature requests

- [X] include distance in triggered event
- [X] calculate distance in terms of a growing rectangle
- [X] rename diameter to size
- [X] change widget size (actually width & height of spatial substrate)
- [X] lense shape none
- [X] lense shape xonly and yonly
- [ ] heatmap

Bugfixes

- [X] bei touch auch die Linsenposition setzen (ODER linsen verschiebung auch bei touch move)
- [ ] mousewheel triggers scroll on Firefox

## Step ...: continuous events using dragging

Events
- mousedown -> send event, trigger visual pulse , activate movelistener
- mousemove -> send event while dragging
- mouseuup -> send stop event


## Step ...: maintain state

check `serializers` in `widget.ts`

## Step ...: get a complex object out of LensWidget

> Warning: Syncing mutable types
Please keep in mind that mutable types will not necessarily be synced when they are modified. For example appending an element to a list will not cause the changes to sync. Instead a new list must be created and assigned to the trait for the changes to be synced.
An alternative would be to use a third-party library such as spectate, which tracks changes to mutable data types.
