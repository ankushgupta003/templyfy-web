import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { checkoutController } from "./checkout.controller";

export const checkoutRouter = Router();
export const razorpayWebhookRouter = Router();

checkoutRouter.post("/create-order", asyncHandler(checkoutController.createOrder));
checkoutRouter.post("/verify-payment", asyncHandler(checkoutController.verifyPayment));

razorpayWebhookRouter.post("/", asyncHandler(checkoutController.webhook));

