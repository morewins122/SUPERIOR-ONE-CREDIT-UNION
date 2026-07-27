import type { Account, AuditLog, Loan, Transaction, User } from "@/types";
import {
  bankData,
  createCsvBlob,
  createPdfBlob,
  DEMO_AUTH_CREDENTIALS,
  filterTransactions,
  getDemoState,
  resetDemoState,
  updateDemoState
} from "@/data/bankDemoData";

type ResponseConfig = {
  params?: Record<string, string | number | undefined>;
  responseType?: string;
  headers?: Record<string, string>;
};

type DemoResponse<T> = Promise<{ data: T }>;

type LoginPayload = {
  userId?: string;
  username?: string;
  email?: string;
  password?: string;
};

type TransferPayload = {
  fromAccountId?: string;
  toAccountId?: string;
  accountId?: string;
  amount?: number;
  description?: string;
};

interface DemoApi {
  get<T>(url: string, config?: ResponseConfig): DemoResponse<T>;
  post<T>(url: string, body?: unknown, config?: ResponseConfig): DemoResponse<T>;
  put<T>(url: string, body?: unknown, config?: ResponseConfig): DemoResponse<T>;
  patch<T>(url: string, body?: unknown, config?: ResponseConfig): DemoResponse<T>;
  delete<T>(url: string, config?: ResponseConfig): DemoResponse<T>;
}

const SESSION_KEY = bankData.auth.sessionKey;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as { userId: string; loginAt: string }) : null;
}

function writeSession(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, loginAt: new Date().toISOString() }));
}

function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(SESSION_KEY);
}

function createError(message: string) {
  return new Error(message);
}

function response<T>(data: T): DemoResponse<T> {
  return Promise.resolve({ data });
}

function getAccountById(accountId: string) {
  const state = getDemoState();
  return state.accounts.find((account) => account.id === accountId);
}

function getAuthUser() {
  const session = readSession();
  if (!session) {
    return null;
  }

  return clone(getDemoState().authUser);
}

function buildMonthlySpending() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const totals = [5400, 4860, 5240, 4988, 4735, 5122];
  return months.map((month, index) => ({ month, spent: totals[index] }));
}

function calculateLoanSchedule(amount: number, annualRate: number, termMonths: number) {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? amount / termMonths
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  let remaining = amount;
  const schedule = [] as Array<{ month: number; principal: number; interest: number; remaining: number }>;

  for (let month = 1; month <= termMonths; month += 1) {
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

  return { monthlyPayment: Number(monthlyPayment.toFixed(2)), schedule };
}

function updateBalancesForTransfer(fromAccountId: string, toAccountId: string, amount: number) {
  updateDemoState((draft) => {
    const fromAccount = draft.accounts.find((account) => account.id === fromAccountId);
    const toAccount = draft.accounts.find((account) => account.id === toAccountId);

    if (!fromAccount || !toAccount) {
      return;
    }

    fromAccount.balance = Number((fromAccount.balance - amount).toFixed(2));
    toAccount.balance = Number((toAccount.balance + amount).toFixed(2));
    draft.checking.balance = draft.accounts.find((account) => account.id === "checking")?.balance ?? draft.checking.balance;
    draft.savings.balance = draft.accounts.find((account) => account.id === "savings")?.balance ?? draft.savings.balance;
    draft.summary.availableBalance = Number(draft.accounts.reduce((total, account) => total + Number(account.balance), 0).toFixed(2));
  });
}

function createTransactionId(date: Date) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `TXN-${year}${month}${day}-${suffix}`;
}

function addTransaction(transaction: Transaction) {
  updateDemoState((draft) => {
    const balanceAfter = Number(draft.summary.availableBalance.toFixed(2));
    const createdAt = new Date(transaction.createdAt);

    draft.transactions.unshift({
      ...transaction,
      id: transaction.id || createTransactionId(createdAt),
      transactionId: transaction.transactionId || createTransactionId(createdAt),
      balance: balanceAfter
    });
    draft.statements.checking = draft.transactions.filter((entry) => entry.accountId === "checking").slice(0, 20);
    draft.statements.savings = draft.transactions.filter((entry) => entry.accountId === "savings").slice(0, 20);
    draft.summary.availableBalance = balanceAfter;
  });
}

