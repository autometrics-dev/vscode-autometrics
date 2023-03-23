import * as assert from "node:assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../../extension";

async function createTestDocument() {
  const document = await vscode.workspace.openTextDocument({
    language: "python",
  });

  const editor = await vscode.window.showTextDocument(document);
  const content = `from autometrics.autometrics import autometrics

@autometrics
def div_unhandled(num1,num2):
  result = num1 / num2
  return result 
`;
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
    const document = await createTestDocument();

    const line = 3;
    const character = 5;
    const position = new vscode.Position(line, character);
    const hover = myExtension.PythonHover.provideHover(document, position);
    assert.ok(hover, "Should not be undefined/falsy");
  });

  test("should not return hover content when hovering over the decorator", async () => {
    const document = await createTestDocument();

    const line = 2;
    const character = 5;
    const position = new vscode.Position(line, character);
    const hover = myExtension.PythonHover.provideHover(document, position);
    assert.strictEqual(hover, undefined, "Should be undefined");
  });
});
