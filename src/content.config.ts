import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const cleanupBlogEntry = (opts: { entry: string }) => {
  const withoutIdx = opts.entry.replace(/^\d{3}-/, "");
  const withoutExt = withoutIdx.split(".")[0];
  return withoutExt;
};

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    generateId: cleanupBlogEntry,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

export const collections = { blog };
