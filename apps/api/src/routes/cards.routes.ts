import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { normalizeTransactionHistory } from "../utils/transaction-history.js";

export const cardRouter = Router();
cardRouter.use(requireAuth);

cardRouter.get("/", async (req: AuthRequest, res) => {
  const cards = await prisma.card.findMany({ where: { userId: req.user!.userId }, orderBy: { createdAt: "desc" } });
  return res.json(cards);
});

cardRouter.post("/create", async (req: AuthRequest, res) => {
  const account = await prisma.account.findFirst({ where: { userId: req.user!.userId } });
  if (!account) return res.status(400).json({ message: "Create an account first" });

  const card = await prisma.card.create({
    data: {
      userId: req.user!.userId,
      accountId: account.id,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiryMonth: String(Math.floor(1 + Math.random() * 12)).padStart(2, "0"),
      expiryYear: String(new Date().getFullYear() + 4),
      isFrozen: false
    }
  });

  return res.status(201).json(card);
});

cardRouter.post("/:id/freeze", async (req: AuthRequest, res) => {
  const cardId = String(req.params.id);
  const card = await prisma.card.updateMany({
    where: { id: cardId, userId: req.user!.userId },
    data: { isFrozen: true }
  });
  return res.json({ updated: card.count });
});

cardRouter.post("/:id/unfreeze", async (req: AuthRequest, res) => {
  const cardId = String(req.params.id);
  const card = await prisma.card.updateMany({
    where: { id: cardId, userId: req.user!.userId },
    data: { isFrozen: false }
  });
  return res.json({ updated: card.count });
});

cardRouter.post("/:id/replace", async (req: AuthRequest, res) => {
  const cardId = String(req.params.id);
  const replaced = await prisma.card.updateMany({ where: { id: cardId, userId: req.user!.userId }, data: { status: "REPLACED" } });
  if (replaced.count === 0) return res.status(404).json({ message: "Card not found" });

  const original = await prisma.card.findFirst({ where: { id: cardId, userId: req.user!.userId } });
  if (!original) return res.status(404).json({ message: "Card not found" });

  const newCard = await prisma.card.create({
    data: {
      userId: req.user!.userId,
      accountId: original.accountId,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiryMonth: String(Math.floor(1 + Math.random() * 12)).padStart(2, "0"),
      expiryYear: String(new Date().getFullYear() + 4),
      isFrozen: false,
      status: "ACTIVE"
    }
  });

  return res.json(newCard);
});

cardRouter.get("/:id/transactions", async (req: AuthRequest, res) => {
  const cardId = String(req.params.id);
  const card = await prisma.card.findFirst({ where: { id: cardId, userId: req.user!.userId } });
  if (!card) return res.status(404).json({ message: "Card not found" });

  const txs = await prisma.transaction.findMany({
    where: { userId: req.user!.userId, accountId: card.accountId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return res.json(normalizeTransactionHistory(txs));
});
