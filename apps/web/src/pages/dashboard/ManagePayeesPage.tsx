import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getDemoState } from "@/data/bankDemoData";
import { usePortalUX } from "@/context/PortalUXContext";

type ManagedPayee = {
  name: string;
  category: string;
  maskedAccount: string;
};

const payeeMeta: Record<string, { category: string; maskedAccount: string }> = {
  "Electric Company": { category: "Utilities", maskedAccount: "**** 3902" },
  "Sunrise Electric Co.": { category: "Utilities", maskedAccount: "**** 3902" },
  "Water Utility": { category: "Utilities", maskedAccount: "**** 8814" },
  "Metro Water District": { category: "Utilities", maskedAccount: "**** 8814" },
  "Guardian Insurance": { category: "Insurance", maskedAccount: "**** 1175" }
};

function maskAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  const last4 = digits.slice(-4).padStart(4, "0");
  return `**** ${last4}`;
}

export function ManagePayeesPage() {
  const { navigatePage, showToast } = usePortalUX();
  const basePayees = useMemo<ManagedPayee[]>(() => {
    const statePayees = getDemoState().payees;
    return statePayees.map((payee) => {
      const meta = payeeMeta[payee.name] ?? { category: "General", maskedAccount: "**** 0000" };
      return {
        name: payee.name,
        category: meta.category,
        maskedAccount: meta.maskedAccount
      };
    });
  }, []);

  const [payees, setPayees] = useState<ManagedPayee[]>(basePayees);
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [payeeCategory, setPayeeCategory] = useState("Utilities");

  const onRemove = (name: string) => {
    setPayees((current) => current.filter((entry) => entry.name !== name));
    showToast("Payee removed.", "info");
  };

  const onAddPayee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (accountNumber !== confirmAccountNumber) {
      showToast("Account numbers do not match.", "info");
      return;
    }

    if (!payeeName.trim()) {
      showToast("Enter a payee name.", "info");
      return;
    }

    const nextPayee: ManagedPayee = {
      name: payeeName.trim(),
      category: payeeCategory,
      maskedAccount: maskAccountNumber(accountNumber)
    };

    setPayees((current) => [nextPayee, ...current]);
    setAccountNumber("");
    setConfirmAccountNumber("");
    setPayeeName("");
    setPayeeCategory("Utilities");
    showToast("Payee added.", "success");
  };

  return (
    <section className="space-y-5">
      <article className="panel rounded-[20px] border border-slate-200 bg-white p-0 shadow-none">
        <header className="relative px-5 py-4 md:px-6">
          <button
            type="button"
            onClick={() => void navigatePage("/dashboard/pay-transfer", { title: "Pay & Transfer", skeleton: "pay-transfer", durationMs: 760 })}
            className="absolute left-5 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            aria-label="Back to Pay & Transfer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-center text-3xl font-bold tracking-tight text-slate-800">Add and Manage Payees</h1>
        </header>

        <div className="px-5 pb-6 md:px-6">
          <h2 className="mb-3 text-2xl font-semibold text-slate-800">Existing Payees</h2>

          <div className="space-y-4">
            {payees.map((payee) => (
              <div key={`${payee.name}-${payee.maskedAccount}`} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-[#f8fbfc] px-5 py-5">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{payee.name}</p>
                  <p className="mt-1 text-lg text-slate-600">
                    {payee.category} - {payee.maskedAccount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(payee.name)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-lg font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={onAddPayee} className="mt-5 rounded-3xl border border-slate-200 bg-[#f8fbfc] px-4 py-5 md:px-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-slate-800">Add a Payee</h3>
              <ChevronDown size={20} className="text-slate-600" />
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Bank Account Number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="Enter account number"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#eef5f8] px-4 text-base text-slate-800 placeholder:text-slate-500 focus:border-[#145A5A] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Bank Account Number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={confirmAccountNumber}
                  onChange={(event) => setConfirmAccountNumber(event.target.value)}
                  placeholder="Re-enter account number"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#eef5f8] px-4 text-base text-slate-800 placeholder:text-slate-500 focus:border-[#145A5A] focus:outline-none"
                />
                <span className="mt-2 block text-sm text-slate-600">Enter again for confirmation</span>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Payee Name</span>
                  <input
                    type="text"
                    required
                    value={payeeName}
                    onChange={(event) => setPayeeName(event.target.value)}
                    placeholder="Enter payee name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-[#eef5f8] px-4 text-base text-slate-800 placeholder:text-slate-500 focus:border-[#145A5A] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Category</span>
                  <select
                    value={payeeCategory}
                    onChange={(event) => setPayeeCategory(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-[#eef5f8] px-4 text-base text-slate-800 focus:border-[#145A5A] focus:outline-none"
                  >
                    <option>Utilities</option>
                    <option>Insurance</option>
                    <option>Credit Card</option>
                    <option>General</option>
                  </select>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#145A5A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4747]"
                >
                  Save Payee
                </button>
              </div>
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}