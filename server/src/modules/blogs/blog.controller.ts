import type { Request, Response } from "express";
import { blogService } from "./blog.service";

const getParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");

const extractFiles = (req: Request) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  return {
    coverImage: files?.coverImage?.[0],
  };
};

export const blogController = {
  async listPublic(req: Request, res: Response) {
    const result = await blogService.listPublicBlogs(req.query);
    res.json(result);
  },

  async getPublic(req: Request, res: Response) {
    const result = await blogService.getPublicBlog(getParam(req.params.slug));
    res.json(result);
  },

  async listAdmin(req: Request, res: Response) {
    const result = await blogService.listAdminBlogs(req.query);
    res.json(result);
  },

  async getAdmin(req: Request, res: Response) {
    const result = await blogService.getAdminBlog(getParam(req.params.id));
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const result = await blogService.createBlog(req.body, extractFiles(req));
    res.status(201).json(result);
  },

  async update(req: Request, res: Response) {
    const result = await blogService.updateBlog(getParam(req.params.id), req.body, extractFiles(req));
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const result = await blogService.deleteBlog(getParam(req.params.id));
    res.json(result);
  },
};
