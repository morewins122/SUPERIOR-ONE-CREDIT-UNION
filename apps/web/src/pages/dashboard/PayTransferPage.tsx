import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Account } from "@/types";
import { getDemoState } from "@/data/bankDemoData";
import { usePortalUX } from "@/context/PortalUXContext";

const transferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().optional(),
  amount: z.coerce.number().positive(),
  description: z.string().optional()
});

type TransferForm = z.infer<typeof transferSchema>;

type ActiveTab = "bill" | "send";

type RecentPayeeRow = {
  type: string;
  name: string;
  amount: string;
  date: string;
  note: string;
};

type PendingTransferDetails = {
  formValues: TransferForm;
  payload: TransferForm & { toAccountId: string; description: string };
};

type ProcessingStage = "idle" | "processing";

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function PayTransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [billUnavailablePromptOpen, setBillUnavailablePromptOpen] = useState(false);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const [transferFailedPromptOpen, setTransferFailedPromptOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransferDetails | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("bill");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isPayingBill, setIsPayingBill] = useState(false);
  const [billPayee, setBillPayee] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [transactionType, setTransactionType] = useState("International Wire Transfer");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle");
  const [processingOverlayOpen, setProcessingOverlayOpen] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingChecks, setProcessingChecks] = useState({
    recipient: false,
    encryption: false,
    sending: false,
    balance: false
  });
  const { navigatePage } = usePortalUX();
  const { register, handleSubmit } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromAccountId: "checking", amount: 250, description: "" }
  });

  useEffect(() => {
    void (async () => {
      setIsBootstrapping(true);
      const { data } = await api.get<Account[]>("/accounts");
      setAccounts(data);
      window.setTimeout(() => setIsBootstrapping(false), 700);
    })();
  }, []);

  const payees = getDemoState().payees;
  const payeeOptions = payees.map((payee) => `${payee.name} (***)`);

  const recentPayees: RecentPayeeRow[] = [
    { type: "Bill", name: "Sunrise Electric Co.", amount: "$142.65", date: "19/12/2024", note: "Electricity bill" },
    { type: "Bill", name: "Metro Water District", amount: "$58.90", date: "12/12/2024", note: "Water bill" },
    { type: "Bill", name: "Guardian Insurance", amount: "$214.75", date: "05/12/2024", note: "Insurance payment" }
  ];

  useEffect(() => {
    if (!billPayee && payeeOptions.length > 0) {
      setBillPayee(payeeOptions[0]);
    }
  }, [billPayee, payeeOptions]);

  const buildTransferPayload = (values: TransferForm) => {
    const fallbackToAccount = values.fromAccountId === "checking" ? "savings" : "checking";
    return {
      ...values,
      toAccountId: values.toAccountId || fallbackToAccount,
      description: values.description || `${transactionType} to ${recipientName || "recipient"}`
    };
  };

  const prepareTransferConfirmation = (values: TransferForm) => {
    setProcessingStage("idle");
    setProcessingOverlayOpen(false);
    setTransferFailedPromptOpen(false);
    setPendingTransfer({ formValues: values, payload: buildTransferPayload(values) });
    setTransferConfirmOpen(true);
  };

  const onTransfer = async (values: TransferForm) => {
    setIsTransferring(true);

    // Step 1: lock confirm modal controls, then transition into full-screen processing.
    await wait(300);
    setTransferConfirmOpen(false);
    setProcessingOverlayOpen(true);
    setProcessingStage("processing");
    setProcessingProgress(10);
    setProcessingChecks({ recipient: false, encryption: false, sending: false, balance: false });

    try {
      await wait(1100);
      setProcessingChecks((current) => ({ ...current, recipient: true }));
      setProcessingProgress(35);

      await wait(1100);
      setProcessingChecks((current) => ({ ...current, encryption: true }));
      setProcessingProgress(60);

      await wait(1100);
      setProcessingChecks((current) => ({ ...current, sending: true }));
      setProcessingProgress(85);

      await wait(1100);
      setProcessingChecks((current) => ({ ...current, balance: true }));
      setProcessingProgress(100);

      await wait(300);
      setProcessingOverlayOpen(false);
      setProcessingStage("idle");
      setPendingTransfer(null);
      setTransferFailedPromptOpen(true);
    } finally {
      setIsTransferring(false);
    }
  };

  const confirmAndSubmitTransfer = async () => {
    if (!pendingTransfer) {
      return;
    }

    await onTransfer(pendingTransfer.payload);
  };

  const handlePayBill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPayingBill(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 1200));
    setBillUnavailablePromptOpen(true);
    setIsPayingBill(false);
  };

  const sanitizeLetterInput = (value: string) => value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ");
  const sanitizeDigits = (value: string, maxLength: number) => value.replace(/\D/g, "").slice(0, maxLength);
  const sanitizeAlphaNumeric = (value: string, maxLength: number) => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, maxLength);

  if (isBootstrapping) {
    return (
      <section className="panel rounded-2xl p-8 text-center text-slate-600">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#145A5A]/30 border-t-[#145A5A]" />
        Loading transfer tools...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <article className="panel rounded-[20px] border border-slate-200 bg-white p-0 shadow-none">
        <div className="px-5 py-5 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Pay &amp; Transfer</h1>
          <p className="mt-2 text-sm text-slate-600">Send payments and person-to-person transfers from your accounts.</p>
        </div>

        <div className="h-5 bg-[#e8eff0]" aria-hidden="true" />

        <div className="rounded-b-[20px] px-3 py-5 md:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab("bill")}
              className={`rounded-2xl border px-6 py-3 text-lg font-semibold transition ${
                activeTab === "bill" ? "border-[#2e7b72] bg-[#2e7b72] text-white" : "border-slate-300 bg-white text-slate-800"
              }`}
            >
              Pay a Bill
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("send")}
              className={`rounded-2xl border px-6 py-3 text-lg font-semibold transition ${
                activeTab === "send" ? "border-[#2e7b72] bg-[#2e7b72] text-white" : "border-slate-300 bg-white text-slate-800"
              }`}
            >
              Send Money
            </button>
          </div>

          {activeTab === "bill" ? (
            <>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void navigatePage("/dashboard/manage-payees", { title: "Manage Payees", skeleton: "generic", durationMs: 760 })}
                  className="text-base font-semibold text-[#1f7a7a] underline underline-offset-4 hover:text-[#145A5A]"
                >
                  Manage Payees
                </button>
              </div>

              <form className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => void handlePayBill(event)}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Payee</span>
                <select
                  value={billPayee}
                  onChange={(event) => setBillPayee(event.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#2e7b72] focus:outline-none"
                >
                  {payeeOptions.map((payee) => (
                    <option key={payee} value={payee}>
                      {payee}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Amount</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={billAmount}
                  onChange={(event) => setBillAmount(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#2e7b72] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Date</span>
                <input
                  type="date"
                  required
                  value={billDate}
                  onChange={(event) => setBillDate(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#2e7b72] focus:outline-none"
                />
              </label>

              <div className="md:self-end">
                <button
                  type="submit"
                  disabled={isPayingBill}
                  className="h-12 min-w-[220px] rounded-2xl bg-[#78a9a8] px-6 text-base font-semibold text-white transition hover:bg-[#5f9492] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPayingBill ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={26} className="animate-spin" />
                      Paying...
                    </span>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
              </form>
            </>
          ) : (
            <form className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-[#f8fbfc] p-5" onSubmit={handleSubmit(prepareTransferConfirmation)}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Recipient Name</span>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(event) => setRecipientName(sanitizeLetterInput(event.target.value))}
                    placeholder="Recipient name"
                    pattern="[A-Za-z ]+"
                    title="Recipient name must contain letters only"
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Transaction Type</span>
                  <select
                    value={transactionType}
                    onChange={(event) => setTransactionType(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                  >
                    <option>International Wire Transfer</option>
                    <option>Domestic Wire Transfer</option>
                    <option>External Bank Transfer</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Recipient Bank</span>
                <input
                  type="text"
                  required
                  value={recipientBank}
                  onChange={(event) => setRecipientBank(sanitizeLetterInput(event.target.value))}
                  placeholder="Recipient bank name"
                  pattern="[A-Za-z ]+"
                  title="Recipient bank name must contain letters only"
                  className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Account Number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={recipientAccountNumber}
                    onChange={(event) => setRecipientAccountNumber(sanitizeDigits(event.target.value, 14))}
                    placeholder="Enter account number"
                    maxLength={14}
                    pattern="\d{1,14}"
                    title="Account number must contain up to 14 digits"
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Routing Number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={routingNumber}
                    onChange={(event) => setRoutingNumber(sanitizeDigits(event.target.value, 9))}
                    placeholder="Enter routing number"
                    maxLength={9}
                    pattern="\d{9}"
                    title="Routing number must be exactly 9 digits"
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                  />
                </label>
              </div>

              {transactionType === "International Wire Transfer" ? (
                <label className="block md:max-w-[420px]">
                  <span className="mb-2 block text-sm font-medium text-slate-800">SWIFT Code</span>
                  <input
                    type="text"
                    required
                    value={swiftCode}
                    onChange={(event) => setSwiftCode(sanitizeAlphaNumeric(event.target.value, 13))}
                    placeholder="Enter SWIFT code"
                    maxLength={13}
                    pattern="[A-Za-z0-9]{1,13}"
                    title="SWIFT code must contain letters and numbers only, up to 13 characters"
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Source account</span>
                <select className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900" {...register("fromAccountId")}>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.type === "CHECKING" ? "Everyday Checking" : account.type === "SAVINGS" ? "Rainy Day Savings" : "12-Month Fixed Deposit"} ({account.accountNumber}) - {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(account.balance)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-1">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Amount</span>
                <input className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900" type="number" min="0.01" step="0.01" {...register("amount")} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Note (optional)</span>
                <input className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900" placeholder="What is this for?" {...register("description")} />
              </label>

              <div>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="rounded-full bg-[#145A5A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4747] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isTransferring ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Send Money"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      <article className="panel rounded-[20px] border border-slate-200 bg-white p-0 shadow-none">
        <h2 className="px-5 pt-6 text-2xl font-semibold tracking-tight text-slate-800 md:px-6">Recent Payees / Recipients</h2>
        <div className="mt-2 overflow-x-auto rounded-b-[20px]">
          <table className="min-w-[860px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {[
                  ["TYPE", "w-[30%]"],
                  ["NAME", "w-[24%]"],
                  ["AMOUNT", "w-[12%]"],
                  ["DATE", "w-[14%]"],
                  ["NOTE", "w-[20%]"]
                ].map(([label, widthClass]) => (
                  <th key={label} className={`${widthClass} border-y border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayees.map((row) => (
                <tr key={`${row.type}-${row.name}`}>
                  <td className="px-4 py-3 text-base text-slate-800">{row.type}</td>
                  <td className="px-4 py-3 text-base text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-base text-slate-800">{row.amount}</td>
                  <td className="px-4 py-3 text-base text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 text-base text-slate-800">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {billUnavailablePromptOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-semibold text-slate-900">Notice</p>
            <p className="mt-3 text-sm text-slate-700">Can't pay bills at the moment, contact the nearest bank branch.</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setBillUnavailablePromptOpen(false)}
                className="rounded-xl bg-[#145A5A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f4747]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {transferConfirmOpen && pendingTransfer ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <p className="text-lg font-semibold text-slate-900">Confirm Transfer Details</p>
              <p className="mt-1 text-sm text-slate-600">Please review the transfer information before sending money.</p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-slate-200 bg-[#f8fbfc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Recipient</p>
                <div className="mt-2 grid gap-3 text-sm text-slate-800 md:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-600">Name:</span> {recipientName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Type:</span> {transactionType}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Bank:</span> {recipientBank}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Account:</span> {recipientAccountNumber}
                  </p>
                  <p className="md:col-span-2">
                    <span className="font-semibold text-slate-600">Routing:</span> {routingNumber}
                  </p>
                  {transactionType === "International Wire Transfer" ? (
                    <p className="md:col-span-2">
                      <span className="font-semibold text-slate-600">SWIFT:</span> {swiftCode || "Not provided"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f8fbfc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Transfer</p>
                <div className="mt-2 grid gap-3 text-sm text-slate-800 md:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-600">From:</span>{" "}
                    {accounts.find((entry) => entry.id === pendingTransfer.payload.fromAccountId)?.type ?? "Checking"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Amount:</span>{" "}
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(pendingTransfer.payload.amount || 0))}
                  </p>
                  <p className="md:col-span-2">
                    <span className="font-semibold text-slate-600">Note:</span> {pendingTransfer.payload.description || "No note added"}
                  </p>
                </div>
              </div>

              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Transfers may not be reversible once submitted. Confirm recipient details carefully.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isTransferring}
                onClick={() => {
                  setTransferConfirmOpen(false);
                  setPendingTransfer(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Edit Details
              </button>
              <button
                type="button"
                disabled={isTransferring}
                onClick={() => void confirmAndSubmitTransfer()}
                className="rounded-xl bg-[#145A5A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f4747] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isTransferring ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-white" />
                    Processing...
                  </span>
                ) : (
                  "Confirm & Send"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {processingOverlayOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_34px_90px_rgba(15,23,42,0.28)] sm:p-8">
            <p className="text-center text-[1.6rem] font-bold tracking-tight text-slate-900 sm:text-[1.85rem]">Processing Your Transfer</p>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-600 sm:text-base">
              Please wait while we securely verify and process your transfer.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-[#f8fbfc] p-4">
              <p className={`text-sm font-medium transition ${processingChecks.recipient ? "text-emerald-700" : "text-slate-500"}`}>
                {processingChecks.recipient ? "✔" : "○"} Verifying recipient...
              </p>
              <p className={`text-sm font-medium transition ${processingChecks.encryption ? "text-emerald-700" : "text-slate-500"}`}>
                {processingChecks.encryption ? "✔" : "○"} Encrypting transfer...
              </p>
              <p className={`text-sm font-medium transition ${processingChecks.sending ? "text-emerald-700" : "text-slate-500"}`}>
                {processingChecks.sending ? "✔" : "○"} Sending funds...
              </p>
              <p className={`text-sm font-medium transition ${processingChecks.balance ? "text-emerald-700" : "text-slate-500"}`}>
                {processingChecks.balance ? "✔" : "○"} Updating account balance...
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center gap-4">
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#145A5A]/20 border-t-[#145A5A]" />
              <div className="w-full max-w-md">
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#145A5A] to-[#28A79E] transition-all duration-700 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs font-semibold tracking-[0.14em] text-slate-500">{processingProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {transferFailedPromptOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-semibold text-red-700">Failed Transaction</p>
            <p className="mt-3 text-sm text-slate-700">
              Your transaction has failed. Our system detected unusual account activity and has taken steps to protect your account. Contact Any nearest branch with your valid  ID for verification.We apologize for the inconvenience and appreciate your prompt attention to this matter
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTransferFailedPromptOpen(false)}
                className="rounded-xl bg-[#145A5A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f4747]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
