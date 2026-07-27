import { useEffect, useState } from "react";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { api } from "@/lib/api";
import type { Account, Transaction } from "@/types";

type StatementResponse = Account & {
  transactionsFrom: Transaction[];
  transactionsTo: Transaction[];
};

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statementRows, setStatementRows] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const { data } = await api.get<Account[]>("/accounts");
      setAccounts(data);
    })();
  }, []);

  const loadStatement = async (accountId: string) => {
    if (!accountId) {
      setStatementRows([]);
      return;
    }

    const { data } = await api.get<StatementResponse>(`/accounts/${accountId}/statements`);
    const merged = [...data.transactionsFrom, ...data.transactionsTo].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setStatementRows(merged.slice(0, 100));
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Your Accounts</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      <article className="panel space-y-3 rounded-2xl p-4">
        <h2 className="text-lg font-semibold">Account Statements</h2>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 md:max-w-sm"
            value={selectedAccountId}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedAccountId(value);
              void loadStatement(value);
            }}
          >
            <option value="">Select account for statement</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.type} - {account.accountNumber}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm"
            onClick={() => void loadStatement(selectedAccountId)}
          >
            Refresh
          </button>
        </div>
        {statementRows.length > 0 ? (
          <TransactionTable rows={statementRows} />
        ) : (
          <p className="text-sm text-slate-500">Select an account to view recent statement entries.</p>
        )}
      </article>
    </section>
  );
}
