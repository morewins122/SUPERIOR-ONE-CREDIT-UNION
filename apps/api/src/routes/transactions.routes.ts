import { Direction, TransactionType } from "@prisma/client";
import PDFDocument from "pdfkit";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { normalizeTransactionHistory } from "../utils/transaction-history.js";

export const transactionRouter = Router();
transactionRouter.use(requireAuth);

const transferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional()
});

transactionRouter.post("/deposit", async (req: AuthRequest, res) => {
  const schema = z.object({ accountId: z.string(), amount: z.number().positive(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const account = await prisma.account.findFirst({ where: { id: parsed.data.accountId, userId: req.user!.userId } });
  if (!account) return res.status(404).json({ message: "Account not found" });

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: { balance: { increment: parsed.data.amount } }
  });

  const tx = await prisma.transaction.create({
    data: {
      userId: req.user!.userId,
      accountId: account.id,
      type: TransactionType.DEPOSIT,
      direction: Direction.CREDIT,
      amount: parsed.data.amount,
      description: parsed.data.description ?? "Deposit"
    }
  });

  return res.status(201).json({ transaction: tx, balance: updated.balance });
});

transactionRouter.post("/withdraw", async (req: AuthRequest, res) => {
  const schema = z.object({ accountId: z.string(), amount: z.number().positive(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const account = await prisma.account.findFirst({ where: { id: parsed.data.accountId, userId: req.user!.userId } });
  if (!account) return res.status(404).json({ message: "Account not found" });
  if (Number(account.balance) < parsed.data.amount) return res.status(400).json({ message: "Insufficient funds" });

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: { balance: { decrement: parsed.data.amount } }
  });

  const tx = await prisma.transaction.create({
    data: {
      userId: req.user!.userId,
      accountId: account.id,
      type: TransactionType.WITHDRAWAL,
      direction: Direction.DEBIT,
      amount: parsed.data.amount,
      description: parsed.data.description ?? "Withdrawal"
    }
  });

  return res.status(201).json({ transaction: tx, balance: updated.balance });
});

transactionRouter.post("/transfer", async (req: AuthRequest, res) => {
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const { fromAccountId, toAccountId, amount, description } = parsed.data;
  if (fromAccountId === toAccountId) return res.status(400).json({ message: "Accounts must be different" });

  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromAccountId, userId: req.user!.userId } }),
    prisma.account.findFirst({ where: { id: toAccountId, userId: req.user!.userId } })
  ]);

  if (!fromAccount || !toAccount) return res.status(404).json({ message: "Account not found" });
  if (Number(fromAccount.balance) < amount) return res.status(400).json({ message: "Insufficient funds" });

  const [updatedFrom, updatedTo] = await prisma.$transaction([
    prisma.account.update({ where: { id: fromAccount.id }, data: { balance: { decrement: amount } } }),
    prisma.account.update({ where: { id: toAccount.id }, data: { balance: { increment: amount } } })
  ]);

  const tx = await prisma.transaction.create({
    data: {
      userId: req.user!.userId,
      accountId: fromAccount.id,
      toAccountId: toAccount.id,
      type: TransactionType.TRANSFER,
      direction: Direction.DEBIT,
      amount,
      description: description ?? "Internal transfer"
    }
  });

  return res.status(201).json({ transaction: tx, fromBalance: updatedFrom.balance, toBalance: updatedTo.balance });
});

transactionRouter.get("/", async (req: AuthRequest, res) => {
  const { search, startDate, endDate } = req.query;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user!.userId,
      description: search
        ? {
            contains: String(search),
            mode: "insensitive"
          }
        : undefined,
      createdAt:
        startDate || endDate
          ? {
              gte: startDate ? new Date(String(startDate)) : undefined,
              lte: endDate ? new Date(String(endDate)) : undefined
            }
          : undefined
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return res.json(normalizeTransactionHistory(transactions));
});

transactionRouter.get("/export/pdf", async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=statement.pdf");

  doc.pipe(res);
  doc.fontSize(16).text("Superior One Credit Union - Account Statement");
  doc.moveDown();

  normalizeTransactionHistory(transactions).forEach((tx) => {
    doc.fontSize(10).text(
      `${tx.createdAt.toISOString()} | ${tx.type} | ${tx.direction} | $${Number(tx.amount).toFixed(2)} | ${tx.description ?? ""}`
    );
  });

  doc.end();
});
