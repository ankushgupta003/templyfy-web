import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { resolvePrivateFile, toPublicUploadUrl } from "./storage";

type UploadKind = "public" | "private";

const readUploadedFile = (file: Express.Multer.File) => {
  if (file.buffer) {
    return file.buffer;
  }

  if (file.path && fs.existsSync(file.path)) {
    return fs.readFileSync(file.path);
  }

  throw new AppError("Uploaded file could not be read.", 500);
};

const cleanupTempFile = (file: Express.Multer.File) => {
  if (env.STORAGE_PROVIDER !== "supabase" || !file.path) {
    return;
  }

  try {
    fs.unlinkSync(file.path);
  } catch (_error) {
    // Ignore cleanup issues for temp upload files.
  }
};

const requireSupabase = () => {
  if (!supabaseAdmin) {
    throw new AppError("Supabase storage is not configured.", 500);
  }

  return supabaseAdmin;
};

const uploadToSupabase = async (options: {
  bucket: string;
  objectPath: string;
  file: Express.Multer.File;
  cacheControl?: string;
}) => {
  const client = requireSupabase();
  const fileBody = readUploadedFile(options.file);

  const { error } = await client.storage.from(options.bucket).upload(options.objectPath, fileBody, {
    cacheControl: options.cacheControl ?? "3600",
    contentType: options.file.mimetype || undefined,
    upsert: true,
  });

  cleanupTempFile(options.file);

  if (error) {
    throw new AppError(`Storage upload failed: ${error.message}`, 500);
  }
};

export const storeUploadedPublicFile = async (file: Express.Multer.File, folder: string, localPublicPath: string) => {
  if (env.STORAGE_PROVIDER !== "supabase") {
    return toPublicUploadUrl(localPublicPath);
  }

  const objectPath = `${folder}/${file.filename}`;
  const client = requireSupabase();

  await uploadToSupabase({
    bucket: env.SUPABASE_PUBLIC_BUCKET,
    objectPath,
    file,
  });

  const { data } = client.storage.from(env.SUPABASE_PUBLIC_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
};

export const storeUploadedPrivateFile = async (file: Express.Multer.File, folder: string) => {
  if (env.STORAGE_PROVIDER !== "supabase") {
    return file.filename;
  }

  const objectPath = `${folder}/${file.filename}`;

  await uploadToSupabase({
    bucket: env.SUPABASE_PRIVATE_BUCKET,
    objectPath,
    file,
  });

  return objectPath;
};

export const storePrivateTextFile = async (fileName: string, content: string) => {
  if (env.STORAGE_PROVIDER !== "supabase") {
    const filePath = resolvePrivateFile(fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    return fileName;
  }

  const client = requireSupabase();
  const objectPath = `seed/${fileName}`;
  const body = Buffer.from(content, "utf8");

  const { error } = await client.storage.from(env.SUPABASE_PRIVATE_BUCKET).upload(objectPath, body, {
    cacheControl: "3600",
    contentType: "text/plain; charset=utf-8",
    upsert: true,
  });

  if (error) {
    throw new AppError(`Storage upload failed: ${error.message}`, 500);
  }

  return objectPath;
};

export const resolveDownloadTarget = async (storageKey: string, downloadBaseName: string) => {
  if (env.STORAGE_PROVIDER !== "supabase") {
    const filePath = resolvePrivateFile(storageKey);

    return {
      filePath,
      fileName: `${downloadBaseName}${path.extname(filePath)}`,
    };
  }

  const client = requireSupabase();
  const extension = path.extname(storageKey);
  const fileName = `${downloadBaseName}${extension}`;

  const { data, error } = await client.storage
    .from(env.SUPABASE_PRIVATE_BUCKET)
    .createSignedUrl(storageKey, 300, { download: fileName });

  if (error || !data?.signedUrl) {
    throw new AppError(`Signed download URL could not be created: ${error?.message ?? "Unknown error"}`, 500);
  }

  return {
    redirectUrl: data.signedUrl,
    fileName,
  };
};
