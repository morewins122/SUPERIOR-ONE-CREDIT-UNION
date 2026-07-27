import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account, AuditLog, Loan, Transaction, User } from "@/types";

type Analytics = {
  users: number;
  accounts: number;
  transactions: number;
  loans: number;
  pendingLoans: number;
  logs: number;
};

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const load = async () => {
    const [analyticsRes, usersRes, accountsRes, txRes, loansRes, logsRes] = await Promise.all([
      api.get<Analytics>("/admin/analytics"),
      api.get<User[]>("/admin/users"),
      api.get<Account[]>("/admin/accounts"),
      api.get<Transaction[]>("/admin/transactions"),
      api.get<Loan[]>("/admin/loans"),
      api.get<AuditLog[]>("/admin/logs")
    ]);

    setAnalytics(analyticsRes.data);
    setUsers(usersRes.data);
    setAccounts(accountsRes.data);
    setTransactions(txRes.data);
    setLoans(loansRes.data);
    setLogs(logsRes.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateLoanStatus = async (loanId: string, status: Loan["status"]) => {
    await api.patch(`/admin/loans/${loanId}`, { status });
    await load();
  };

  if (!analytics) return <p>Loading admin analytics...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Users</p><p className="text-2xl font-bold">{analytics.users}</p></article>
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Accounts</p><p className="text-2xl font-bold">{analytics.accounts}</p></article>
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Transactions</p><p className="text-2xl font-bold">{analytics.transactions}</p></article>
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Loans</p><p className="text-2xl font-bold">{analytics.loans}</p></article>
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Pending Loans</p><p className="text-2xl font-bold">{analytics.pendingLoans}</p></article>
        <article className="panel rounded-2xl p-5"><p className="text-xs text-slate-500">Audit Logs</p><p className="text-2xl font-bold">{analytics.logs}</p></article>
      </div>

      <article className="panel rounded-2xl p-4">
        <h2 className="mb-2 text-lg font-semibold">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th></tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user) => (
                <tr key={user.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2">{user.firstName} {user.lastName}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel rounded-2xl p-4">
        <h2 className="mb-2 text-lg font-semibold">Account Oversight</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500"><th className="pb-2">Account</th><th className="pb-2">Owner</th><th className="pb-2 text-right">Balance</th></tr>
            </thead>
            <tbody>
              {accounts.slice(0, 10).map((account) => (
                <tr key={account.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2">{account.type} - {account.accountNumber}</td>
                  <td className="py-2">{account.user?.firstName} {account.user?.lastName}</td>
                  <td className="py-2 text-right">${Number(account.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel rounded-2xl p-4">
        <h2 className="mb-2 text-lg font-semibold">Loan Application Management</h2>
        <div className="space-y-2">
          {loans.slice(0, 10).map((loan) => (
            <div key={loan.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm font-semibold">
                {loan.type} ${Number(loan.amount).toLocaleString()} - {loan.user?.firstName} {loan.user?.lastName}
              </p>
              <p className="text-xs text-slate-500">Current status: {loan.status}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => void updateLoanStatus(loan.id, "APPROVED")}>Approve</button>
                <button className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => void updateLoanStatus(loan.id, "REJECTED")}>Reject</button>
                <button className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => void updateLoanStatus(loan.id, "ACTIVE")}>Set Active</button>
                <button className="rounded-full border border-slate-300 px-3 py-1 text-xs" onClick={() => void updateLoanStatus(loan.id, "CLOSED")}>Close</button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel rounded-2xl p-4">
        <h2 className="mb-2 text-lg font-semibold">Recent Transactions</h2>
        <ul className="space-y-1 text-sm">
          {transactions.slice(0, 10).map((tx) => (
            <li key={tx.id} className="border-b border-slate-100 py-2 dark:border-slate-800">
              {new Date(tx.createdAt).toLocaleString()} - {tx.type} - ${Number(tx.amount).toFixed(2)}
            </li>
          ))}
        </ul>
      </article>

      <article className="panel rounded-2xl p-4">
        <h2 className="mb-2 text-lg font-semibold">System Logs</h2>
        <ul className="space-y-1 text-sm">
          {logs.slice(0, 10).map((log) => (
            <li key={log.id} className="border-b border-slate-100 py-2 dark:border-slate-800">
              {new Date(log.createdAt).toLocaleString()} - {log.action} ({log.entity})
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
