import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(10, "Please share a bit more detail.").max(2000),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name."),
  customerEmail: z.string().email("Please enter a valid email."),
  customerPhone: z.string().min(8, "Please enter a valid phone number."),
});

export const productFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  shortDescription: z.string().min(12),
  description: z.string().min(20),
  category: z.string().min(2),
  price: z.coerce.number().min(1),
  compareAtPrice: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().min(1).optional(),
  ),
  fileType: z.string().min(2),
  compatibility: z.string().min(2),
  version: z.string().min(1),
  featuresText: z.string().min(3),
  includedFilesText: z.string().min(3),
  requirements: z.string().min(10),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const blogFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(20),
  content: z.string().min(50),
  category: z.string().min(2),
  tagsText: z.string().min(2),
  author: z.string().min(2),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().min(10),
  seoDescription: z.string().min(20),
});

export const settingsSchema = z.object({
  storeName: z.string().min(2),
  supportEmail: z.string().email(),
  downloadLinkExpiryHours: z.coerce.number().min(1).max(168),
});
