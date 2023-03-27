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

If you mix tabs and spaces in your document, the detection of the autometrics might fall as it is assumed that the whole document is indented the same way

So if you have the following code

```python
class Operations():
    def __init__(self, **args):
        self.args = args

    @autometrics
    @lru_cache(maxsize=None,
      typed=True)
    def add(self, num1, num2):
```

And mix spaces and tabs in the line with `@autometrics` until and including the line `def add` in an inconsistent way, the extension will assume the indentation has changed and won't detect the decorator

### Unreleased

[python] Improved detection logic: Now multiple decorators are supported

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

# How to release a new version

Create a new release using the github which matches the version number it should be released under.
