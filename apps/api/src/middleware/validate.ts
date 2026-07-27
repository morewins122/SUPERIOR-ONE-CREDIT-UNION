import type { NextFunction, Request, Response } from "express";
import type { z, ZodSchema } from "zod";

export const validate = <T extends ZodSchema>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
    }
    req.body = parsed.data as z.infer<T>;
    return next();
  };
};
