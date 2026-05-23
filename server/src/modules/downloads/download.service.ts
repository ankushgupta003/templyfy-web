import crypto from "node:crypto";
import fs from "node:fs";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { resolveDownloadTarget } from "../../utils/fileStorage";
import { verifyDownloadToken } from "../../utils/tokens";

export const downloadService = {
  async resolveDownload(token: string) {
    const payload = verifyDownloadToken(token);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const downloadToken = await prisma.downloadToken.findUnique({
      where: { tokenHash },
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!downloadToken || downloadToken.id !== payload.tokenId) {
      throw new AppError("Download link is invalid.", 404);
    }

    if (downloadToken.expiresAt.getTime() < Date.now()) {
      throw new AppError("Download link has expired.", 410);
    }

    await prisma.downloadToken.update({
      where: { id: downloadToken.id },
      data: {
        usedAt: downloadToken.usedAt ?? new Date(),
        downloadCount: {
          increment: 1,
        },
      },
    });

    const target = await resolveDownloadTarget(downloadToken.order.product.digitalFileKey, downloadToken.order.product.slug);

    if (target.filePath && !fs.existsSync(target.filePath)) {
      throw new AppError("The purchased file is not available right now.", 404);
    }

    return target;
  },
};
