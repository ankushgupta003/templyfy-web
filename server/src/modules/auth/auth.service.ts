import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { signAdminToken } from "../../utils/tokens";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authService = {
  async login(payload: unknown) {
    const input = loginSchema.parse(payload);

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = signAdminToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  },
};
