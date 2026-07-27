import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

export const signJwt = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
