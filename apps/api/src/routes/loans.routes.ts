import { LoanStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const loanRouter = Router();
loanRouter.use(requireAuth);

loanRouter.post("/apply", async (req: AuthRequest, res) => {
  const schema = z.object({
    type: z.enum(["PERSONAL", "AUTO", "MORTGAGE"]),
    amount: z.number().positive(),
    termMonths: z.number().int().min(6).max(480),
    annualRate: z.number().min(1).max(30)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const loan = await prisma.loan.create({
    data: {
      userId: req.user!.userId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      termMonths: parsed.data.termMonths,
      annualRate: parsed.data.annualRate,
      status: LoanStatus.PENDING
    }
  });

  return res.status(201).json(loan);
});

loanRouter.get("/", async (req: AuthRequest, res) => {
  const loans = await prisma.loan.findMany({ where: { userId: req.user!.userId }, orderBy: { createdAt: "desc" } });
  return res.json(loans);
});

loanRouter.post("/calculator", (req, res) => {
  const schema = z.object({ amount: z.number().positive(), termMonths: z.number().positive(), annualRate: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });

  const r = parsed.data.annualRate / 100 / 12;
  const n = parsed.data.termMonths;
  const payment = (parsed.data.amount * r) / (1 - Math.pow(1 + r, -n));

  return res.json({ monthlyPayment: Number(payment.toFixed(2)), totalRepayment: Number((payment * n).toFixed(2)) });
});

loanRouter.get("/:id/schedule", async (req: AuthRequest, res) => {
  const loanId = String(req.params.id);
  const loan = await prisma.loan.findFirst({ where: { id: loanId, userId: req.user!.userId } });
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const monthlyRate = Number(loan.annualRate) / 100 / 12;
  const monthlyPayment = (Number(loan.amount) * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loan.termMonths));

  let remaining = Number(loan.amount);
  const schedule = [] as Array<{ month: number; principal: number; interest: number; remaining: number }>;

  for (let month = 1; month <= loan.termMonths; month += 1) {
    const interest = remaining * monthlyRate;
    const principal = monthlyPayment - interest;
    remaining = Math.max(0, remaining - principal);
    schedule.push({
      month,
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      remaining: Number(remaining.toFixed(2))
    });
  }

  return res.json({ monthlyPayment: Number(monthlyPayment.toFixed(2)), schedule });
});
