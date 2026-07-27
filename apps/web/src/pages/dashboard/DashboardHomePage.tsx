import { useEffect, useState } from "react";
import { AccountSummaryCard } from "@/components/dashboard/AccountSummaryCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { api } from "@/lib/api";
import type { Account, Transaction } from "@/types";

type DashboardResponse = {
  welcome: string;
  accountNumber: string;
  currentBalance: number;
  availableBalance: number;
  savingsBalance: number;
  rewardsPoints: number;
  recentTransactions: Transaction[];
  spendingByMonth: Array<{ month: string; spent: number }>;
};

export function DashboardHomePage() {
  const [summary, setSummary] = useState<DashboardResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    void (async () => {
      const [summaryRes, accountRes] = await Promise.all([
        api.get<DashboardResponse>("/dashboard/summary"),
        api.get<Account[]>("/accounts")
      ]);
      setSummary(summaryRes.data);
      setAccounts(accountRes.data);
    })();
  }, []);

  if (!summary) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6 min-w-0">
      <article className="panel animate-fade-in rounded-[32px] p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#145A5A]">WELCOME BACK</p>
            <h1 className="mt-3 text-[clamp(1.8rem,5vw,2.25rem)] font-extrabold tracking-tight text-slate-900">Welcome back, Philips</h1>
            <p className="mt-2 text-sm text-slate-500">Account: {summary.accountNumber}</p>
          </div>

          <div className="space-y-4 border-t border-slate-200/70 pt-5 sm:pt-6 lg:pt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AVAILABLE BALANCE</p>
              <button
                type="button"
                onClick={() => setShowBalance((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#145A5A] transition hover:bg-[#edf8f7]"
                aria-pressed={showBalance}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                <i className={`fa-regular ${showBalance ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
                {showBalance ? "Hide" : "View"}
              </button>
            </div>
            <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1.8rem,5vw,2.25rem)] font-extrabold leading-tight tracking-tight text-slate-900 sm:max-w-full">
              {showBalance
                ? `$${summary.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "$••••••••"}
            </p>
          </div>
        </div>
      </article>

      <section className="panel mt-8 animate-slide-up rounded-[20px] p-5 sm:p-6 lg:p-8">
        <h2 className="text-[clamp(1.5rem,3.8vw,2.25rem)] font-bold leading-tight text-[#1E293B]">Account Summary</h2>
        <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.slice(0, 3).map((account) => (
            <div key={account.id} className="h-full">
              <AccountSummaryCard account={account} />
            </div>
          ))}
        </div>
      </section>

      <article className="panel animate-slide-up rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Recent Transactions</h2>
          <span className="w-fit rounded-full bg-[#edf8f7] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0D5C63]">Searchable</span>
        </div>
        <div className="mt-4">
          <TransactionTable rows={summary.recentTransactions.slice(0, 50)} />
        </div>
      </article>
    </div>
  );
}