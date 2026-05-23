import type { Request, Response } from "express";
import { downloadService } from "./download.service";

const getParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");

export const downloadController = {
  async download(req: Request, res: Response) {
    const result = await downloadService.resolveDownload(getParam(req.params.token));

    if (result.redirectUrl) {
      res.redirect(result.redirectUrl);
      return;
    }

    res.download(result.filePath!, result.fileName);
  },
};
