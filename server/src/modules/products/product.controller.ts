import type { Request, Response } from "express";
import { productService } from "./product.service";

const getParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");

const extractFiles = (req: Request) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  return {
    thumbnail: files?.thumbnail?.[0],
    gallery: files?.gallery,
    digitalFile: files?.digitalFile?.[0],
  };
};

export const productController = {
  async listPublic(req: Request, res: Response) {
    const result = await productService.listPublicProducts(req.query);
    res.json(result);
  },

  async getPublic(req: Request, res: Response) {
    const result = await productService.getPublicProduct(getParam(req.params.slug));
    res.json(result);
  },

  async listAdmin(req: Request, res: Response) {
    const result = await productService.listAdminProducts(req.query);
    res.json(result);
  },

  async getAdmin(req: Request, res: Response) {
    const result = await productService.getAdminProduct(getParam(req.params.id));
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const result = await productService.createProduct(req.body, extractFiles(req));
    res.status(201).json(result);
  },

  async update(req: Request, res: Response) {
    const result = await productService.updateProduct(getParam(req.params.id), req.body, extractFiles(req));
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    const result = await productService.deleteProduct(getParam(req.params.id));
    res.json(result);
  },
};
