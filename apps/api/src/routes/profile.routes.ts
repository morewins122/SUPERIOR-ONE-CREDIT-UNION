import bcrypt from "bcryptjs";
import multer from "multer";
import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/", async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profileImageUrl: true,
      notificationPreferences: true,
      emailVerified: true,
      twoFactorEnabled: true
    }
  });

  return res.json(user);
});

profileRouter.put("/", async (req: AuthRequest, res) => {
  const schema = z.object({ firstName: z.string().min(2), lastName: z.string().min(2), phone: z.string().min(7).max(20) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const updated = await prisma.user.update({ where: { id: req.user!.userId }, data: parsed.data });
  return res.json(updated);
});

profileRouter.post("/upload-photo", upload.single("photo"), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  await prisma.user.update({ where: { id: req.user!.userId }, data: { profileImageUrl: url } });
  return res.json({ profileImageUrl: url });
});

profileRouter.post("/change-password", async (req: AuthRequest, res) => {
  const schema = z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, env.BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return res.json({ message: "Password updated" });
});

profileRouter.put("/notifications", async (req: AuthRequest, res) => {
  const schema = z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    weeklySummary: z.boolean()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const updated = await prisma.user.update({ where: { id: req.user!.userId }, data: { notificationPreferences: parsed.data } });
  return res.json(updated.notificationPreferences);
});
