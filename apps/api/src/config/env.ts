import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WEB_URL: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("1d"),
  BCRYPT_ROUNDS: z.coerce.number().min(8).max(14).default(10),
  ENABLE_MOCK_2FA: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

export const env = envSchema.parse(process.env);
