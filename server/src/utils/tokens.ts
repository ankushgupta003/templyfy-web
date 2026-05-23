import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signAdminToken = (payload: { id: string; email: string; role: string }) =>
  jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

export const createDownloadToken = (
  payload: { orderId: string; tokenId: string },
  expiryHours = env.DOWNLOAD_LINK_EXPIRY_HOURS,
) => {
  const token = jwt.sign(payload, env.DOWNLOAD_TOKEN_SECRET, {
    expiresIn: `${expiryHours}h`,
  });

  return {
    token,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
  };
};

export const verifyDownloadToken = (token: string) =>
  jwt.verify(token, env.DOWNLOAD_TOKEN_SECRET) as {
    orderId: string;
    tokenId: string;
    iat: number;
    exp: number;
  };
