import { useEffect, useMemo, useState } from "react";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { getDemoState } from "@/data/bankDemoData";

export function StatementsPage() {
  const [isLoadingStatements, setIsLoadingStatements] = useState(true);
  const state = getDemoState();
  const checkingRows = useMemo(() => state.transactions.filter((transaction) => transaction.accountId === "checking").slice(0, 20), [state.transactions]);
  const savingsRows = useMemo(() => state.transactions.filter((transaction) => transaction.accountId === "savings").slice(0, 20), [state.transactions]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoadingStatements(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Statements</h1>
        <p className="mt-2 text-sm text-slate-500">Review checking and savings statements.</p>
      </div>

      {isLoadingStatements ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-[#edf8f7] px-4 py-2 text-sm font-medium text-[#145A5A]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#145A5A]/35 border-t-[#145A5A]" />
          Loading Statements...
        </div>
      ) : null}

      <article className="panel rounded-2xl p-5">
        <h2 className="mb-3 text-xl font-semibold">Checking Statement</h2>
        <TransactionTable rows={checkingRows} />
      </article>

      <article className="panel rounded-2xl p-5">
        <h2 className="mb-3 text-xl font-semibold">Savings Statement</h2>
        <TransactionTable rows={savingsRows} />
      </article>
    </section>
  );
}
