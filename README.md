# Autometrics

This extension enhances tooltips for projects that use autometrics.

Current supported languages:

- [Python](https://pypi.org/project/autometrics/)

More languages will be supported in the future.

## Features

After decorating your code with autometrics, this extension will enrich the information displayed for a given function on hover.

![Enhanced autometrics information](./images/demo.gif)

## Extension Settings

This extension contributes the following settings:

- `autometrics.prometheusUrl`: configure your Prometheus URL. This URL is used to create links to your Prometheus including useful autometrics based queries

## Known Issues

Right now, the detection for the `@autometrics` decorator is fairly simplistic. This means that the detection will sometimes fail if you use multiple decorators on a single function (the autometrics decorator should be right above the function definition).

So this will work:

```python
@app.get("/")
@autometrics
def read_root():
    return {"Hello": "World"}
```

However this won't work:

```python
@autometrics
@app.get("/")
def read_root():
    return {"Hello": "World"}
```

### Unreleased

Change build: use npm instead of yarn 3.x. This is so we can use dependencies (required so we can support typescript)

### 0.0.1

Initial release which brings in basic Python support

---

## Developing this extension

This extension is build using:

- [yarn](yarnpkg.com)
- [esbuild](https://github.com/evanw/esbuild) as the bundler
- [dprint](https://github.com/dprint/dprint) as the formatter

In order to test the extension locally, you may want to install the following extensions:

- [Dprint code](https://marketplace.visualstudio.com/items?itemName=dprint.dprint). So vscode can format the code for you. You can also run `yarn format` before committing so all code is correctly formatted.
- [esbuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers) This is needed when vscode to debug the extension.
