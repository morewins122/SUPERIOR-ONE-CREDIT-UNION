import { useEffect, useState } from "react";
import { Landmark, ReceiptText } from "lucide-react";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { api } from "@/lib/api";
import type { Account, Transaction } from "@/types";

export function CheckingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingChecking, setIsLoadingChecking] = useState(true);

  useEffect(() => {
    void (async () => {
      setIsLoadingChecking(true);
      const [accountRes, txRes] = await Promise.all([api.get<Account[]>("/accounts"), api.get<Transaction[]>("/transactions")]);
      setAccounts(accountRes.data);
      setTransactions(txRes.data.filter((transaction) => transaction.accountId === "checking").slice(0, 15));
      window.setTimeout(() => setIsLoadingChecking(false), 850);
    })();
  }, []);

  const checking = accounts.find((account) => account.id === "checking");

  if (isLoadingChecking) {
    return (
      <section className="panel rounded-2xl p-8 text-center text-slate-600">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#145A5A]/30 border-t-[#145A5A]" />
        Loading checking balances...
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f5f0] text-[#0f5f57]">
          <Landmark size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Checking</h1>
          <p className="text-sm text-slate-500">Account details, debit card, routing number, and recent checking activity.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Account Number</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">**** 3487</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Routing Number</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">**** 1024</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">${checking ? checking.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "8,465.22"}</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Debit Card</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">**** **** **** 4832</p>
        </article>
      </div>

      <article className="panel rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <ReceiptText size={18} className="text-[#0f5f57]" />
          <h2 className="text-xl font-semibold">Recent Checking Transactions</h2>
        </div>
        <TransactionTable rows={transactions} />
      </article>
    </section>
  );
}
