import type { BlogPost } from "./blog-content";
import { blogPostsMeta, type BlogPostMeta } from "./blog-posts-meta";

const postModules = import.meta.glob<BlogPost>("./blog-posts/*.json", {
  import: "default",
});

export async function loadBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const loader = postModules[`./blog-posts/${slug}.json`];
  if (!loader) return null;
  return loader();
}

export function getRelatedPostMeta(post: BlogPost, limit = 3): BlogPostMeta[] {
  const bySlug = new Map(blogPostsMeta.map((item) => [item.slug, item]));
  const explicit = post.relatedPosts
    .map((slug) => bySlug.get(slug))
    .filter((item): item is BlogPostMeta => Boolean(item));

  if (explicit.length >= limit) {
    return explicit.slice(0, limit);
  }

  const fallback = blogPostsMeta.filter(
    (item) =>
      item.slug !== post.slug &&
      item.category === post.category &&
      !explicit.some((related) => related.slug === item.slug),
  );

  return [...explicit, ...fallback].slice(0, limit);
}
