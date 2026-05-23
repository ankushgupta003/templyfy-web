import { demoBlogs } from "@shared/demoContent";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const mockBlogs = demoBlogs.map((post, index) => ({
  id: `mock-blog-${index + 1}`,
  slug: slugify(post.title),
  ...post,
}));
