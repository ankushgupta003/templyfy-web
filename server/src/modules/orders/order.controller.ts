import type { Request, Response } from "express";
import { orderService } from "./order.service";

const getParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");

export const orderController = {
  async list(req: Request, res: Response) {
    const result = await orderService.listOrders(req.query);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    const result = await orderService.getOrder(getParam(req.params.id));
    res.json(result);
  },

  async resendEmail(req: Request, res: Response) {
    const result = await orderService.resendEmail(getParam(req.params.id));
    res.json(result);
  },

  async summary(_req: Request, res: Response) {
    const result = await orderService.getDashboardSummary();
    res.json(result);
  },
};
