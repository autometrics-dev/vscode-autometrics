export const styles: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    MozTabSize: "2",
    OTabSize: "2",
    tabSize: "2",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    whiteSpace: "pre-wrap",
    wordWrap: "normal",
    fontFamily: "var(--vscode-editor-font-family, monospace)",
    fontSize: "var(--vscode-editor-font-size, 14px)",
    color: "var(--vscode-foreground, #76d9e6)",
    textShadow: "none",
  },
  'pre[class*="language-"]': {
    MozTabSize: "2",
    OTabSize: "2",
    tabSize: "2",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    whiteSpace: "pre-wrap",
    wordWrap: "normal",
    fontFamily: "var(--vscode-editor-font-family, monospace)",
    fontSize: "var(--vscode-editor-font-size, 14px)",
    color: "var(--vscode-dropdown-foreground, --vscode-foreground, #76d9e6)",
    textShadow: "none",
    background:
      "var(--vscode-dropdown-background, --vscode-editor-background, #ffffff)",
    padding: "12px",
    borderRadius: "4px",
    border:
      "1px solid var(--vscode-dropdown-border, --vscode-widget-border, #ccc)",
    overflow: "auto",
    position: "relative",
  },
  'pre > code[class*="language-"]': {
    fontSize: "1em",
  },
  ':not(pre) > code[class*="language-"]': {
    background: "var(--vscode-editor-background, #ffffff)",
    padding: "0.15em 0.2em 0.05em",
    borderRadius: ".3em",
    border: "0.13em solid #7a6652",
    boxShadow: "1px 1px 0.3em -0.1em #000 inset",
  },
  'pre[class*="language-"] code': {
    whiteSpace: "pre",
    display: "block",
  },
  namespace: {
    opacity: ".7",
  },
  comment: {
    color: "var(--vscode-terminal-ansiGreen, #6f705e)",
  },
  prolog: {
    color: "var(--vscode-terminal-ansiGreen, #6f705e)",
  },
  doctype: {
    color: "var(--vscode-terminal-ansiGreen, #6f705e)",
  },
  cdata: {
    color: "var(--vscode-terminal-ansiGreen, #6f705e)",
  },
  operator: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #a77afe)",
  },
  boolean: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #a77afe)",
  },
  number: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #a77afe)",
  },
  "attr-name": {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
  },
  string: {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
  },
  entity: {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
    cursor: "help",
  },
  url: {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
  },
  ".language-css .token.string": {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
  },
  ".style .token.string": {
    color: "var(--vscode-terminal-ansiBrightYellow, #e6d06c)",
  },
  selector: {
    color: "var(--vscode-terminal-ansiBrightGreen, #a6e22d)",
  },
  inserted: {
    color: "var(--vscode-terminal-ansiBrightGreen, #a6e22d)",
  },
  atrule: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #ef3b7d)",
  },
  "attr-value": {
    color: "var(--vscode-terminal-ansiBrightMagenta, #ef3b7d)",
  },
  keyword: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #ef3b7d)",
  },
  important: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #ef3b7d)",
    fontWeight: "bold",
  },
  deleted: {
    color: "var(--vscode-terminal-ansiBrightMagenta, #ef3b7d)",
  },
  regex: {
    color: "var(--vscode-foreground, #76d9e6)",
  },
  statement: {
    color: "var(--vscode-foreground, #76d9e6)",
    fontWeight: "bold",
  },
  placeholder: {
    color: "var(--vscode-editor-background, #fff)",
  },
  variable: {
    color: "var(--vscode-editor-background, #fff)",
  },
  bold: {
    fontWeight: "bold",
  },
  punctuation: {
    color: "#bebec5",
  },
  italic: {
    fontStyle: "italic",
  },
  "code.language-markup": {
    color: "#f9f9f9",
  },
  "code.language-markup .token.tag": {
    color: "#ef3b7d",
  },
  "code.language-markup .token.attr-name": {
    color: "#a6e22d",
  },
  "code.language-markup .token.attr-value": {
    color: "#e6d06c",
  },
  "code.language-markup .token.style": {
    color: "var(--vscode-foreground, #76d9e6)",
  },
  "code.language-markup .token.script": {
    color: "var(--vscode-foreground, #76d9e6)",
  },
  "code.language-markup .token.script .token.keyword": {
    color: "var(--vscode-foreground, #76d9e6)",
  },
  ".line-highlight.line-highlight": {
    padding: "0",
    background: "rgba(255, 255, 255, 0.08)",
  },
  ".line-highlight.line-highlight:before": {
    padding: "0.2em 0.5em",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    color: "black",
    height: "1em",
    lineHeight: "1em",
    boxShadow: "0 1px 1px rgba(255, 255, 255, 0.7)",
  },
  ".line-highlight.line-highlight[data-end]:after": {
    padding: "0.2em 0.5em",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    color: "black",
    height: "1em",
    lineHeight: "1em",
    boxShadow: "0 1px 1px rgba(255, 255, 255, 0.7)",
  },
};
