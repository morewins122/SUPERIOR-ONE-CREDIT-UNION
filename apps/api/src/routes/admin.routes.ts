import { LoanStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { normalizeTransactionHistory } from "../utils/transaction-history.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/analytics", async (_req, res) => {
  const [users, accounts, transactions, loans, pendingLoans, logs] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.transaction.count(),
    prisma.loan.count(),
    prisma.loan.count({ where: { status: LoanStatus.PENDING } }),
    prisma.auditLog.count()
  ]);

  return res.json({ users, accounts, transactions, loans, pendingLoans, logs });
});

adminRouter.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: { accounts: true }
  });
  return res.json(users);
});

adminRouter.get("/accounts", async (_req, res) => {
  const accounts = await prisma.account.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
  return res.json(accounts);
});

adminRouter.get("/transactions", async (_req, res) => {
  const txs = await prisma.transaction.findMany({ take: 500, orderBy: { createdAt: "desc" } });
  return res.json(normalizeTransactionHistory(txs));
});

adminRouter.get("/loans", async (_req, res) => {
  const loans = await prisma.loan.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  return res.json(loans);
});

adminRouter.patch("/loans/:id", async (req, res) => {
  const schema = z.object({ status: z.nativeEnum(LoanStatus) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const updated = await prisma.loan.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
  return res.json(updated);
});

adminRouter.get("/logs", async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return res.json(logs);
});
