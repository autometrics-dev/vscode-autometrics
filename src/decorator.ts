import * as vscode from "vscode";

function lineUnindented(text: string, indentation: string) {
  return text === "" || text.startsWith(indentation) === false;
}

const DEFAULT_TAB_SIZE = 8;

function expandIndentationVariants(indentation: string) {
  let tabSize =
    vscode.window.activeTextEditor?.options.tabSize ?? DEFAULT_TAB_SIZE;
  if (typeof tabSize === "string") {
    try {
      tabSize = Number.parseInt(tabSize, 10);
    } catch {
      tabSize = DEFAULT_TAB_SIZE;
    }
  }

  const spaces = " ".repeat(tabSize);
  const normalizedIndentation = indentation.replace("\t", spaces);
  // check if it's a clean multiple
  const rest = normalizedIndentation.length % tabSize;

  // If it's not a clean multiple of what we thing the tab size is
  // then don't make any guesses as to whether there's a mix of tabs/spaces
  if (rest !== 0) {
    return [indentation];
  }

  return generateSpaceOrTab(spaces, normalizedIndentation.length / tabSize);
}

function generateSpaceOrTab(spaces: string, depth: number): string[] {
  if (depth === 0) {
    return [spaces, "\t"];
  }

  const results = generateSpaceOrTab(spaces, depth - 1).map((value) => {
    return [`${value}${spaces}`, `${value}\t`];
  });

  return results.flat();
}

function extractDecoratorName(text: string) {
  const decoratorRegex = /@(?<name>[\dA-z]+)/;
  const match = text.match(decoratorRegex);
  const name = match?.groups?.name;

  if (name) {
    return name;
  }
}

export function hasAutometricsDecorator(
  document: vscode.TextDocument,
  line: number,
  indentation: string,
) {
  let currentLine = line;
  const indentations = expandIndentationVariants(indentation);

  while (currentLine >= 0) {
    const text = document.lineAt(currentLine).text;

    if (
      indentations.some(
        (indentation) => lineUnindented(text, indentation) === false,
      )
    ) {
      console.log(
        indentations.map((value) => encodeURIComponent(value)).join("\n"),
      );
      console.log("unindented!", encodeURIComponent(text), currentLine);
      return false;
    }

    const decorator = extractDecoratorName(text);
    if (decorator === "autometrics") {
      return true;
    }

    currentLine -= 1;
  }
}
