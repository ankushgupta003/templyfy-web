import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env";

export const privateStorageDir = path.resolve(process.cwd(), "storage/private");
export const uploadStorageDir = path.resolve(process.cwd(), "storage/uploads");

export const ensureStorageDirs = () => {
  fs.mkdirSync(privateStorageDir, { recursive: true });
  fs.mkdirSync(uploadStorageDir, { recursive: true });
};

export const createStorageFilename = (originalName: string) => {
  const extension = path.extname(originalName);
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
};

export const toPublicUploadUrl = (relativePath: string) =>
  `${env.APP_URL}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;

export const resolvePrivateFile = (storageKey: string) => path.resolve(privateStorageDir, storageKey);

