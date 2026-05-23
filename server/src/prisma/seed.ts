import bcrypt from "bcryptjs";
import { BlogStatus, OrderStatus } from "@prisma/client";
import { brand } from "../../../shared/brand";
import { demoBlogs, demoProducts } from "../../../shared/demoContent";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { generateSlug } from "../utils/generateSlug";
import { storePrivateTextFile } from "../utils/fileStorage";

const svgToDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const createProductArtwork = (title: string, accent: string) =>
  svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#08111F"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
    <rect x="76" y="92" width="1048" height="716" rx="32" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
    <rect x="132" y="162" width="310" height="548" rx="24" fill="rgba(255,255,255,0.92)"/>
    <rect x="476" y="162" width="590" height="146" rx="24" fill="rgba(255,255,255,0.12)"/>
    <rect x="476" y="336" width="270" height="180" rx="24" fill="rgba(37,99,235,0.24)"/>
    <rect x="796" y="336" width="270" height="180" rx="24" fill="rgba(16,185,129,0.24)"/>
    <rect x="476" y="542" width="590" height="168" rx="24" fill="rgba(255,255,255,0.12)"/>
    <rect x="176" y="244" width="214" height="18" rx="9" fill="#cbd5e1"/>
    <rect x="176" y="292" width="214" height="18" rx="9" fill="#cbd5e1"/>
    <rect x="176" y="340" width="214" height="18" rx="9" fill="#cbd5e1"/>
    <rect x="176" y="388" width="214" height="18" rx="9" fill="#cbd5e1"/>
    <rect x="176" y="436" width="168" height="18" rx="9" fill="#cbd5e1"/>
    <path d="M1000 108 L1028 162 L1082 190 L1028 218 L1000 272 L972 218 L918 190 L972 162 Z" fill="#10B981"/>
    <text x="132" y="786" fill="#ffffff" font-size="48" font-family="Arial, sans-serif" font-weight="700">${title}</text>
  </svg>`);

const createBlogArtwork = (title: string, accent: string) =>
  svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#08111F"/>
    <circle cx="1340" cy="140" r="180" fill="${accent}" opacity="0.28"/>
    <circle cx="1220" cy="780" r="240" fill="#06B6D4" opacity="0.16"/>
    <rect x="110" y="120" width="1380" height="660" rx="44" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
    <rect x="184" y="214" width="760" height="30" rx="15" fill="#e2e8f0"/>
    <rect x="184" y="276" width="540" height="22" rx="11" fill="#94a3b8"/>
    <rect x="184" y="328" width="880" height="18" rx="9" fill="#64748b"/>
    <rect x="184" y="370" width="880" height="18" rx="9" fill="#64748b"/>
    <rect x="184" y="412" width="760" height="18" rx="9" fill="#64748b"/>
    <rect x="1098" y="214" width="240" height="240" rx="32" fill="rgba(37,99,235,0.28)"/>
    <rect x="1098" y="486" width="240" height="180" rx="32" fill="rgba(16,185,129,0.28)"/>
    <text x="184" y="700" fill="#ffffff" font-size="52" font-family="Arial, sans-serif" font-weight="700">${title}</text>
  </svg>`);

const ensurePrivateFile = async (fileName: string, title: string) =>
  storePrivateTextFile(
    fileName,
    [
      `${title}`,
      "",
      "This is a seeded placeholder digital file for local development.",
      "Replace it with a production-ready XLSM/XLSX/ZIP/PDF file from the Templyfy admin panel.",
    ].join("\n"),
  );

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });
}

async function seedSettings() {
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {
      storeName: brand.name,
      supportEmail: brand.supportEmail,
      downloadLinkExpiryHours: env.DOWNLOAD_LINK_EXPIRY_HOURS,
    },
    create: {
      id: "default",
      storeName: brand.name,
      supportEmail: brand.supportEmail,
      downloadLinkExpiryHours: env.DOWNLOAD_LINK_EXPIRY_HOURS,
    },
  });
}

