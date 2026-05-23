import { Router } from "express";
import { productController } from "./product.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAdmin } from "../../middleware/auth";
import { upload } from "../../utils/upload";

export const productRouter = Router();
export const adminProductRouter = Router();

productRouter.get("/", asyncHandler(productController.listPublic));
productRouter.get("/:slug", asyncHandler(productController.getPublic));

adminProductRouter.use(requireAdmin);
adminProductRouter.get("/", asyncHandler(productController.listAdmin));
adminProductRouter.get("/:id", asyncHandler(productController.getAdmin));
adminProductRouter.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 6 },
    { name: "digitalFile", maxCount: 1 },
  ]),
  asyncHandler(productController.create),
);
adminProductRouter.put(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 6 },
    { name: "digitalFile", maxCount: 1 },
  ]),
  asyncHandler(productController.update),
);
adminProductRouter.delete("/:id", asyncHandler(productController.remove));

