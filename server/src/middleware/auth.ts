import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type AuthPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    if (payload.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required." });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
};
