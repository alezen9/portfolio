// src/utils/rehypeTargetBlank.ts
import { visit } from "unist-util-visit";
import type { Root } from "hast";

export function rehypeTargetBlank() {
  return (tree: Root) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "a") return;
      const href: string | undefined = node.properties?.href;
      if (!href) return;

      // Only treat http(s) as external; leave /, #, ../, mailto, tel alone
      const isHttp = href.startsWith("http://") || href.startsWith("https://");
      if (!isHttp) return;

      node.properties = node.properties || {};
      node.properties.target = "_blank";

      const rel = new Set(
        String(node.properties.rel || "")
          .split(" ")
          .filter(Boolean),
      );
      rel.add("noopener");
      rel.add("noreferrer");
      node.properties.rel = Array.from(rel).join(" ");
    });
  };
}
