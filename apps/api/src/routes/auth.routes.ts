import bcrypt from "bcryptjs";
import { AccountType, Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { makeAccountNumber } from "../utils/account.js";
import { signJwt } from "../utils/jwt.js";

export const authRouter = Router();

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7).max(20)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  twoFactorCode: z.string().optional()
});

authRouter.get("/csrf-token", (req, res) => {
  // csurf injects csrfToken when middleware is active on this router.
  res.json({ csrfToken: req.csrfToken() });
});

authRouter.post("/register", validate(registerSchema), async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: Role.USER,
      emailVerified: false,
      twoFactorEnabled: false,
      accounts: {
        create: [
          {
            type: AccountType.CHECKING,
            accountNumber: makeAccountNumber(AccountType.CHECKING),
            balance: 500
          },
          {
            type: AccountType.SAVINGS,
            accountNumber: makeAccountNumber(AccountType.SAVINGS),
            balance: 1500
          }
        ]
      }
    },
    include: { accounts: true }
  });

  const token = signJwt({ userId: user.id, role: user.role });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 24 * 3600 * 1000
  });

  return res.status(201).json({
    message: "Registered successfully",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.twoFactorEnabled && env.ENABLE_MOCK_2FA && twoFactorCode !== "123456") {
    return res.status(401).json({ message: "Invalid mock 2FA code", hint: "Use 123456 in test mode" });
  }

  const token = signJwt({ userId: user.id, role: user.role });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 24 * 3600 * 1000
  });

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
      twoFactorEnabled: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
});

authRouter.post("/forgot-password", async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid email" });
  }

  return res.json({
    message: "If the account exists, a reset link was sent.",
    mockResetToken: "reset-token"
  });
});

authRouter.post("/reset-password", async (req, res) => {
  const schema = z.object({ token: z.string().min(4), newPassword: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error" });
  }

  return res.json({ message: "Password reset simulated successfully" });
});

authRouter.post("/verify-email", requireAuth, async (req: AuthRequest, res) => {
  await prisma.user.update({ where: { id: req.user!.userId }, data: { emailVerified: true } });
  return res.json({ message: "Email verified (mock)" });
});

authRouter.post("/2fa/toggle", requireAuth, async (req: AuthRequest, res) => {
  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { twoFactorEnabled: { set: req.body?.enabled === true } }
  });
  return res.json({ twoFactorEnabled: updated.twoFactorEnabled });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  });
  return res.json({ message: "Logged out" });
});
