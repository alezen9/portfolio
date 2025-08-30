import { visit } from "unist-util-visit";
import type { Literal, Parent } from "unist";
import type { Text } from "mdast";

// AST node type for mdxJsxTextElement (since it's not in core Unist)
interface MdxJsxTextElement extends Parent {
  type: "mdxJsxTextElement";
  name: string;
  attributes: {
    type: "mdxJsxAttribute";
    name: string;
    value: string;
  }[];
  children: Literal[];
}

export function remarkHighlightPlugin() {
  return (tree: Parent) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== "number") return;

      // const regex = /(?<!\\)!!(.+?)(?<!\\)!!/g; // !!text!!
      const regex = /(?<!\\)==(.+?)(?<!\\)==/g; // ==text==
      const value = node.value;
      const nodes: (Text | MdxJsxTextElement)[] = [];

      let match: RegExpExecArray | null;
      let lastIndex = 0;

      while ((match = regex.exec(value)) !== null) {
        // plain text before match
        if (match.index > lastIndex) {
          nodes.push({
            type: "text",
            value: value.slice(lastIndex, match.index),
          });
        }

        // highlighted span
        nodes.push({
          type: "mdxJsxTextElement",
          name: "span",
          attributes: [
            { type: "mdxJsxAttribute", name: "className", value: "highlight" },
          ],
          children: [{ type: "text", value: match[1] }],
        });

        lastIndex = match.index + match[0].length;
      }

      // trailing text
      if (lastIndex < value.length) {
        nodes.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      if (nodes.length) {
        parent.children.splice(index, 1, ...nodes);
      }
    });
  };
}
