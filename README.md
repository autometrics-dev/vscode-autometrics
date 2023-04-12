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

### Unreleased

- [python] Improved detection logic: Now multiple decorators are supported
- Change build: use npm instead of yarn 3.x. This is so we can use dependencies (required so we can support typescript)

### 0.0.1

Initial release which brings in basic Python support

---

## Developing this extension

This extension is build using:

- [npm](https://docs.npmjs.com/cli/v9)
- [esbuild](https://github.com/evanw/esbuild) as the bundler

In order to test the extension locally, you may want to install the following extensions:

- [Rome](https://marketplace.visualstudio.com/items?itemName=rome.rome).
- [esbuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers) This is needed when vscode to debug the extension.

# How to release a new version

Create a new release using the github which matches the version number it should be released under.
