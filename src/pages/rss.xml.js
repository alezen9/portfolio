import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection(
    "blog",
    ({ data }) => data.state === "Release",
  );
  return rss({
    title: "AG | Blog",
    description:
      "Personal notes, discoveries, and deep dives into web development, graphics, and everything I learn along the way.",
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
}
