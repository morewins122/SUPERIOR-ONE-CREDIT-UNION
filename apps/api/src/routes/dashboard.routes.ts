import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { normalizeTransactionHistory } from "../utils/transaction-history.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const [user, accounts, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.account.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 40 })
  ]);

  const currentBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const savingsBalance = accounts
    .filter((a) => a.type === "SAVINGS")
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const spendingByMonth = await prisma.$queryRaw<Array<{ month: string; spent: number }>>`
    SELECT TO_CHAR(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
           COALESCE(SUM(CASE WHEN "direction" = 'DEBIT' THEN "amount" ELSE 0 END), 0)::float AS spent
    FROM "Transaction"
    WHERE "userId" = ${userId}
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 6
  `;

  return res.json({
    welcome: `Welcome back, ${user?.firstName ?? "Member"}`,
    accountNumber: accounts[0]?.accountNumber ?? "N/A",
    currentBalance,
    availableBalance: currentBalance * 0.95,
    savingsBalance,
    recentTransactions: normalizeTransactionHistory(transactions),
    spendingByMonth
  });
});
