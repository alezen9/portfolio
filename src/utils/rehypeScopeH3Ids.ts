// rehype-scoped-h3-ids.ts
import type { Root, Element, Text, Content } from "hast";
import { visit } from "unist-util-visit";
import Slugger from "github-slugger";

/** Minimal text extractor without hast-util-to-string */
function getText(node: Element | Content): string {
  if (node.type === "text") return (node as Text).value;
  if ((node as Element).children) {
    return ((node as Element).children as Content[])
      .map((c) => getText(c))
      .join("");
  }
  return "";
}

/**
 * Ensure H3 ids are scoped with the nearest preceding H2's id.
 * Example:
 *   <h2 id="style">Style</h2>
 *   <h3 id="style-cascade">Cascade</h3>
 *   <h3 id="style-specificity">Specificity</h3>
 *
 * Notes:
 * - If rehype-slug already set ids, we reuse them.
 * - Otherwise we compute slugs from text.
 */
export function rehypeScopedH3Ids() {
  return (tree: Root) => {
    const h2Slugger = new Slugger();
    let currentH2: string | null = null;

    visit(tree, "element", (node: Element) => {
      if (node.tagName === "h2") {
        const props = (node.properties ||= {});
        // Prefer existing id (e.g., from rehype-slug), else compute from text.
        let id = (props.id as string) || h2Slugger.slug(getText(node));
        props.id = id;
        currentH2 = id;
      } else if (node.tagName === "h3") {
        const props = (node.properties ||= {});
        // Derive base slug for h3 (reuse existing id if present).
        const h3Slugger = new Slugger();
        const base = (props.id as string) || h3Slugger.slug(getText(node));
        const scoped = currentH2 ? `${currentH2}-${base}` : base;
        props.id = scoped;
      }
    });
  };
}
