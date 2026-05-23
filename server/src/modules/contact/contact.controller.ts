import type { Request, Response } from "express";
import { contactService } from "./contact.service";

export const contactController = {
  async create(req: Request, res: Response) {
    const result = await contactService.createMessage(req.body);
    res.status(201).json({
      id: result.id,
      message: "Your message has been received. We will get back to you soon.",
    });
  },
};

