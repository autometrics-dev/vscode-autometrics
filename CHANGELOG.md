# Changelog

# [0.5.1]

- add TypeScript plugin fixes for v5
- fix `@fiberplane/*` scoped packages

## [0.5.0]
- Remove dependency on provider runtime and query prometheus directly
- Add support for relative time ranges
- Add refresh button
- clean up styling
- add date picker to single chart views
- add toggle for showing/hiding PromQL queries
- add support for the "module" label for certain graphs
- add tooltips to the graphs
- update bundled typescript plugin which contains fixes for usage in combination with typescript 5
- add info in the UI that shows how to zoom in/drag time range directly on the graph

## [0.4.0]
- Add date picker to the function metrics panel
- [chore] update TypeScript plugin dependency

# 0.3.0
- [chore] Upgrade several dependencies
- Update panel to support showing multiple graphs
- Update styling for single graph charts
- Use more of the vscode theme colors for graphs
- [chore] We now use Yarn again instead of NPM. This is necessary to pull in
  `fiberplane-charts` directly from a workspace repository. The problem with
  packaging has been solved with a Yarn plugin.

# 0.2.1

- [chore] update TS plugin dependency to `v0.4.0`

## 0.2.0

- [fix] add support for async functions in python

## 0.1.0

- [python] Improved detection logic: Now multiple decorators are supported
- Change build: use npm instead of yarn 3.x. This is so we can use dependencies
  (required so we can support typescript)
- [typescript] Added TypeScript support

## 0.0.1

- Initial release which brings in basic Python support
