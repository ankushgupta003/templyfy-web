import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { contactController } from "./contact.controller";

export const contactRouter = Router();

contactRouter.post("/", asyncHandler(contactController.create));

