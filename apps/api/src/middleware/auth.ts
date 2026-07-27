import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";

type AuthUser = {
  userId: string;
  role: "USER" | "ADMIN";
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.user = verifyJwt(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};
