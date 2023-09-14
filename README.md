
# soniscope-jupyter

jupyter notebook widget with a scatter plot and an interactive lens to enable interactive sonification

## Installation

You can install using `pip`:

```bash
pip install soniscope_jupyter
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:
```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] soniscope_jupyter
```

You can upgrade using `pip`:

```bash
pip install soniscope_jupyter --upgrade --upgrade-strategy only-if-needed
```

## Demo

Install packages:
```
pip install jupyterlab sc3nb
```
Download SuperCollider (version 3.12.2) from <https://supercollider.github.io/download> and install it.

Start Jupyter Lab:
```
jupyter lab
```

Open the notebook document [`SoniScope.ipynb`](examples/SoniScope.ipynb).

Run all cells from top to "Ploting the user interface".


## Development Installation

Create a dev environment:
```bash
conda create -n soniscope_jupyter-dev -c conda-forge nodejs python jupyterlab
conda activate soniscope_jupyter-dev
```
or
```bash
python -m venv venv
source venv/Scripts/activate
python -m pip install -U pip setuptools
pip install nodejs 'jupyterlab==3.6.5' jupyter-packaging
```

For a development installation the version of the python package `jupyterlab`
and the npm package `@jupyterlab/builder` need to match.

Install the python. This will also build the TS package.
```bash
pip install -e ".[test, examples]"
```

When developing your extensions, you need to manually enable your extensions with the
notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
# npm install # this might be necessary on a fresh development install
npm run build
```

For classic notebook, you need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py soniscope_jupyter
jupyter nbextension enable --sys-prefix --py soniscope_jupyter
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

To use symlinks in Windows 10, you can turn on Windows' developer mode.

### How to see your changes
#### Typescript:
If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
npm run watch
# Run JupyterLab in another terminal
jupyter lab
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

#### Python:
If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.

## Updating the version

To update the version, install tbump and use it to bump the version.
By default it will also create a tag.

```bash
pip install tbump
tbump <new-version>
```

## Citation

Kajetan Enge, Alexander Rind, Michael Iber, Robert Höldrich, and Wolfgang Aigner.
["Towards Multimodal Exploratory Data Analysis: SoniScope as a Prototypical Implementation".](https://doi.org/10.2312/evs.20221095)
In: Proceedings of the 24th Eurographics Conference on Visualization (EuroVis) – Short Papers, p. 67-71.
Rome, Eurographics Association, 2022. \
<https://doi.org/10.2312/evs.20221095>
