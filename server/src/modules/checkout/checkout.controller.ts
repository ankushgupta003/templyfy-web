import type { Request, Response } from "express";
import { checkoutService } from "./checkout.service";

export const checkoutController = {
  async createOrder(req: Request, res: Response) {
    const result = await checkoutService.createOrder(req.body);
    res.status(201).json(result);
  },

  async verifyPayment(req: Request, res: Response) {
    const result = await checkoutService.verifyPayment(req.body);
    res.json(result);
  },

  async webhook(req: Request, res: Response) {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    const signature = req.header("x-razorpay-signature");
    const result = await checkoutService.handleWebhook(rawBody, signature);
    res.json(result);
  },
};

