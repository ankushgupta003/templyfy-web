import { demoProducts } from "@shared/demoContent";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const mockProducts = demoProducts.map((product, index) => ({
  id: `mock-product-${index + 1}`,
  slug: slugify(product.title),
  ...product,
}));

