import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { orderController } from "./order.controller";

export const orderRouter = Router();

orderRouter.use(requireAdmin);
orderRouter.get("/dashboard-summary", asyncHandler(orderController.summary));
orderRouter.get("/", asyncHandler(orderController.list));
orderRouter.get("/:id", asyncHandler(orderController.get));
orderRouter.post("/:id/resend-email", asyncHandler(orderController.resendEmail));

