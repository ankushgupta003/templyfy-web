import type { Response } from "express";
import { authService } from "./auth.service";
import type { AuthenticatedRequest } from "../../middleware/auth";

export const authController = {
  async login(req: AuthenticatedRequest, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const result = await authService.me(req.user!.id);
    res.json(result);
  },
};

