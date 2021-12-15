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

in the other project:

```bash
jupyter notebook
```

## Step 2: Rename widget classes and components from Example... to Lens..

n.b. also rename references in test and example code (otherwise the build action on GitHub fails)

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
