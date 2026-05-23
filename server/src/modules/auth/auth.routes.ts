import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAdmin } from "../../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.get("/me", requireAdmin, asyncHandler(authController.me));

