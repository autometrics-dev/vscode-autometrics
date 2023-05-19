import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { styles } from "./prismStyles";

export function CodeBlock({ query }: { query: string }) {
  return (
    <SyntaxHighlighter language="promql" style={styles}>
      {query}
    </SyntaxHighlighter>
  );
}
