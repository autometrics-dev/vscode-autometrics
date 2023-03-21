module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  ignorePatterns: ["out", "dist", "**/*.d.ts"],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:sonarjs/recommended",
    "plugin:unicorn/recommended",
  ],
  rules: {
    "import/no-unresolved": [
      "error",
      {
        // There's no vscode module installed so just ignore the "failing" import
        // (as this will succeed wheen running as a vscode extension)
        ignore: ["vscode"],
      },
    ],
    // This is turned off because otherwise we get many complaints about the use of
    // `__dirname` in the generated test code
    "unicorn/prefer-module": "off",
  },

  settings: {
    "import/resolver": {
      // You will also need to install and configure the TypeScript resolver
      // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
      typescript: true,
      node: true,
    },
  },
};
