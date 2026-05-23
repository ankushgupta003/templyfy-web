import { z } from "zod";
import { prisma } from "../../config/prisma";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export const contactService = {
  async createMessage(payload: unknown) {
    const input = contactSchema.parse(payload);

    return prisma.contactMessage.create({
      data: input,
    });
  },
};

