# Autometrics

This extension writes PromQL queries for instrumented functions or methods using autometrics libraries.

Current supported languages:

- [TypeScript](https://www.npmjs.com/package/autometrics)
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
- [typescript] Added TypeScript support

### 0.0.1

Initial release which brings in basic Python support

### 0.1.0

Update which brings TypeScript support using the TypeScript plugin `@autometrics/typescript-plugin`

### 0.2.0

Update to support tooltips over autometrics-decorated async python functions 


---

## Developing this extension

This extension is built using:

- [npm](https://docs.npmjs.com/cli/v9)
- [esbuild](https://github.com/evanw/esbuild) as the bundler

In order to test the extension locally, you may want to install the following extensions:

- [Rome](https://marketplace.visualstudio.com/items?itemName=rome.rome).
- [esbuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers) This is needed when vscode to debug the extension.

# How to release a new version

Create a new release using the github which matches the version number it should be released under.
