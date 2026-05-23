import type { Prisma } from "@prisma/client";
import { BlogStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { generateSlug } from "../../utils/generateSlug";
import { storeUploadedPublicFile } from "../../utils/fileStorage";

type UploadedBlogFiles = {
  coverImage?: Express.Multer.File;
};

const blogQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

const adminBlogQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

const blogPayloadSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(20),
  content: z.string().min(50),
  category: z.string().min(2),
  tags: z.unknown(),
  author: z.string().min(2),
  status: z.nativeEnum(BlogStatus),
  seoTitle: z.string().min(10),
  seoDescription: z.string().min(20),
});

const normalizeBlog = <T extends { tags: Prisma.JsonValue }>(blog: T) => ({
  ...blog,
  tags: Array.isArray(blog.tags) ? (blog.tags as string[]) : [],
});

const parseTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_error) {
      // Fall back to comma-separated values.
    }

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const createUniqueSlug = async (title: string, slug?: string, currentId?: string) => {
  const baseSlug = generateSlug(slug || title);
  let uniqueSlug = baseSlug;
  let suffix = 1;

  while (
    await prisma.blogPost.findFirst({
      where: {
        slug: uniqueSlug,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix += 1;
    uniqueSlug = `${baseSlug}-${suffix}`;
  }

  return uniqueSlug;
};

export const blogService = {
  async listPublicBlogs(query: unknown) {
    const filters = blogQuerySchema.parse(query);
    const where: Prisma.BlogPostWhereInput = {
      status: BlogStatus.PUBLISHED,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { excerpt: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = await prisma.blogPost.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
    });

    return items.map(normalizeBlog);
  },

  async getPublicBlog(slug: string) {
    const blog = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: BlogStatus.PUBLISHED,
      },
    });

    if (!blog) {
      throw new AppError("Blog post not found.", 404);
    }

    const related = await prisma.blogPost.findMany({
      where: {
        id: { not: blog.id },
        category: blog.category,
        status: BlogStatus.PUBLISHED,
      },
      take: 3,
      orderBy: {
        publishedAt: "desc",
      },
    });

    return {
      ...normalizeBlog(blog),
      relatedPosts: related.map(normalizeBlog),
    };
  },

  async listAdminBlogs(query: unknown) {
    const filters = adminBlogQuerySchema.parse(query);

    const items = await prisma.blogPost.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { excerpt: { contains: filters.search, mode: "insensitive" } },
                { slug: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return items.map(normalizeBlog);
  },

  async getAdminBlog(id: string) {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new AppError("Blog post not found.", 404);
    }

    return normalizeBlog(blog);
  },

  async createBlog(payload: unknown, files: UploadedBlogFiles) {
    const input = blogPayloadSchema.parse(payload);

    if (!files.coverImage) {
      throw new AppError("A cover image is required.", 400);
    }

    const slug = await createUniqueSlug(input.title, input.slug);
    const isPublished = input.status === BlogStatus.PUBLISHED;
    const coverImageUrl = await storeUploadedPublicFile(files.coverImage, "blogs", `/uploads/blogs/${files.coverImage.filename}`);

    const blog = await prisma.blogPost.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: coverImageUrl,
        category: input.category,
        tags: parseTags(input.tags),
        author: input.author,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return normalizeBlog(blog);
  },

  async updateBlog(id: string, payload: unknown, files: UploadedBlogFiles) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("Blog post not found.", 404);
    }

    const input = blogPayloadSchema.parse(payload);
    const slug = await createUniqueSlug(input.title, input.slug, id);
    const isPublished = input.status === BlogStatus.PUBLISHED;
    const coverImageUrl = files.coverImage
      ? await storeUploadedPublicFile(files.coverImage, "blogs", `/uploads/blogs/${files.coverImage.filename}`)
      : existing.coverImage;

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: coverImageUrl,
        category: input.category,
        tags: parseTags(input.tags),
        author: input.author,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        publishedAt: isPublished ? existing.publishedAt ?? new Date() : null,
      },
    });

    return normalizeBlog(blog);
  },

  async deleteBlog(id: string) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("Blog post not found.", 404);
    }

    await prisma.blogPost.delete({ where: { id } });
    return { success: true };
  },
};
