import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAdmin } from "../../middleware/auth";
import { upload } from "../../utils/upload";
import { blogController } from "./blog.controller";

export const blogRouter = Router();
export const adminBlogRouter = Router();

blogRouter.get("/", asyncHandler(blogController.listPublic));
blogRouter.get("/:slug", asyncHandler(blogController.getPublic));

adminBlogRouter.use(requireAdmin);
adminBlogRouter.get("/", asyncHandler(blogController.listAdmin));
adminBlogRouter.get("/:id", asyncHandler(blogController.getAdmin));
adminBlogRouter.post(
  "/",
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  asyncHandler(blogController.create),
);
adminBlogRouter.put(
  "/:id",
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  asyncHandler(blogController.update),
);
adminBlogRouter.delete("/:id", asyncHandler(blogController.remove));

