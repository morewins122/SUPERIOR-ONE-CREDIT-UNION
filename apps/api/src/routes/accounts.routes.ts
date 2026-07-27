import { AccountType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { makeAccountNumber } from "../utils/account.js";
import { normalizeTransactionHistory } from "../utils/transaction-history.js";

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.get("/", async (req: AuthRequest, res) => {
  const accounts = await prisma.account.findMany({ where: { userId: req.user!.userId } });
  return res.json(accounts);
});

accountRouter.post("/", async (req: AuthRequest, res) => {
  const schema = z.object({ type: z.nativeEnum(AccountType), initialBalance: z.number().min(0).default(0) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const account = await prisma.account.create({
    data: {
      userId: req.user!.userId,
      type: parsed.data.type,
      accountNumber: makeAccountNumber(parsed.data.type),
      balance: parsed.data.initialBalance
    }
  });

  return res.status(201).json(account);
});

accountRouter.get("/:id/statements", async (req: AuthRequest, res) => {
  const accountId = String(req.params.id);
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: req.user!.userId },
    include: {
      transactionsFrom: { orderBy: { createdAt: "desc" }, take: 50 },
      transactionsTo: { orderBy: { createdAt: "desc" }, take: 50 }
    }
  });

  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }

  return res.json({
    ...account,
    transactionsFrom: normalizeTransactionHistory(account.transactionsFrom),
    transactionsTo: normalizeTransactionHistory(account.transactionsTo)
  });
});
