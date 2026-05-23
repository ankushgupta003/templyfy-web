import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { settingsController } from "./settings.controller";

export const settingsRouter = Router();

settingsRouter.use(requireAdmin);
settingsRouter.get("/", asyncHandler(settingsController.get));
settingsRouter.put("/", asyncHandler(settingsController.update));