export const api: DemoApi = {
  async get<T>(url: string, config?: ResponseConfig): DemoResponse<T> {
    const state = getDemoState();
    const params = config?.params ?? {};

    if (url === "/auth/csrf-token") {
      return response({ csrfToken: "demo-csrf-token" } as T);
    }

    if (url === "/auth/me") {
      const user = getAuthUser();
      if (!user) {
        throw createError("Unauthorized");
      }
      return response(user as T);
    }

    if (url === "/dashboard/summary") {
      return response(
        {
          welcome: `Welcome back, ${state.customer.preferredName}`,
          accountNumber: state.checking.accountNumber,
          currentBalance: state.summary.checkingBalance,
          availableBalance: state.summary.availableBalance,
          savingsBalance: state.summary.savingsBalance,
          rewardsPoints: state.summary.rewardsPoints,
          recentTransactions: clone(state.transactions.slice(0, 50)),
          spendingByMonth: buildMonthlySpending()
        } as T
      );
    }

    if (url === "/accounts") {
      return response(clone(state.accounts) as T);
    }

    const accountStatementMatch = url.match(/^\/accounts\/([^/]+)\/statements$/);
    if (accountStatementMatch) {
      const accountId = accountStatementMatch[1];
      const account = state.accounts.find((entry) => entry.id === accountId);
      if (!account) {
        throw createError("Account not found");
      }

      const transactionsFrom = state.transactions.filter((tx) => tx.accountId === accountId).slice(0, 50);
      const transactionsTo = state.transactions.filter((tx) => tx.toAccountId === accountId).slice(0, 50);
      return response({ ...clone(account), transactionsFrom: clone(transactionsFrom), transactionsTo: clone(transactionsTo) } as T);
    }

    if (url === "/transactions") {
      const filtered = filterTransactions(clone(state.transactions), params as Record<string, string>);
      return response(filtered as T);
    }

    if (url === "/transactions/export/pdf") {
      return response(createPdfBlob() as T);
    }

    if (url === "/cards") {
      return response(clone(state.cards) as T);
    }

    const cardTransactionsMatch = url.match(/^\/cards\/([^/]+)\/transactions$/);
    if (cardTransactionsMatch) {
      return response(clone(state.transactions.slice(0, 12)) as T);
    }

    if (url === "/loans") {
      return response(clone(state.loans) as T);
    }

    const scheduleMatch = url.match(/^\/loans\/([^/]+)\/schedule$/);
    if (scheduleMatch) {
      const loan = state.loans.find((entry) => entry.id === scheduleMatch[1]);
      if (!loan) {
        throw createError("Loan not found");
      }

      const { schedule } = calculateLoanSchedule(Number(loan.amount), Number(loan.annualRate), Number(loan.termMonths));
      return response({ schedule } as T);
    }

    if (url === "/profile") {
      return response(
        {
          firstName: state.customer.firstName,
          lastName: state.customer.lastName,
          phone: state.customer.phone,
          profileImageUrl: state.customer.profileImageUrl,
          notificationPreferences: state.customer.notificationPreferences
        } as T
      );
    }

    if (url === "/admin/analytics") {
      return response(
        {
          users: state.admin.users.length,
          accounts: state.accounts.length,
          transactions: state.transactions.length,
          loans: state.loans.length,
          pendingLoans: state.loans.filter((loan) => loan.status === "PENDING").length,
          logs: state.admin.logs.length
        } as T
      );
    }

    if (url === "/admin/users") {
      return response(clone(state.admin.users) as T);
    }

    if (url === "/admin/accounts") {
      return response(clone(state.accounts) as T);
    }

    if (url === "/admin/transactions") {
      return response(clone(state.transactions) as T);
    }

    if (url === "/admin/loans") {
      return response(clone(state.loans) as T);
    }

    if (url === "/admin/logs") {
      return response(clone(state.admin.logs) as T);
    }

    if (url === "/notifications") {
      return response(clone(state.notifications) as T);
    }

    throw createError(`Unsupported endpoint: ${url}`);
  },

  async post<T>(url: string, body?: unknown, _config?: ResponseConfig): DemoResponse<T> {
    const state = getDemoState();

    if (url === "/auth/login") {
      const payload = body as LoginPayload;
      const username = (payload.userId ?? payload.username ?? payload.email ?? "").trim();
      const password = payload.password ?? "";

      if (username === DEMO_AUTH_CREDENTIALS.username && password === DEMO_AUTH_CREDENTIALS.password) {
        writeSession(state.authUser.id);
        return response({ user: clone(state.authUser), token: "demo-session-token" } as T);
      }

      throw createError("Invalid username or password.");
    }

    if (url === "/auth/logout") {
      clearSession();
      return response({ success: true } as T);
    }

    if (url === "/auth/register") {
      throw createError("Registration is currently unavailable.");
    }

    if (url === "/auth/forgot-password") {
      return response({ message: "Password reset instructions sent." } as T);
    }

    if (url === "/auth/reset-password") {
      return response({ message: "Password updated." } as T);
    }

    if (url === "/auth/2fa/toggle") {
      const enabled = Boolean((body as { enabled?: boolean })?.enabled);
      updateDemoState((draft) => {
        draft.customer.twoFactorEnabled = enabled;
        draft.authUser.twoFactorEnabled = enabled;
      });
      return response({ success: true } as T);
    }

    if (url === "/auth/verify-email") {
      updateDemoState((draft) => {
        draft.authUser.emailVerified = true;
      });
      return response({ success: true } as T);
    }

    if (url === "/transactions/deposit") {
      const payload = body as TransferPayload;
      const account = getAccountById(String(payload.accountId ?? ""));
      if (!account || !payload.amount) {
        throw createError("Invalid deposit request.");
      }

      account.balance = Number((account.balance + Number(payload.amount)).toFixed(2));
      updateDemoState((draft) => {
        if (account.id === "checking") {
          draft.checking.balance = account.balance;
          draft.summary.checkingBalance = account.balance;
        }
        if (account.id === "savings") {
          draft.savings.balance = account.balance;
          draft.summary.savingsBalance = account.balance;
        }
        draft.summary.availableBalance = Number(draft.accounts.reduce((total, entry) => total + Number(entry.balance), 0).toFixed(2));
      });

      addTransaction({
        id: `tx-${Date.now()}`,
        accountId: account.id,
        userId: state.customer.id,
        type: "DEPOSIT",
        direction: "CREDIT",
        amount: Number(payload.amount),
        description: payload.description || "Deposit",
        createdAt: new Date().toISOString(),
        category: "Transfer",
        status: "Completed",
        merchant: "Superior One Credit Union"
      });

      return response({ success: true } as T);
    }

    if (url === "/transactions/withdraw") {
      const payload = body as TransferPayload;
      const account = getAccountById(String(payload.accountId ?? ""));
      if (!account || !payload.amount) {
        throw createError("Invalid withdrawal request.");
      }

      account.balance = Number((account.balance - Number(payload.amount)).toFixed(2));
      updateDemoState((draft) => {
        if (account.id === "checking") {
          draft.checking.balance = account.balance;
          draft.summary.checkingBalance = account.balance;
        }
        if (account.id === "savings") {
          draft.savings.balance = account.balance;
          draft.summary.savingsBalance = account.balance;
        }
        draft.summary.availableBalance = Number(draft.accounts.reduce((total, entry) => total + Number(entry.balance), 0).toFixed(2));
      });

      addTransaction({
        id: `tx-${Date.now()}`,
        accountId: account.id,
        userId: state.customer.id,
        type: "WITHDRAWAL",
        direction: "DEBIT",
        amount: Number(payload.amount),
        description: payload.description || "Withdrawal",
        createdAt: new Date().toISOString(),
        category: "Transfer",
        status: "Completed",
        merchant: "Superior One Credit Union"
      });

      return response({ success: true } as T);
    }

    if (url === "/transactions/transfer") {
      const payload = body as TransferPayload;
      const fromAccountId = String(payload.fromAccountId ?? "");
      const toAccountId = String(payload.toAccountId ?? "");
      const amount = Number(payload.amount ?? 0);

      if (!fromAccountId || !toAccountId || !amount) {
        throw createError("Invalid transfer request.");
      }

      updateBalancesForTransfer(fromAccountId, toAccountId, amount);
      const now = new Date().toISOString();
      const description = payload.description || `Transfer from ${fromAccountId} to ${toAccountId}`;

      addTransaction({
        id: `tx-${Date.now()}-debit`,
        accountId: fromAccountId,
        toAccountId,
        userId: state.customer.id,
        type: "TRANSFER",
        direction: "DEBIT",
        amount,
        description,
        createdAt: now,
        category: "Transfer",
        status: "Completed",
        merchant: "Superior One Transfer"
      });

      addTransaction({
        id: `tx-${Date.now()}-credit`,
        accountId: toAccountId,
        toAccountId: fromAccountId,
        userId: state.customer.id,
        type: "TRANSFER",
        direction: "CREDIT",
        amount,
        description,
        createdAt: now,
        category: "Transfer",
        status: "Completed",
        merchant: "Superior One Transfer"
      });

      return response({ success: true } as T);
    }

    if (url === "/cards/create") {
      updateDemoState((draft) => {
        if (!draft.cards.find((card) => card.id === "card-3")) {
          draft.cards.push({ id: "card-3", last4: "5201", isFrozen: false });
        }
      });
      return response({ success: true } as T);
    }

    const freezeMatch = url.match(/^\/cards\/([^/]+)\/(freeze|unfreeze|replace)$/);
    if (freezeMatch) {
      const [, cardId, action] = freezeMatch;
      updateDemoState((draft) => {
        const card = draft.cards.find((entry) => entry.id === cardId);
        if (!card) {
          return;
        }

        if (action === "freeze") {
          card.isFrozen = true;
        } else if (action === "unfreeze") {
          card.isFrozen = false;
        } else if (action === "replace") {
          card.last4 = String(Math.floor(1000 + Math.random() * 9000));
          card.isFrozen = false;
        }
      });
      return response({ success: true } as T);
    }

    if (url === "/loans/apply") {
      const payload = body as Loan;
      updateDemoState((draft) => {
        draft.loans.unshift({
          id: `loan-${Date.now()}`,
          type: payload.type,
          amount: Number(payload.amount),
          termMonths: Number(payload.termMonths),
          annualRate: Number(payload.annualRate),
          status: "PENDING",
          createdAt: new Date().toISOString(),
          user: clone(draft.authUser)
        });
      });
      return response({ success: true } as T);
    }

    if (url === "/loans/calculator") {
      const payload = body as Loan;
      const result = calculateLoanSchedule(Number(payload.amount), Number(payload.annualRate), Number(payload.termMonths));
      return response({ monthlyPayment: result.monthlyPayment } as T);
    }

    if (url === "/profile/change-password") {
      return response({ success: true } as T);
    }

    if (url === "/profile/upload-photo") {
      updateDemoState((draft) => {
        draft.customer.profileImageUrl = "/demo-profile-avatar.png";
        draft.authUser.profileImageUrl = "/demo-profile-avatar.png";
      });
      return response({ profileImageUrl: "/demo-profile-avatar.png" } as T);
    }

    if (url === "/profile") {
      const payload = body as Partial<{ firstName: string; lastName: string; phone: string }>;
      updateDemoState((draft) => {
        draft.customer.firstName = payload.firstName ?? draft.customer.firstName;
        draft.customer.lastName = payload.lastName ?? draft.customer.lastName;
        draft.customer.phone = payload.phone ?? draft.customer.phone;
        draft.authUser.firstName = payload.firstName ?? draft.authUser.firstName;
        draft.authUser.lastName = payload.lastName ?? draft.authUser.lastName;
        draft.authUser.phone = payload.phone ?? draft.authUser.phone;
      });
      return response({ success: true } as T);
    }

    if (url === "/profile/notifications") {
      const payload = body as { email: boolean; sms: boolean; push: boolean; weeklySummary: boolean };
      updateDemoState((draft) => {
        draft.customer.notificationPreferences = payload;
        draft.authUser.notificationPreferences = payload;
      });
      return response({ success: true } as T);
    }

    const loanStatusMatch = url.match(/^\/admin\/loans\/([^/]+)$/);
    if (loanStatusMatch) {
      const payload = body as { status?: Loan["status"] };
      updateDemoState((draft) => {
        const loan = draft.loans.find((entry) => entry.id === loanStatusMatch[1]);
        if (loan && payload.status) {
          loan.status = payload.status;
        }
      });
      return response({ success: true } as T);
    }

    throw createError(`Unsupported endpoint: ${url}`);
  },

  async put<T>(url: string, body?: unknown, config?: ResponseConfig): DemoResponse<T> {
    return api.post<T>(url, body, config);
  },

  async patch<T>(url: string, body?: unknown, config?: ResponseConfig): DemoResponse<T> {
    return api.post<T>(url, body, config);
  },

  async delete<T>(url: string, _config?: ResponseConfig): DemoResponse<T> {
    if (url === "/auth/logout") {
      clearSession();
      return response({ success: true } as T);
    }

    throw createError(`Unsupported endpoint: ${url}`);
  }
};

export function refreshDemoState() {
  resetDemoState();
}
