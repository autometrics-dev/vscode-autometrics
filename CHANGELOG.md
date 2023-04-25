# Change Log

## [Unreleased]

- [chore] We now use Yarn again instead of NPM. This is necessary to pull in
  `fiberplane-charts` directly from a workspace repository. The problem with
  packaging has been solved with a Yarn plugin.

## 0.1.0

- [python] Improved detection logic: Now multiple decorators are supported
- Change build: use npm instead of yarn 3.x. This is so we can use dependencies
  (required so we can support typescript)
- [typescript] Added TypeScript support

## 0.0.1

- Initial release which brings in basic Python support
