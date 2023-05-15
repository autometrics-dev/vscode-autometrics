# Change Log

## [Unreleased]

- Update panel to support showing multiple graphs
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
