import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { createStorageFilename, privateStorageDir, uploadStorageDir } from "./storage";

const imageFields = new Set(["thumbnail", "gallery", "coverImage"]);

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    let destination = uploadStorageDir;

    if (file.fieldname === "digitalFile") {
      destination = privateStorageDir;
    } else if (file.fieldname === "thumbnail") {
      destination = path.resolve(uploadStorageDir, "products");
    } else if (file.fieldname === "gallery") {
      destination = path.resolve(uploadStorageDir, "gallery");
    } else if (file.fieldname === "coverImage") {
      destination = path.resolve(uploadStorageDir, "blogs");
    }

    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_req, file, callback) => {
    callback(null, createStorageFilename(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (imageFields.has(file.fieldname) && !file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed for thumbnails and blog covers."));
      return;
    }

    callback(null, true);
  },
});

