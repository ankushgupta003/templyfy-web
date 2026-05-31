import bcrypt from "bcryptjs";
import { brand } from "../../../shared/brand";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

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

async function main() {
  await seedAdmin();
  await seedSettings();
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
