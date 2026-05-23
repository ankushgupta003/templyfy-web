import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { downloadController } from "./download.controller";

export const downloadRouter = Router();

downloadRouter.get("/:token", asyncHandler(downloadController.download));
