import * as assert from "node:assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../../extension";

const BASIC_CONTENT = `from autometrics.autometrics import autometrics

@autometrics
def div_unhandled(num1, num2):
  result = num1 / num2
  return result 
`;

async function createTestDocument(content: string) {
  const document = await vscode.workspace.openTextDocument({
    language: "python",
  });

  const editor = await vscode.window.showTextDocument(document);
  const editBuilder = (textEdit: vscode.TextEditorEdit) => {
    textEdit.insert(new vscode.Position(0, 0), String(content));
  };

  await editor.edit(editBuilder, {
    undoStopBefore: true,
    undoStopAfter: false,
  });

  return document;
}

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("should return hover content when hovering over a function", async () => {
    const document = await createTestDocument(BASIC_CONTENT);

    const line = 3;
    const character = 5;
    const position = new vscode.Position(line, character);
    const hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);
  });

  test("should not return hover content when hovering over the decorator", async () => {
    const document = await createTestDocument(BASIC_CONTENT);

    const line = 2;
    const character = 5;
    const position = new vscode.Position(line, character);
    const hover = myExtension.PythonHover.provideHover(document, position);
    assert.strictEqual(hover, undefined, "Should be undefined");
  });

  test("should return hover content when hovering over a function with multiple decorators", async () => {
    const content = `from autometrics.autometrics import autometrics
from functools import lru_cache

@autometrics
@lru_cache(maxsize=None)
def div_unhandled(num1, num2):
  result = num1 / num2
  return result 
    `;

    let document = await createTestDocument(content);

    let line = 5;
    let character = 5;
    let position = new vscode.Position(line, character);
    let hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);

    const multilineContent = `from autometrics.autometrics import autometrics
from functools import lru_cache

@autometrics
@lru_cache(maxsize=None,
  typed=True)
def div_unhandled(num1, num2):
  result = num1 / num2
  return result
`;

    document = await createTestDocument(multilineContent);
    line = 6;
    character = 5;
    position = new vscode.Position(line, character);
    hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);
  });

  test("should return hover content when hovering over a class method", async () => {
    const content = `from autometrics.autometrics import autometrics
from functools import lru_cache

class Operations():
    def __init__(self, **args):
        self.args = args

    @autometrics
    @lru_cache(maxsize=None,
      typed=True)
    def add(self, num1, num2):
        self.num1 = num1
        self.num2 = num2
        return self.num1 + self.num2
    `;

    const document = await createTestDocument(content);

    const line = 10;
    const character = 9;
    const position = new vscode.Position(line, character);
    const hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);
  });

  test("should support a mix of tabs and spaces", async () => {
    const content = `from autometrics.autometrics import autometrics
from functools import lru_cache

class Operations():
        def __init__(self, **args):
                self.args = args

        @autometrics
        @lru_cache(maxsize=None,
          typed=True)
\t\tdef add(self, num1, num2):
                self.num1 = num1
                self.num2 = num2
                return self.num1 + self.num2

        @autometrics
        @lru_cache(maxsize=None,
          typed=True)
    \tdef subtract(self, num1, num2):
                self.num1 = num1
                self.num2 = num2
                return self.num1 - self.num2

        @autometrics
    \t@lru_cache(maxsize=None,
          typed=True)
    \tdef multiply(self, num1, num2):
                self.num1 = num1
                self.num2 = num2
                return self.num1 * self.num2

\t\t@autometrics
    \t@lru_cache(maxsize=None,
          typed=True)
    \tdef divide(self, num1, num2):
                self.num1 = num1
                self.num2 = num2
                return self.num1 / self.num2
`;

    const document = await createTestDocument(content);

    let line = 10;
    const character = 9;
    let position = new vscode.Position(line, character);
    let hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);

    line = 18;
    position = new vscode.Position(line, character);
    hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);

    line = 26;
    position = new vscode.Position(line, character);
    hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);

    line = 34;
    position = new vscode.Position(line, character);
    hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover);
  });
});
