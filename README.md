
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

## Development Installation

Create a dev environment:
```bash
conda create -n soniscope_jupyter-dev -c conda-forge nodejs yarn python jupyterlab
conda activate soniscope_jupyter-dev
```
or
```bash
python -m venv venv
source venv/Scripts/activate
pip install nodejs jupyterlab jupyter-packaging
```

Install the python. This will also build the TS package.
```bash
pip install -e ".[test, examples]"
```

When developing your extensions, you need to manually enable your extensions with the
notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
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
