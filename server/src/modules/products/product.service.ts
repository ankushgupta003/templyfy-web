import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { generateSlug } from "../../utils/generateSlug";
import { storeUploadedPrivateFile, storeUploadedPublicFile } from "../../utils/fileStorage";

type UploadedProductFiles = {
  thumbnail?: Express.Multer.File;
  gallery?: Express.Multer.File[];
  digitalFile?: Express.Multer.File;
};

const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["latest", "price_asc", "price_desc", "popular"]).optional(),
  featured: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

const adminProductQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const stringArraySchema = z.array(z.string().min(1));

const productPayloadSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  shortDescription: z.string().min(12),
  description: z.string().min(20),
  category: z.string().min(2),
  price: z.coerce.number().int().positive(),
  compareAtPrice: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().positive().optional(),
  ),
  fileType: z.string().min(2),
  compatibility: z.string().min(2),
  version: z.string().min(1),
  features: z.unknown(),
  includedFiles: z.unknown(),
  requirements: z.string().min(10),
  existingGalleryImages: z.unknown().optional(),
  isActive: z.preprocess(
    (value) => (typeof value === "string" ? value === "true" : value ?? true),
    z.boolean().default(true),
  ),
  isFeatured: z.preprocess(
    (value) => (typeof value === "string" ? value === "true" : value ?? false),
    z.boolean().default(false),
  ),
});

const parseStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return stringArraySchema.parse(value.map((item) => String(item).trim()).filter(Boolean));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return stringArraySchema.parse(parsed.map((item) => String(item).trim()).filter(Boolean));
      }
    } catch (_error) {
      // Fall back to newline/comma parsing.
    }

    return stringArraySchema.parse(
      trimmed
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return [];
};

const normalizeProduct = <T extends { features: Prisma.JsonValue; includedFiles: Prisma.JsonValue; galleryImages: Prisma.JsonValue }>(
  product: T,
) => ({
  ...product,
  features: Array.isArray(product.features) ? (product.features as string[]) : [],
  includedFiles: Array.isArray(product.includedFiles) ? (product.includedFiles as string[]) : [],
  galleryImages: Array.isArray(product.galleryImages) ? (product.galleryImages as string[]) : [],
});

const createUniqueSlug = async (title: string, slug?: string, currentId?: string) => {
  const baseSlug = generateSlug(slug || title);
  let uniqueSlug = baseSlug;
  let suffix = 1;

  while (
    await prisma.product.findFirst({
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

export const productService = {
  async listPublicProducts(query: unknown) {
    const filters = productQuerySchema.parse(query);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.featured ? { isFeatured: true } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { shortDescription: { contains: filters.search, mode: "insensitive" } },
              { category: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            price: {
              ...(filters.minPrice ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      filters.sort === "price_asc"
        ? { price: "asc" }
        : filters.sort === "price_desc"
          ? { price: "desc" }
          : filters.sort === "popular"
            ? { orders: { _count: "desc" } }
            : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map(normalizeProduct),
      total,
    };
  },

  async getPublicProduct(slug: string) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        category: product.category,
        isActive: true,
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      ...normalizeProduct(product),
      relatedProducts: related.map(normalizeProduct),
    };
  },

  async listAdminProducts(query: unknown) {
    const filters = adminProductQuerySchema.parse(query);

    const where: Prisma.ProductWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { isActive: filters.status === "active" } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { shortDescription: { contains: filters.search, mode: "insensitive" } },
              { slug: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = await prisma.product.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return items.map(normalizeProduct);
  },

  async getAdminProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    return normalizeProduct(product);
  },

  async createProduct(payload: unknown, files: UploadedProductFiles) {
    const input = productPayloadSchema.parse(payload);

    if (!files.digitalFile) {
      throw new AppError("A private digital file upload is required.", 400);
    }

    if (!files.thumbnail) {
      throw new AppError("A product thumbnail is required.", 400);
    }

    const slug = await createUniqueSlug(input.title, input.slug);
    const features = parseStringArray(input.features);
    const includedFiles = parseStringArray(input.includedFiles);
    const thumbnailUrl = await storeUploadedPublicFile(files.thumbnail, "products", `/uploads/products/${files.thumbnail.filename}`);
    const digitalFileKey = await storeUploadedPrivateFile(files.digitalFile, "products");
    const uploadedGalleryImages = files.gallery
      ? await Promise.all(
          files.gallery.map((file) => storeUploadedPublicFile(file, "gallery", `/uploads/gallery/${file.filename}`)),
        )
      : [];
    const galleryImages = [
      ...parseStringArray(input.existingGalleryImages),
      ...uploadedGalleryImages,
    ];

    const product = await prisma.product.create({
      data: {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        category: input.category,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        fileType: input.fileType,
        compatibility: input.compatibility,
        version: input.version,
        features,
        includedFiles,
        requirements: input.requirements,
        thumbnailUrl,
        galleryImages,
        digitalFileKey,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
      },
    });

    return normalizeProduct(product);
  },

  async updateProduct(id: string, payload: unknown, files: UploadedProductFiles) {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("Product not found.", 404);
    }

    const input = productPayloadSchema.parse(payload);
    const slug = await createUniqueSlug(input.title, input.slug, id);
    const thumbnailUrl = files.thumbnail
      ? await storeUploadedPublicFile(files.thumbnail, "products", `/uploads/products/${files.thumbnail.filename}`)
      : existing.thumbnailUrl;
    const digitalFileKey = files.digitalFile
      ? await storeUploadedPrivateFile(files.digitalFile, "products")
      : existing.digitalFileKey;
    const uploadedGalleryImages = files.gallery
      ? await Promise.all(
          files.gallery.map((file) => storeUploadedPublicFile(file, "gallery", `/uploads/gallery/${file.filename}`)),
        )
      : [];
    const galleryImages = [
      ...parseStringArray(input.existingGalleryImages),
      ...uploadedGalleryImages,
    ];

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        category: input.category,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        fileType: input.fileType,
        compatibility: input.compatibility,
        version: input.version,
        features: parseStringArray(input.features),
        includedFiles: parseStringArray(input.includedFiles),
        requirements: input.requirements,
        thumbnailUrl,
        galleryImages,
        digitalFileKey,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
      },
    });

    return normalizeProduct(product);
  },

  async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("Product not found.", 404);
    }

    await prisma.product.delete({ where: { id } });
    return { success: true };
  },
};
