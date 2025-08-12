// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://alezen9.github.io",
  base: "portfolio",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap(), preact()],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
  },
});
