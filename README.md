# Autometrics

This extension enhances integration between your codebase and Autometrics enhanced functions. If you're new to autometrics, please see [our documentation](https://docs.autometrics.dev/)

Currently supported languages:

- [TypeScript](https://www.npmjs.com/package/autometrics)
- [Python](https://pypi.org/project/autometrics/)

More languages will be supported in the future.

## Features

After decorating your code with autometrics, this extension will enrich the
information displayed for a given function on hover.

![Enhanced autometrics information](./images/demo.gif)

## Extension Settings

This extension contributes the following settings:

- `autometrics.prometheusUrl`: configure your Prometheus URL. This URL is used
  to create links to your Prometheus including useful autometrics based queries

- `autometrics.experimentalRustSupport`: this option allows you to use the embedded graphs with rust. However currently all functions are assumed to have been decorated with the autometrics macro. You probably don't want to enable this feature.

- `autometrics.graphPreferences`: this option allows you to configure what to use to render graphs. The possibilities are:

* embedded graph (which are demonstrated in the animation above)
* prometheus (which links out to the prometheus UI)
* autometrics explorer (which links to the web interface that is bundled with the autometrics CLI: see also [local development](https://docs.autometrics.dev/local-development))

- `autometrics.webServerURL` this option is only relevant if you've configured `autometrics.graphPreferences` to `use autometrics explorer`. The autometrics CLI serves the web interface on port 6789, however if you use a different port or don't run it on localhost you can update this setting to point to whatever you want.

---

## Developing this extension

This extension is built using:

- [yarn](yarnpkg.com)
- [esbuild](https://github.com/evanw/esbuild) as the bundler

In order to test the extension locally, you may want to install the following
extensions:

- [Rome](https://marketplace.visualstudio.com/items?itemName=rome.rome).
- [esbuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)
  This is needed when vscode to debug the extension.

If you want to install a release from GitHub manually, open the command palette via `cmd + shift + p` and pick the `install visx` option and point the filepicker to your local extension.

# How to release a new version

Create a new release using Github which matches the version number it should be
released under.

After tagging and releasing, merge `main` into the `release` branch. (The `release` branch should always reflect the latest released version on VSCode marketplate.)
