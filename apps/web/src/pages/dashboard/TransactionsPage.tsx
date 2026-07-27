import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { usePortalUX } from "@/context/PortalUXContext";
import { api } from "@/lib/api";
import type { Account, Transaction } from "@/types";

const actionSchema = z.object({
  accountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().optional()
});

type ActionForm = z.infer<typeof actionSchema>;

export function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [isSearching, setIsSearching] = useState(false);
  const { showToast } = usePortalUX();

  const categories = ["All", "Salary", "Income", "Groceries", "Shopping", "Dining", "Fuel", "Utilities", "Entertainment", "Transfer", "Healthcare", "Travel", "Banking"];
  const statuses = ["All", "Completed", "Pending", "Processing"];
  const sortOptions = [
    { value: "newest", label: "Newest → Oldest" },
    { value: "oldest", label: "Oldest → Newest" },
    { value: "highest", label: "Highest Amount" },
    { value: "lowest", label: "Lowest Amount" }
  ];

  const {
    register: registerTransfer,
    handleSubmit: handleTransferSubmit,
    reset: resetTransfer
  } = useForm<{ fromAccountId: string; toAccountId: string; amount: number; description?: string }>({
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
      description: ""
    }
  });

  const { register, handleSubmit, reset } = useForm<ActionForm>({ resolver: zodResolver(actionSchema) });

  const load = async (params?: { search?: string; category?: string; status?: string; startDate?: string; endDate?: string; sort?: string }) => {
    const [txRes, accountRes] = await Promise.all([
      api.get<Transaction[]>("/transactions", { params }),
      api.get<Account[]>("/accounts")
    ]);
    setRows(txRes.data);
    setAccounts(accountRes.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const doDeposit = async (data: ActionForm) => {
    await api.post("/transactions/deposit", data);
    reset();
    await load();
  };

  const doWithdraw = async (data: ActionForm) => {
    await api.post("/transactions/withdraw", data);
    reset();
    await load();
  };

  const doTransfer = async (data: { fromAccountId: string; toAccountId: string; amount: number; description?: string }) => {
    await api.post("/transactions/transfer", data);
    resetTransfer();
    await load();
  };

  const applyFilters = async () => {
    setIsSearching(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 900));
    await load({
      search: search || undefined,
      category,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sort
    });
    setIsSearching(false);
  };

  const exportPdf = async () => {
    const response = await api.get<Blob>("/transactions/export/pdf", { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statement.pdf";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Statement downloaded.", "success");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button type="button" onClick={() => void exportPdf()} className="rounded-full border border-slate-300 px-4 py-2 text-sm">
          Export PDF
        </button>
      </div>

      <form className="panel grid gap-3 rounded-2xl p-4 md:grid-cols-4" onSubmit={handleSubmit(doDeposit)}>
        <select className="rounded-xl border border-slate-300 px-3 py-2" {...register("accountId")}>
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.type} - {a.accountNumber}</option>
          ))}
        </select>
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Amount" {...register("amount")} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Description" {...register("description")} />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-white">Deposit</button>
          <button type="button" onClick={handleSubmit(doWithdraw)} className="flex-1 rounded-full bg-red-500 px-4 py-2 text-white">Withdraw</button>
        </div>
      </form>

      <form className="panel grid gap-3 rounded-2xl p-4 md:grid-cols-4" onSubmit={handleTransferSubmit(doTransfer)}>
        <select className="rounded-xl border border-slate-300 px-3 py-2" {...registerTransfer("fromAccountId", { required: true })}>
          <option value="">From account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.type} - {a.accountNumber}</option>
          ))}
        </select>
        <select className="rounded-xl border border-slate-300 px-3 py-2" {...registerTransfer("toAccountId", { required: true })}>
          <option value="">To account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.type} - {a.accountNumber}</option>
          ))}
        </select>
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Amount" {...registerTransfer("amount", { valueAsNumber: true })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Transfer description" {...registerTransfer("description")} />
        <div className="md:col-span-4">
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-white">Transfer Between Own Accounts</button>
        </div>
      </form>

      <div className="panel grid gap-3 rounded-2xl p-4 md:grid-cols-4 xl:grid-cols-6">
        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Search description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="rounded-xl border border-slate-300 px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Categories" : option}
            </option>
          ))}
        </select>
        <select className="rounded-xl border border-slate-300 px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Statuses" : option}
            </option>
          ))}
        </select>
        <select className="rounded-xl border border-slate-300 px-3 py-2" value={sort} onChange={(event) => setSort(event.target.value)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <div className="flex gap-2">
          <button type="button" onClick={() => void applyFilters()} disabled={isSearching} className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60">
            {isSearching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Searching...
              </span>
            ) : (
              "Filter"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setStatus("All");
              setStartDate("");
              setEndDate("");
              setSort("newest");
              void load();
            }}
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {isSearching ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-[#edf8f7] px-4 py-2 text-sm font-medium text-[#145A5A]">
          <Loader2 size={14} className="animate-spin" />
          Searching transactions...
        </div>
      ) : null}

      <TransactionTable rows={rows} />
    </section>
  );
}
