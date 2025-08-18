// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://aleksandargjoreski.dev",
  base: "/",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap(), preact(), svelte()],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
  },
});
