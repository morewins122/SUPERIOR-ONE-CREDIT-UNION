import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Account, Transaction } from "@/types";
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

type RecentTransaction = {
  recipient: string;
  amount: string;
  note: string;
  date: string;
  status: string;
};

type PendingTransferDetails = {
  formValues: TransferForm;
  payload: TransferForm & { toAccountId: string; description: string };
};

type ProcessingStage = "idle" | "processing";

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const transferLimit = 10;
const initialTransferCount = 5;

export function PayTransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [billUnavailablePromptOpen, setBillUnavailablePromptOpen] = useState(false);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const [transferSuccessPromptOpen, setTransferSuccessPromptOpen] = useState(false);
  const [limitReachedPromptOpen, setLimitReachedPromptOpen] = useState(false);
  const [transferFailedPromptOpen, setTransferFailedPromptOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransferDetails | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("send");
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
  const [destinationMenuOpen, setDestinationMenuOpen] = useState(false);
  const [destinationAccount, setDestinationAccount] = useState("");
  const [destinationAccountSelected, setDestinationAccountSelected] = useState(false);
  const [transferAmount, setTransferAmount] = useState("250");
  const [transferNote, setTransferNote] = useState("");
  const [transferCount, setTransferCount] = useState(initialTransferCount);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDestinationFromQuery = new URLSearchParams(location.search).get("recipient") ?? "";
  const isTransferAmountStep = location.pathname.endsWith("/amount") || Boolean(selectedDestinationFromQuery);
  const { navigatePage } = usePortalUX();
  const { register, handleSubmit } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fromAccountId: "checking", amount: 250, description: "" }
  });

  useEffect(() => {
    if (selectedDestinationFromQuery) {
      setDestinationAccount(selectedDestinationFromQuery);
      setRecipientName(selectedDestinationFromQuery);
      setDestinationAccountSelected(true);
    } else {
      setDestinationAccountSelected(false);
    }
  }, [selectedDestinationFromQuery]);

  useEffect(() => {
    void (async () => {
      setIsBootstrapping(true);
      const { data } = await api.get<Account[]>("/accounts");
      setAccounts(data);
      if (location.pathname.endsWith("/amount")) {
        const { data: transactions } = await api.get<Transaction[]>("/transactions");
        const farmTransactions = transactions
          .filter((transaction) => transaction.direction === "DEBIT" && transaction.description?.includes("Celestia Valley Farms"))
          .map((transaction) => ({
            recipient: "Celestia Valley Farms",
            amount: `-${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(transaction.amount)}`,
            note: transaction.description?.replace("Transfer to Celestia Valley Farms", "").replace(/^\s*-\s*/, "") || "External",
            date: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(transaction.createdAt)),
            status: transaction.status === "Completed" ? "Sent" : transaction.status || "Pending"
          }));
        if (farmTransactions.length > 0) {
          setRecentTransactions((current) => [...farmTransactions, ...current.filter((entry) => entry.recipient !== "Celestia Valley Farms")]);
        }
      }
      window.setTimeout(() => setIsBootstrapping(false), 700);
    })();
  }, [location.pathname]);

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
    setTransferSuccessPromptOpen(false);
    setLimitReachedPromptOpen(false);
    setTransferFailedPromptOpen(false);
    setPendingTransfer({ formValues: values, payload: buildTransferPayload(values) });
    setTransferConfirmOpen(true);
  };

  const onTransfer = async (values: TransferForm) => {
    setIsTransferring(true);
    const processingStepDelay = 1550;

    // Step 1: lock confirm modal controls, then transition into full-screen processing.
    await wait(300);
    setTransferConfirmOpen(false);
    setProcessingOverlayOpen(true);
    setProcessingStage("processing");
    setProcessingProgress(10);
    setProcessingChecks({ recipient: false, encryption: false, sending: false, balance: false });

    try {
      await wait(processingStepDelay);
      setProcessingChecks((current) => ({ ...current, recipient: true }));
      setProcessingProgress(35);

      await wait(processingStepDelay);
      setProcessingChecks((current) => ({ ...current, encryption: true }));
      setProcessingProgress(60);

      await wait(processingStepDelay);
      setProcessingChecks((current) => ({ ...current, sending: true }));
      setProcessingProgress(85);

      await wait(processingStepDelay);
      setProcessingChecks((current) => ({ ...current, balance: true }));
      setProcessingProgress(100);

      await wait(500);
      setProcessingOverlayOpen(false);
      setProcessingStage("idle");
      if (location.pathname.endsWith("/amount")) {
        await api.post("/transactions/withdraw", {
          accountId: values.fromAccountId,
          amount: Number(values.amount),
          description: `Transfer to Celestia Valley Farms${transferNote.trim() ? ` - ${transferNote.trim()}` : ""}`,
          status: "Pending"
        });
        const { data: refreshedAccounts } = await api.get<Account[]>("/accounts");
        setAccounts(refreshedAccounts);
        const reachesTransferLimit = transferCount + 1 >= transferLimit;
        setTransferCount((current) => Math.min(current + 1, transferLimit));
        setTransferSuccessPromptOpen(!reachesTransferLimit);
        setLimitReachedPromptOpen(reachesTransferLimit);
        setRecentTransactions((current) => [
          {
            recipient: destinationAccount || "Celestia Valley Farms",
            amount: `-${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(values.amount || 0))}`,
            note: transferNote.trim() || "External",
            date: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date()),
            status: "Pending"
          },
          ...current
        ]);
      }
      setPendingTransfer(null);
      if (!location.pathname.endsWith("/amount")) {
        const supportedTransferTypes = ["Domestic Transfer", "ACH Transfer", "International Wire Transfer"];
        const shouldShowFailedPrompt = !destinationAccountSelected && supportedTransferTypes.includes(transactionType);
        if (shouldShowFailedPrompt) {
          setRecentTransactions((current) => [
            {
              recipient: recipientName || "Payment Recipient",
              amount: `-${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(values.amount || 0))}`,
              note: values.description || "Payment Processing",
              date: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date()),
              status: "Pending"
            },
            ...current
          ]);
        }
        setTransferFailedPromptOpen(shouldShowFailedPrompt);
        setTransferSuccessPromptOpen(!shouldShowFailedPrompt);
      }
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

  const sanitizeLetterInput = (value: string) => value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ").slice(0, 60);
  const sanitizeDigits = (value: string, maxLength: number) => value.replace(/\D/g, "").slice(0, maxLength);
  const sanitizeAlphaNumeric = (value: string, maxLength: number) => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, maxLength);

  const handleDestinationSelection = (selected: string) => {
    setDestinationAccount(selected);
    setDestinationAccountSelected(true);
    setRecipientName(selected);
    setDestinationMenuOpen(false);

    if (selected === "Celestia Valley Farms") {
      navigate(`/dashboard/pay-transfer/amount?recipient=${encodeURIComponent(selected)}`);
    }
  };

  const handleTransferAmountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sourceAccountId = accounts[0]?.id || "checking";
    const amountValue = Number(transferAmount || 0);

    if (!destinationAccount || !Number.isFinite(amountValue) || amountValue <= 0) {
      return;
    }

    const transferDetails: PendingTransferDetails = {
      formValues: {
        fromAccountId: sourceAccountId,
        toAccountId: "celestia-valley-farms",
        amount: amountValue,
        description: transferNote.trim() || `Transfer to ${destinationAccount}`
      },
      payload: {
        fromAccountId: sourceAccountId,
        toAccountId: "celestia-valley-farms",
        amount: amountValue,
        description: transferNote.trim() || `Transfer to ${destinationAccount}`
      }
    };

    setPendingTransfer(transferDetails);
    setTransferConfirmOpen(true);
  };

  const resetFarmTransfer = () => {
    setTransferAmount("250");
    setTransferNote("");
    setTransferConfirmOpen(false);
    setPendingTransfer(null);
  };

  if (isBootstrapping) {
    return (
      <section className="panel rounded-2xl p-8 text-center text-slate-600">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#006B8E]/30 border-t-[#006B8E]" />
        Loading transfer tools...
      </section>
    );
  }

  if (isTransferAmountStep && selectedDestinationFromQuery) {
    return (
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-[24px] border border-[#9ac3a3] bg-[#dfeee1] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2fa853] text-2xl text-white">
              ✓
            </span>
            <span className="text-2xl font-bold uppercase tracking-[0.05em] text-[#114b2a]">Transfers Available</span>
          </div>

          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#b6c9b8]">
            <div className="h-full rounded-full bg-[#2fa853] transition-all duration-700" style={{ width: `${(transferCount / transferLimit) * 100}%` }} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-2xl font-bold text-slate-900">
            <span>{transferCount} / {transferLimit}</span>
            <span>{transferCount} remaining</span>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006B8E]">Transfer Funds</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">{destinationAccount}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/pay-transfer")}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-[#f8f9fc] px-5 py-2">
          <div className="flex items-center justify-between border-b border-slate-200 py-4 text-base text-slate-700">
            <span>Account:</span>
            <span className="font-semibold text-slate-900">****{accounts[0]?.accountNumber.slice(-4) || "0428"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 py-4 text-base text-slate-700">
            <span>To Account:</span>
            <span className="font-semibold text-slate-900">{destinationAccount || "-"}</span>
          </div>
          <div className="flex items-center justify-between py-4 text-base text-slate-700">
            <span>Amount:</span>
            <span className="font-semibold text-slate-900">{transferAmount ? `$${Number(transferAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}</span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={(event) => void handleTransferAmountSubmit(event)}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Amount to transfer</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={transferAmount}
              onChange={(event) => setTransferAmount(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
              placeholder="Enter amount"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Note</span>
            <input
              type="text"
              value={transferNote}
              onChange={(event) => setTransferNote(sanitizeLetterInput(event.target.value))}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
              placeholder="Add a note for this transfer"
            />
          </label>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetFarmTransfer}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="text-xl">↻</span>
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3566bd] px-6 text-base font-semibold text-white transition hover:bg-[#28539f]"
            >
              <span className="text-lg">➤</span>
              Transfer Funds
            </button>
          </div>
        </form>

        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-2xl text-[#3566bd]">◔</span>
            <h2 className="text-2xl font-bold tracking-tight text-[#294d88]">Recent Transfers</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {recentTransactions.map((transaction, index) => (
              <div key={`${transaction.recipient}-${transaction.date}-${index}`} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-lg font-semibold text-slate-800">{transaction.recipient}</p>
                  <p className="mt-1 text-sm text-slate-500">{transaction.date}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#d8f0f2] px-3 py-1 text-xs font-medium text-[#286775]">{transaction.note || "External"}</span>
                </div>
                <p className="text-lg font-bold text-[#bb4053]">{transaction.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {transferConfirmOpen && pendingTransfer ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <p className="text-lg font-semibold text-slate-900">Confirm Transfer</p>
                <p className="mt-1 text-sm text-slate-600">Review the details before making this transfer.</p>
              </div>
              <div className="space-y-3 px-6 py-5 text-sm text-slate-800">
                <p><span className="font-semibold text-slate-600">To:</span> {destinationAccount}</p>
                <p><span className="font-semibold text-slate-600">Amount:</span> {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(pendingTransfer.payload.amount || 0))}</p>
                <p><span className="font-semibold text-slate-600">Note:</span> {pendingTransfer.payload.description || "No note"}</p>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setTransferConfirmOpen(false);
                    setPendingTransfer(null);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => void confirmAndSubmitTransfer()}
                  className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {processingOverlayOpen ? (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-white/30 bg-transparent p-7 sm:p-8">
              <img
                src="/front-page-logo.svg"
                alt="Tampa Bay Credit Union"
                className="mx-auto h-24 w-24 animate-[logoBlink_900ms_ease-in-out_infinite] rounded-full border border-white/40 bg-white/80 object-contain p-2 shadow-lg"
              />
              <p className="mt-5 text-center text-2xl font-bold tracking-tight text-white">Processing Your Transfer</p>
              <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/90">Please wait while we securely verify and process your transfer.</p>
              <div className="mt-6 space-y-3 rounded-2xl border border-white/35 bg-white/10 p-4">
                <p className={`text-sm font-medium ${processingChecks.recipient ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.recipient ? "✔" : "○"} Verifying recipient...</p>
                <p className={`text-sm font-medium ${processingChecks.encryption ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.encryption ? "✔" : "○"} Encrypting transfer...</p>
                <p className={`text-sm font-medium ${processingChecks.sending ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.sending ? "✔" : "○"} Sending funds...</p>
                <p className={`text-sm font-medium ${processingChecks.balance ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.balance ? "✔" : "○"} Updating account balance...</p>
              </div>
              <div className="mt-7 flex flex-col items-center gap-4">
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                <div className="w-full max-w-md">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/30">
                    <div className="h-full rounded-full bg-white transition-all duration-700 ease-out" style={{ width: `${processingProgress}%` }} />
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold tracking-[0.14em] text-white/85">{processingProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {transferSuccessPromptOpen ? (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <p className="text-lg font-semibold text-emerald-700">Transfer Sent</p>
              <p className="mt-3 text-sm text-slate-700">Your transfer to {destinationAccount} was sent successfully.</p>
              {recentTransactions[0] ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 text-sm text-slate-800">
                  <p className="font-semibold text-slate-600">Transaction History</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-semibold text-slate-600">Recipient:</span> {recentTransactions[0].recipient}</p>
                    <p><span className="font-semibold text-slate-600">Amount:</span> {recentTransactions[0].amount}</p>
                    <p><span className="font-semibold text-slate-600">Note:</span> {recentTransactions[0].note}</p>
                    <p><span className="font-semibold text-slate-600">Date:</span> {recentTransactions[0].date}</p>
                    <p><span className="font-semibold text-slate-600">Status:</span> <span className="font-semibold text-emerald-700">{recentTransactions[0].status}</span></p>
                  </div>
                </div>
              ) : null}
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={() => setTransferSuccessPromptOpen(false)} className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]">
                  OK
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
                  className="text-base font-semibold text-[#1f7a7a] underline underline-offset-4 hover:text-[#006B8E]"
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
            <form className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-[#f3f5f4] p-5" onSubmit={handleSubmit(prepareTransferConfirmation)}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-800">To Account</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDestinationMenuOpen((value) => !value)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-base font-medium text-slate-900 shadow-sm transition hover:border-[#2e7b72] focus:outline-none focus:ring-2 focus:ring-[#2e7b72]/20"
                    >
                      <span>Select Destination Account</span>
                      <span className="text-xl text-slate-500">▾</span>
                    </button>

                    {destinationMenuOpen ? (
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                        <button
                          type="button"
                          onClick={() => handleDestinationSelection("Celestia Valley Farms")}
                          className="flex w-full items-center rounded-lg px-3 py-2 text-left text-base text-slate-800 transition hover:bg-[#edf7f5]"
                        >
                          Celestia Valley Farms
                        </button>
                      </div>
                    ) : null}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Recipient Name</span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                    value={recipientName}
                    onChange={(event) => setRecipientName(sanitizeLetterInput(event.target.value))}
                    placeholder="Recipient name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Transaction Type</span>
                  <div className="relative">
                    <select
                      value={transactionType}
                      onChange={(event) => setTransactionType(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-[#6ec7d9] bg-white px-3 pr-10 text-base font-medium text-slate-900 shadow-sm focus:outline-none"
                    >
                      <option>International Wire Transfer</option>
                      <option>Domestic Transfer</option>
                      <option>ACH Transfer</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xl text-slate-500">⌄</span>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Recipient Bank</span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                    value={recipientBank}
                    onChange={(event) => setRecipientBank(sanitizeLetterInput(event.target.value))}
                    placeholder="Recipient bank name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Routing Number</span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                    value={routingNumber}
                    onChange={(event) => setRoutingNumber(sanitizeDigits(event.target.value, 9))}
                    placeholder="Enter routing number"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Account Number</span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                    value={recipientAccountNumber}
                    onChange={(event) => setRecipientAccountNumber(sanitizeDigits(event.target.value, 12))}
                    placeholder="Enter account number"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">SWIFT Code</span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                    value={swiftCode}
                    onChange={(event) => setSwiftCode(sanitizeAlphaNumeric(event.target.value, 10))}
                    placeholder="Enter SWIFT code"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Source account</span>
                <div className="relative">
                  <select className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-[#e9ecec] px-3 pr-10 text-base font-semibold text-slate-900 shadow-sm focus:border-[#2e7b72] focus:outline-none" {...register("fromAccountId")}>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.type === "CHECKING" ? "Everyday Checking" : account.type === "SAVINGS" ? "Rainy Day Savings" : "12-Month Fixed Deposit"} (**** {account.accountNumber.slice(-4)}) - {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(account.balance)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xl text-slate-500">⌄</span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Amount</span>
                <input
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="250"
                  {...register("amount")}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Note (optional)</span>
                <input
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#2e7b72] focus:outline-none"
                  placeholder="What is this for?"
                  {...register("description")}
                />
              </label>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="rounded-full bg-[#006B8E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005A7A] disabled:cursor-not-allowed disabled:opacity-70"
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
                className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]"
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
                {destinationAccount === "Celestia Valley Farm" ? (
                  <div className="mt-2 grid gap-3 text-sm text-slate-800 md:grid-cols-2">
                    <p className="md:col-span-2">
                      <span className="font-semibold text-slate-600">Account Name:</span> {destinationAccount}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-semibold text-slate-600">Type:</span> External Wire Transfer
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-3 text-sm text-slate-800 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-600">Name:</span> {recipientName || destinationAccount || "Celestia Valley Farm"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">Type:</span> {transactionType}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">Bank:</span> {recipientBank || "Selected destination account"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">Account:</span> {recipientAccountNumber || "Not required"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-semibold text-slate-600">Routing:</span> {routingNumber || "Not required"}
                    </p>
                    {transactionType === "International Wire Transfer" ? (
                      <p className="md:col-span-2">
                        <span className="font-semibold text-slate-600">SWIFT:</span> {swiftCode || "Not required"}
                      </p>
                    ) : null}
                  </div>
                )}
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
                className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A] disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/30 bg-transparent p-7 sm:p-8">
            <img src="/front-page-logo.svg" alt="Tampa Bay Credit Union" className="mx-auto h-24 w-24 animate-[logoBlink_900ms_ease-in-out_infinite] rounded-full border border-white/40 bg-white/80 object-contain p-2 shadow-lg" />
            <p className="mt-5 text-center text-2xl font-bold tracking-tight text-white">Processing Your Transfer</p>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/90">Please wait while we securely verify and process your transfer.</p>
            <div className="mt-6 space-y-3 rounded-2xl border border-white/35 bg-white/10 p-4">
              <p className={`text-sm font-medium ${processingChecks.recipient ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.recipient ? "✔" : "○"} Verifying recipient...</p>
              <p className={`text-sm font-medium ${processingChecks.encryption ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.encryption ? "✔" : "○"} Encrypting transfer...</p>
              <p className={`text-sm font-medium ${processingChecks.sending ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.sending ? "✔" : "○"} Sending funds...</p>
              <p className={`text-sm font-medium ${processingChecks.balance ? "text-emerald-200" : "text-white/75"}`}>{processingChecks.balance ? "✔" : "○"} Updating account balance...</p>
            </div>
            <div className="mt-7 flex flex-col items-center gap-4">
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
              <div className="w-full max-w-md">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all duration-700 ease-out" style={{ width: `${processingProgress}%` }} /></div>
                <p className="mt-2 text-center text-xs font-semibold tracking-[0.14em] text-white/85">{processingProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {transferSuccessPromptOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-semibold text-emerald-700">Transfer Sent</p>
            <p className="mt-3 text-sm text-slate-700">
              Your transfer to {destinationAccount || "Celestia Valley Farms"} was sent successfully.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTransferSuccessPromptOpen(false)}
                className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {transferFailedPromptOpen ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-semibold text-black">Payment Processing</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Your payment Case No: 40008724539 has been processed and funds will be paid into your bank account in 7 working days. Enquiries contact local Labour Centre. Case No: 40008724539
            </p>
            <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 text-sm text-slate-800">
              <p className="font-semibold text-slate-600">Transaction History</p>
              <div className="mt-3 space-y-2">
                <p><span className="font-semibold text-slate-600">Recipient:</span> {recentTransactions[0]?.recipient || recipientName || "Payment Recipient"}</p>
                <p><span className="font-semibold text-slate-600">Amount:</span> {recentTransactions[0]?.amount || `-${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(pendingTransfer?.payload.amount || 0))}`}</p>
                <p><span className="font-semibold text-slate-600">Note:</span> {recentTransactions[0]?.note || pendingTransfer?.payload.description || "Payment Processing"}</p>
                <p><span className="font-semibold text-slate-600">Date:</span> {recentTransactions[0]?.date || new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date())}</p>
                <p><span className="font-semibold text-slate-600">Status:</span> <span className="font-semibold text-amber-700">Pending</span></p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTransferFailedPromptOpen(false)}
                className="rounded-xl bg-[#006B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

        {limitReachedPromptOpen ? (
          <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
              <p className="text-2xl font-bold text-amber-700">Limit Reached</p>
              <p className="mt-3 text-sm text-slate-700">You have reached the 10/10 transfer limit.</p>
              {recentTransactions[0] ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fbfc] p-4 text-left text-sm text-slate-800">
                  <p className="font-semibold text-slate-600">Transaction History</p>
                  <div className="mt-3 space-y-2">
                    <p><span className="font-semibold text-slate-600">Recipient:</span> {recentTransactions[0].recipient}</p>
                    <p><span className="font-semibold text-slate-600">Amount:</span> {recentTransactions[0].amount}</p>
                    <p><span className="font-semibold text-slate-600">Note:</span> {recentTransactions[0].note}</p>
                    <p><span className="font-semibold text-slate-600">Date:</span> {recentTransactions[0].date}</p>
                    <p><span className="font-semibold text-slate-600">Status:</span> <span className="font-semibold text-emerald-700">{recentTransactions[0].status}</span></p>
                  </div>
                </div>
              ) : null}
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLimitReachedPromptOpen(false)}
                  className="rounded-xl bg-[#006B8E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#005A7A]"
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
