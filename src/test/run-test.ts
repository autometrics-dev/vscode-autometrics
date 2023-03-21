import * as path from "node:path";

import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (error) {
    console.error("Failed to run tests", error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();
