export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  phone?: string;
  profileImageUrl?: string | null;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    weeklySummary: boolean;
  };
};

export type Account = {
  id: string;
  type: "CHECKING" | "SAVINGS" | "FIXED_DEPOSIT";
  accountNumber: string;
  balance: number;
  userId?: string;
  createdAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type Transaction = {
  id: string;
  transactionId?: string;
  accountId?: string;
  toAccountId?: string | null;
  userId?: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "CARD_PAYMENT" | "PAYMENT" | "INTEREST" | "DIRECT_DEPOSIT";
  direction: "CREDIT" | "DEBIT";
  amount: number;
  balance?: number;
  description?: string;
  createdAt: string;
  category?: string;
  status?: "Completed" | "Pending" | "Processing" | "Scheduled" | "Failed";
  merchant?: string;
};

export type Loan = {
  id: string;
  type: "PERSONAL" | "AUTO" | "MORTGAGE";
  amount: number;
  termMonths: number;
  annualRate: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "CLOSED";
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type AuditLog = {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  createdAt: string;
};
