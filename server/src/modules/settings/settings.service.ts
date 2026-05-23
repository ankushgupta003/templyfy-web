import { z } from "zod";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";

const settingsSchema = z.object({
  storeName: z.string().min(2),
  supportEmail: z.string().email(),
  downloadLinkExpiryHours: z.coerce.number().int().min(1).max(168),
});

export const settingsService = {
  async getStoreSettings() {
    const settings = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
      },
    });

    return settings;
  },

  async getAdminSettings() {
    const settings = await this.getStoreSettings();

    return {
      ...settings,
      integrations: {
        razorpayKeyId: env.RAZORPAY_KEY_ID,
        emailHost: env.RESEND_API_KEY ? "api.resend.com" : env.EMAIL_HOST ?? "Not configured",
        emailUser: env.RESEND_API_KEY ? "resend" : env.EMAIL_USER ?? "Not configured",
        emailFrom: env.EMAIL_FROM,
        webhookConfigured: Boolean(env.RAZORPAY_WEBHOOK_SECRET),
      },
    };
  },

  async updateSettings(payload: unknown) {
    const input = settingsSchema.parse(payload);

    return prisma.storeSetting.upsert({
      where: { id: "default" },
      update: input,
      create: {
        id: "default",
        ...input,
      },
    });
  },
};