async function seedProducts() {
  const accents = ["#2563EB", "#10B981", "#06B6D4", "#0EA5E9", "#3B82F6", "#14B8A6", "#22C55E", "#F59E0B"];
  const products = [];

  for (const [index, product] of demoProducts.entries()) {
    const slug = generateSlug(product.title);
    const fileName = await ensurePrivateFile(`${slug}.txt`, product.title);

    const record = await prisma.product.upsert({
      where: { slug },
      update: {
        title: product.title,
        shortDescription: product.shortDescription,
        description: product.description,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        fileType: product.fileType,
        compatibility: product.compatibility,
        version: product.version,
        features: product.features,
        includedFiles: product.includedFiles,
        requirements: product.requirements,
        thumbnailUrl: createProductArtwork(product.title, accents[index % accents.length]),
        galleryImages: [
          createProductArtwork(product.title, accents[index % accents.length]),
          createProductArtwork(`${product.title} Preview`, accents[(index + 2) % accents.length]),
        ],
        digitalFileKey: fileName,
        isActive: true,
        isFeatured: product.isFeatured,
      },
      create: {
        title: product.title,
        slug,
        shortDescription: product.shortDescription,
        description: product.description,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        fileType: product.fileType,
        compatibility: product.compatibility,
        version: product.version,
        features: product.features,
        includedFiles: product.includedFiles,
        requirements: product.requirements,
        thumbnailUrl: createProductArtwork(product.title, accents[index % accents.length]),
        galleryImages: [
          createProductArtwork(product.title, accents[index % accents.length]),
          createProductArtwork(`${product.title} Preview`, accents[(index + 2) % accents.length]),
        ],
        digitalFileKey: fileName,
        isActive: true,
        isFeatured: product.isFeatured,
      },
    });

    products.push(record);
  }

  return products;
}

async function seedBlogs() {
  const accents = ["#2563EB", "#10B981", "#06B6D4"];

  for (const [index, post] of demoBlogs.entries()) {
    const slug = generateSlug(post.title);

    await prisma.blogPost.upsert({
      where: { slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: createBlogArtwork(post.title, accents[index % accents.length]),
        category: post.category,
        tags: post.tags,
        author: post.author,
        status: post.status === "PUBLISHED" ? BlogStatus.PUBLISHED : BlogStatus.DRAFT,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        publishedAt: post.status === "PUBLISHED" ? new Date() : null,
      },
      create: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: createBlogArtwork(post.title, accents[index % accents.length]),
        category: post.category,
        tags: post.tags,
        author: post.author,
        status: post.status === "PUBLISHED" ? BlogStatus.PUBLISHED : BlogStatus.DRAFT,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        publishedAt: post.status === "PUBLISHED" ? new Date() : null,
      },
    });
  }
}

async function seedOrders(products: Awaited<ReturnType<typeof seedProducts>>) {
  const existingCount = await prisma.order.count();
  if (existingCount > 0 || products.length < 3) {
    return;
  }

  const createdOrders = await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNumber: "TMP-SEED-001",
        customerName: "Riya Mehta",
        customerEmail: "riya@example.com",
        customerPhone: "9876543210",
        productId: products[0].id,
        amount: products[0].price,
        currency: "INR",
        status: OrderStatus.PAID,
        razorpayOrderId: "order_seed_001",
        razorpayPaymentId: "pay_seed_001",
        razorpaySignature: "seed-signature-001",
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TMP-SEED-002",
        customerName: "Aman Verma",
        customerEmail: "aman@example.com",
        customerPhone: "9988776655",
        productId: products[1].id,
        amount: products[1].price,
        currency: "INR",
        status: OrderStatus.CREATED,
        razorpayOrderId: "order_seed_002",
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "TMP-SEED-003",
        customerName: "Sneha Rao",
        customerEmail: "sneha@example.com",
        customerPhone: "9123456780",
        productId: products[2].id,
        amount: products[2].price,
        currency: "INR",
        status: OrderStatus.FAILED,
        razorpayOrderId: "order_seed_003",
        razorpayPaymentId: "pay_seed_003",
      },
    }),
  ]);

  await prisma.emailLog.create({
    data: {
      orderId: createdOrders[0].id,
      recipient: createdOrders[0].customerEmail,
      subject: "Your download is ready - Templyfy",
      status: "SENT",
    },
  });
}

async function main() {
  await seedAdmin();
  await seedSettings();
  const products = await seedProducts();
  await seedBlogs();
  await seedOrders(products);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
