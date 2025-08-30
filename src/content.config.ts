import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const cleanupBlogEntry = (opts: { entry: string }) => {
  const [name] = opts.entry.split("/");
  const withoutIdx = name.replace(/^\d{3}-/, "");
  return withoutIdx;
};

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/index.{md,mdx}",
    generateId: cleanupBlogEntry,
  }),
  schema: () =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      state: z.literal("Draft").optional(),
    }),
});

export const collections = { blog };
