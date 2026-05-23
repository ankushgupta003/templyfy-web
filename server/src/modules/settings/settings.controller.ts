import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth";
import { settingsService } from "./settings.service";

export const settingsController = {
  async get(_req: AuthenticatedRequest, res: Response) {
    const result = await settingsService.getAdminSettings();
    res.json(result);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const result = await settingsService.updateSettings(req.body);
    res.json(result);
  },
};

