// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

function getRequestRate(
  functionName: string,
  options: {
    baseUrl: string;
  }
) {
  const query = `# Rate of calls to the \`${functionName}\` function per second, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count{function="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getCalledByRequestRate(
  functionName: string,
  options: {
    baseUrl: string;
  }
) {
  const query = `# Rate of calls to functions called by \`${functionName}\` per second, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count{caller="${functionName}"}[5m]))'`;
  return buildQuery(query, options);
}

function getErrorRatio(
  functionName: string,
  options: {
    baseUrl: string;
  }
) {
  const query = `# Percentage of calls to the \`${functionName}\` function that return errors, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count{function="${functionName}",result="error"}[5m])) /
sum by (function, module) (rate(function_calls_count{function="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getCalledByErrorRatio(
  functionName: string,
  options: {
    baseUrl: string;
  }
) {
  const query = `# Percentage of calls to functions called by \`${functionName}\` that return errors, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count{caller="${functionName}",result="error"}[5m])) /
sum by (function, module) (rate(function_calls_count{caller="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getLatency(
  functionName: string,
  options: {
    baseUrl: string;
  }
) {
  const query = `# 95th and 99th percentile latencies for the \`${functionName}\` function
  
histogram_quantile(0.99, sum by (le, function, module) (rate(function_calls_duration_bucket{function="${functionName}"}[5m]))) or
histogram_quantile(0.95, sum by (le, function, module) (rate(function_calls_duration_bucket{function="${functionName}"}[5m])))'`;
  return buildQuery(query, options);
}

function buildQuery(query: string, options: { baseUrl: string }): string {
  const parameters = new URLSearchParams();
  parameters.set("g0.expr", query);
  parameters.set("g0.tab", "0");
  const url = new URL(`${options.baseUrl}/graph?${parameters.toString()}`);
  return url.toString();
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerHoverProvider("python", {
    provideHover(document, position) {
      const textLine = document.lineAt(position.line);

      // TODO: (JF) we should also display the tooltip when
      //
      const functionRegex = /def\s*(?<name>[\dA-z]+)?\s*\(/;
      const match = textLine.text.match(functionRegex);
      const name = match?.groups?.name;
      const decoratorRegex = /@autometrics/g;
      if (
        name &&
        position.line > 1 &&
        decoratorRegex.test(document.lineAt(position.line - 1).text)
      ) {
        const options = {
          // TODO: (JF) Make this configurable
          baseUrl: "http://localhost:1234",
        };

        return {
          contents: [
            `## Autometrics

View the live metrics for the  \`${name}\`  function:

* [Request Rate](${getRequestRate(name, options)})
* [Error Ratio](${getErrorRatio(name, options)})
* [Latency (95th and 99th percentiles)](${getLatency(name, options)})

Or, dig into the metrics of functions called by ${name}:

* [Request Rate](${getCalledByRequestRate(name, options)})
* [Error Ratio](${getCalledByErrorRatio(name, options)})`,
          ],
        };
      }
    },
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "autometrics.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from autometrics!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
