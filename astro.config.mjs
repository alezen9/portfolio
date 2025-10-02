// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
// import preact from "@astrojs/preact";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { remarkHighlightPlugin } from "./src/utils/remarkHighlightPlugin";
import { rehypeScopedH3Ids } from "./src/utils/rehypeScopeH3Ids";
import { rehypeTargetBlank } from "./src/utils/rehypeTargetBlank";

export default defineConfig({
  site: "https://aleksandargjoreski.dev",
  base: "/",
  trailingSlash: "ignore",
  integrations: [
    sitemap(),
    // preact(),
    svelte(),
    mdx({
      rehypePlugins: [rehypeScopedH3Ids, rehypeTargetBlank, rehypeKatex],
      remarkPlugins: [remarkHighlightPlugin, remarkMath],
    }),
  ],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
});
