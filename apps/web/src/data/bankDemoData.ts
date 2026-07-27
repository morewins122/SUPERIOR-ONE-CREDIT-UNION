import type { Account, AuditLog, Loan, Transaction, User } from "@/types";

type Notification = {
  id: string;
  message: string;
  time: string;
};

type DemoCard = {
  id: string;
  last4: string;
  isFrozen: boolean;
};

type DemoPayee = {
  name: string;
  balanceHint: string;
};

type DemoSecurity = {
  lastLogin: string;
  twoFactorEnabled: boolean;
  deviceHistory: Array<{ device: string; location: string; time: string }>;
  securityAlerts: Array<{ title: string; description: string; severity: "Low" | "Medium" | "High" }>;
  recentSignIns: Array<{ device: string; location: string; time: string; status: string }>;
};

type DemoState = {
  auth: {
    credentials: { username: string; password: string };
    sessionKey: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    preferredName: string;
    fullName: string;
    memberSince: string;
    customerId: string;
    phone: string;
    email: string;
    address: string[];
    profileImageUrl: string | null;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
      weeklySummary: boolean;
    };
    lastLogin: string;
    twoFactorEnabled: boolean;
  };
  authUser: User;
  summary: {
    availableBalance: number;
    rewardsPoints: number;
    checkingBalance: number;
    savingsBalance: number;
  };
  checking: {
    accountNumber: string;
    routingNumber: string;
    balance: number;
    debitCard: string;
  };
  savings: {
    balance: number;
    interestRate: number;
    interestEarned: number;
    goalName: string;
    goalProgress: number;
    monthlySavingsHistory: Array<{ month: string; amount: number }>;
  };
  accounts: Account[];
  cards: DemoCard[];
  payees: DemoPayee[];
  notifications: Notification[];
  security: DemoSecurity;
  transactions: Transaction[];
  loans: Loan[];
  statements: {
    checking: Transaction[];
    savings: Transaction[];
  };
  admin: {
    users: User[];
    logs: AuditLog[];
  };
};

export const DEMO_AUTH_CREDENTIALS = {
  username: "jason122z",
  password: "soldier1986"
} as const;

const openingBalance = 24500.0;
const targetAvailableBalance = 1046288.28;

type TransactionSeed = {
  date: string;
  transactionId: string;
  accountId: "checking" | "savings";
  toAccountId?: string | null;
  type: Transaction["type"];
  direction: Transaction["direction"];
  amount: number;
  description: string;
  category: string;
  status: NonNullable<Transaction["status"]>;
  merchant: string;
};

type TemplateSeed = Omit<TransactionSeed, "date" | "transactionId" | "status">;
type YearPlan = { year: number; count: number };

const transactionTemplates: TemplateSeed[] = [
  { accountId: "checking", type: "DIRECT_DEPOSIT", direction: "CREDIT", amount: 4850, description: "Payroll Deposit", category: "Salary", merchant: "Superior One Payroll" },
  { accountId: "checking", type: "DIRECT_DEPOSIT", direction: "CREDIT", amount: 4325, description: "Employer Direct Deposit", category: "Salary", merchant: "ACME Logistics" },
  { accountId: "checking", type: "WITHDRAWAL", direction: "DEBIT", amount: 100, description: "ATM Withdrawal", category: "Banking", merchant: "Superior One ATM" },
  { accountId: "checking", type: "DEPOSIT", direction: "CREDIT", amount: 650, description: "Cash Deposit", category: "Banking", merchant: "Superior One Branch" },
  { accountId: "checking", type: "WITHDRAWAL", direction: "DEBIT", amount: 85, description: "Cash Withdrawal", category: "Banking", merchant: "Superior One ATM" },
  { accountId: "checking", type: "DEPOSIT", direction: "CREDIT", amount: 2300, description: "Mobile Check Deposit", category: "Income", merchant: "Employer Check" },
  { accountId: "checking", type: "DEPOSIT", direction: "CREDIT", amount: 1820, description: "ACH Credit", category: "Income", merchant: "ACME Corp" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 135, description: "ACH Debit", category: "Utilities", merchant: "Spectrum" },
  { accountId: "checking", type: "TRANSFER", direction: "CREDIT", amount: 175, description: "Zelle Received", category: "Transfer", merchant: "Zelle" },
  { accountId: "checking", type: "TRANSFER", direction: "DEBIT", amount: 200, description: "Zelle Sent", category: "Transfer", merchant: "Zelle" },
  { accountId: "checking", type: "TRANSFER", direction: "DEBIT", amount: 1200, description: "Wire Transfer", category: "Banking", merchant: "Wire Transfer" },
  { accountId: "checking", type: "TRANSFER", direction: "DEBIT", amount: 500, description: "Internal Transfer", category: "Transfer", merchant: "Internal Transfer" },
  { accountId: "checking", type: "TRANSFER", direction: "DEBIT", amount: 450, description: "Transfer to Savings", category: "Transfer", merchant: "Internal Transfer" },
  { accountId: "savings", type: "TRANSFER", direction: "CREDIT", amount: 450, description: "Transfer from Savings", category: "Transfer", merchant: "Internal Transfer" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 1475.6, description: "Mortgage Payment", category: "Mortgage", merchant: "Mortgage Servicer" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 1650, description: "Rent Payment", category: "Mortgage", merchant: "Property Management" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 345, description: "Car Payment", category: "Banking", merchant: "Auto Finance" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 186.42, description: "Insurance Payment", category: "Insurance", merchant: "State Farm" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 138.77, description: "Electric Bill", category: "Utilities", merchant: "AEP Ohio" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 48.12, description: "Water Bill", category: "Utilities", merchant: "Columbus Water" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 62.94, description: "Gas Bill", category: "Utilities", merchant: "Columbia Gas" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 129.99, description: "Internet Bill", category: "Utilities", merchant: "Spectrum" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 89.0, description: "Phone Bill", category: "Utilities", merchant: "Verizon" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 18.99, description: "Netflix", category: "Entertainment", merchant: "Netflix" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 19.99, description: "Spotify", category: "Entertainment", merchant: "Spotify" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 29.95, description: "Apple Services", category: "Entertainment", merchant: "Apple" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 8.99, description: "Google Play", category: "Entertainment", merchant: "Google" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 83.49, description: "Amazon Marketplace", category: "Shopping", merchant: "Amazon" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 14.99, description: "Amazon Prime", category: "Shopping", merchant: "Amazon" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 117.83, description: "Walmart", category: "Groceries", merchant: "Walmart" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 74.28, description: "Target", category: "Shopping", merchant: "Target" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 214.33, description: "Costco", category: "Groceries", merchant: "Costco Wholesale" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 92.41, description: "Home Depot", category: "Shopping", merchant: "Home Depot" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 68.75, description: "Lowe's", category: "Shopping", merchant: "Lowe's" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 36.72, description: "CVS Pharmacy", category: "Healthcare", merchant: "CVS Pharmacy" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 21.16, description: "Walgreens", category: "Healthcare", merchant: "Walgreens" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 8.45, description: "Starbucks", category: "Dining", merchant: "Starbucks" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 11.68, description: "McDonald's", category: "Dining", merchant: "McDonald's" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 13.45, description: "Subway", category: "Dining", merchant: "Subway" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 17.92, description: "Chipotle", category: "Dining", merchant: "Chipotle" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 19.55, description: "Panera Bread", category: "Dining", merchant: "Panera Bread" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 54.18, description: "Shell", category: "Fuel", merchant: "Shell" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 47.32, description: "BP", category: "Fuel", merchant: "BP" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 51.09, description: "Exxon", category: "Fuel", merchant: "Exxon" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 56.83, description: "Chevron", category: "Fuel", merchant: "Chevron" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 24.6, description: "Uber", category: "Travel", merchant: "Uber" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 31.44, description: "Lyft", category: "Travel", merchant: "Lyft" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 412.88, description: "Airbnb", category: "Travel", merchant: "Airbnb" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 482.74, description: "Delta Airlines", category: "Travel", merchant: "Delta Airlines" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 389.52, description: "American Airlines", category: "Travel", merchant: "American Airlines" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 366.12, description: "Southwest Airlines", category: "Travel", merchant: "Southwest Airlines" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 246.88, description: "Hotel Booking", category: "Travel", merchant: "Marriott" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 92.3, description: "Medical Payment", category: "Healthcare", merchant: "OhioHealth" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 74.1, description: "Dental Office", category: "Healthcare", merchant: "Downtown Dental" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 58.4, description: "Vision Center", category: "Healthcare", merchant: "Visionworks" },
  { accountId: "checking", type: "DEPOSIT", direction: "CREDIT", amount: 845.0, description: "Tax Refund", category: "Taxes", merchant: "IRS" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 920.0, description: "IRS Payment", category: "Taxes", merchant: "IRS" },
  { accountId: "savings", type: "INTEREST", direction: "CREDIT", amount: 12.84, description: "Interest Earned", category: "Income", merchant: "Superior One Savings" },
  { accountId: "savings", type: "DEPOSIT", direction: "CREDIT", amount: 28.54, description: "Dividend Deposit", category: "Investment", merchant: "Brokerage Sweep" },
  { accountId: "savings", type: "INTEREST", direction: "CREDIT", amount: 13.08, description: "Savings Interest", category: "Income", merchant: "Superior One Savings" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 63.92, description: "Online Purchase", category: "Shopping", merchant: "Online Store" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 79.26, description: "POS Purchase", category: "Shopping", merchant: "Retail POS" },
  { accountId: "checking", type: "CARD_PAYMENT", direction: "DEBIT", amount: 44.18, description: "Debit Card Purchase", category: "Shopping", merchant: "Debit Network" },
  { accountId: "checking", type: "PAYMENT", direction: "DEBIT", amount: 14.99, description: "Recurring Subscription", category: "Subscription", merchant: "Streaming Service" }
];

const yearPlans: YearPlan[] = [
  { year: 2018, count: 11 },
  { year: 2019, count: 9 },
  { year: 2020, count: 13 },
  { year: 2021, count: 20 },
  { year: 2022, count: 27 },
  { year: 2023, count: 38 },
  { year: 2024, count: 47 },
  { year: 2025, count: 43 }
];

const monthDaySlots: Array<[number, number]> = [
  [1, 4], [1, 19], [2, 3], [2, 17], [3, 6], [3, 21],
  [4, 2], [4, 16], [5, 1], [5, 15], [6, 5], [6, 20],
  [7, 3], [7, 18], [8, 7], [8, 22], [9, 4], [9, 19],
  [10, 6], [10, 21], [11, 5], [11, 20], [12, 2], [12, 18]
];

const monthDaySlots2025: Array<[number, number]> = [
  [1, 3], [1, 8], [1, 14], [1, 19], [1, 24], [1, 29],
  [2, 3], [2, 8], [2, 13], [2, 18], [2, 23], [2, 27],
  [3, 4], [3, 9], [3, 14], [3, 19], [3, 24], [3, 29],
  [4, 3], [4, 8], [4, 11], [4, 16], [4, 20], [4, 24], [4, 28]
];

const maxTransactionDate = new Date("2025-04-30T23:59:59.999Z");

const requiredDepositTotal = 1043126.0;

const curatedDepositSeeds: Array<
  Omit<TransactionSeed, "transactionId" | "status"> & {
    seedId: number;
  }
> = [
  {
    seedId: 1,
    date: "2018-02-12T15:21:00.000Z",
    accountId: "checking",
    type: "DIRECT_DEPOSIT",
    direction: "CREDIT",
    amount: 75000.0,
    description: "Payroll Direct Deposit",
    category: "Income",
    merchant: "Buckeye Manufacturing"
  },
  {
    seedId: 2,
    date: "2018-09-21T14:08:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 48250.0,
    description: "Mobile Check Deposit",
    category: "Deposit",
    merchant: "Regional Client Payment"
  },
  {
    seedId: 3,
    date: "2019-04-10T13:34:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 120000.0,
    description: "ACH Credit",
    category: "Income",
    merchant: "Midwest Contracting Group"
  },
  {
    seedId: 4,
    date: "2020-01-24T16:15:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 32500.0,
    description: "Cash Deposit",
    category: "Deposit",
    merchant: "Superior One Branch Teller"
  },
  {
    seedId: 5,
    date: "2020-11-06T17:02:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 95000.0,
    description: "Business Income Deposit",
    category: "Income",
    merchant: "Jason Property Services LLC"
  },
  {
    seedId: 6,
    date: "2021-03-19T15:09:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 150000.0,
    description: "Tax Refund",
    category: "Income",
    merchant: "U.S. Treasury"
  },
  {
    seedId: 7,
    date: "2022-06-03T14:28:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 68750.0,
    description: "Investment Distribution",
    category: "Income",
    merchant: "Vanguard Brokerage"
  },
  {
    seedId: 8,
    date: "2022-12-15T16:44:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 80000.0,
    description: "Bonus Deposit",
    category: "Income",
    merchant: "Buckeye Manufacturing"
  },
  {
    seedId: 9,
    date: "2023-08-11T18:12:00.000Z",
    accountId: "checking",
    type: "TRANSFER",
    direction: "CREDIT",
    amount: 52626.0,
    description: "Wire Transfer Received",
    category: "Deposit",
    merchant: "First National Escrow"
  },
  {
    seedId: 10,
    date: "2024-02-23T14:52:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 110000.0,
    description: "Insurance Claim Deposit",
    category: "Deposit",
    merchant: "State Farm Claims"
  },
  {
    seedId: 11,
    date: "2024-10-04T13:47:00.000Z",
    accountId: "checking",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 65000.0,
    description: "Settlement Deposit",
    category: "Deposit",
    merchant: "Franklin Legal Settlement Trust"
  },
  {
    seedId: 12,
    date: "2025-04-24T15:36:00.000Z",
    accountId: "checking",
    type: "DIRECT_DEPOSIT",
    direction: "CREDIT",
    amount: 146000.0,
    description: "Employer Direct Deposit",
    category: "Income",
    merchant: "Buckeye Manufacturing"
  }
];

function createTransactionId(date: Date, index: number) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = String(1000 + ((date.getFullYear() * 13 + index * 17) % 9000)).padStart(4, "0");
  return `TXN-${year}${month}${day}-${suffix}`;
}

function createDateForYear(year: number, slotIndex: number, yearIndex: number) {
  const slots = year === 2025 ? monthDaySlots2025 : monthDaySlots;
  const slotPointer = year === 2025 ? slotIndex : slotIndex + yearIndex;
  const [month, day] = slots[slotPointer % slots.length];
  return new Date(Date.UTC(year, month - 1, day, 9 + ((slotIndex + yearIndex) % 6), ((slotIndex * 13) + yearIndex * 7) % 60, 0)).toISOString();
}

function buildTransactionHistory(startingBalance: number) {
  const seeds: TransactionSeed[] = [];
  const recurringNonDepositTemplates = transactionTemplates.filter(
    (template) => template.direction === "DEBIT" || template.type === "TRANSFER"
  );

  yearPlans.forEach((yearPlan, yearIndex) => {
    for (let index = 0; index < yearPlan.count; index += 1) {
      const template = recurringNonDepositTemplates[(yearIndex * 11 + index) % recurringNonDepositTemplates.length];
      const date = createDateForYear(yearPlan.year, index, yearIndex);
      const amountMultiplier = 1 + yearIndex * 0.018 + (index % 5) * 0.01;
      const amount = Number((template.amount * amountMultiplier).toFixed(2));

      seeds.push({
        ...template,
        date,
        transactionId: createTransactionId(new Date(date), yearIndex * 100 + index),
        amount,
        status: "Completed"
      });
    }
  });

  const curatedDepositTotal = Number(
    curatedDepositSeeds.reduce((total, deposit) => total + deposit.amount, 0).toFixed(2)
  );

  if (curatedDepositTotal !== requiredDepositTotal) {
    throw new Error(`Curated deposit total must equal ${requiredDepositTotal.toFixed(2)}.`);
  }

  curatedDepositSeeds.forEach((deposit) => {
    const depositDate = new Date(deposit.date);
    seeds.push({
      ...deposit,
      transactionId: createTransactionId(depositDate, 9000 + deposit.seedId),
      status: "Completed"
    });
  });

  const hasFutureDate = seeds.some((seed) => new Date(seed.date).getTime() > maxTransactionDate.getTime());
  if (hasFutureDate) {
    throw new Error("Transaction seed date cannot exceed April 2025.");
  }

  const chronological = [...seeds].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
  let balance = startingBalance;

  const rows: Transaction[] = chronological.map((seed) => {
    balance = Number((balance + (seed.direction === "CREDIT" ? seed.amount : -seed.amount)).toFixed(2));

    return {
      id: seed.transactionId,
      transactionId: seed.transactionId,
      accountId: seed.accountId,
      toAccountId: seed.toAccountId ?? null,
      userId: "demo-user",
      type: seed.type,
      direction: seed.direction,
      amount: Number(seed.amount.toFixed(2)),
      balance,
      description: seed.description,
      createdAt: seed.date,
      category: seed.category,
      status: "Completed",
      merchant: seed.merchant
    };
  });

  return rows.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

const transactions = buildTransactionHistory(openingBalance);
const checkingTransactions = transactions;
const savingsTransactions = checkingTransactions.filter((transaction) => transaction.accountId === "savings");

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const defaultState: DemoState = {
  auth: {
    credentials: { ...DEMO_AUTH_CREDENTIALS },
    sessionKey: "superior-one-demo-session"
  },
  customer: {
    id: "demo-user",
    firstName: "Philips",
    lastName: "Jason",
    preferredName: "Philips",
    fullName: "Philips Jason",
    memberSince: "2016",
    customerId: "SOCU-104578",
    phone: "(614) 555-****",
    email: "jasonphilips1238@email.com",
    address: ["742 Maple Street", "Columbus, OH"],
    profileImageUrl: null,
    notificationPreferences: { email: true, sms: false, push: true, weeklySummary: true },
    lastLogin: "April 24, 2025 at 8:12 AM",
    twoFactorEnabled: true
  },
  authUser: {
    id: "demo-user",
    firstName: "Philips",
    lastName: "Jason",
    email: "jason122z",
    role: "USER",
    emailVerified: true,
    twoFactorEnabled: true,
    phone: "(614) 555-****",
    profileImageUrl: null,
    notificationPreferences: { email: true, sms: false, push: true, weeklySummary: true }
  },
  summary: {
    availableBalance: targetAvailableBalance,
    rewardsPoints: 2845,
    checkingBalance: targetAvailableBalance,
    savingsBalance: 215635
  },
  checking: {
    accountNumber: "**** 3487",
    routingNumber: "**** 1024",
    balance: targetAvailableBalance,
    debitCard: "**** **** **** 4832"
  },
  savings: {
    balance: 215635,
    interestRate: 3.85,
    interestEarned: 96.4,
    goalName: "Emergency Fund",
    goalProgress: 82,
    monthlySavingsHistory: [
      { month: "Jan", amount: 1850 },
      { month: "Feb", amount: 2125 },
      { month: "Mar", amount: 2400 },
      { month: "Apr", amount: 2675 },
      { month: "May", amount: 2890 },
      { month: "Jun", amount: 3150 }
    ]
  },
  accounts: [
    {
      id: "checking",
      type: "CHECKING",
      accountNumber: "**** 3487",
      balance: targetAvailableBalance,
      userId: "demo-user",
      createdAt: "2016-03-08T00:00:00.000Z",
      user: { id: "demo-user", firstName: "Philips", lastName: "Jason", email: "jason122z" }
    },
    {
      id: "savings",
      type: "SAVINGS",
      accountNumber: "**** 9134",
      balance: 215635,
      userId: "demo-user",
      createdAt: "2017-05-14T00:00:00.000Z",
      user: { id: "demo-user", firstName: "Philips", lastName: "Jason", email: "jason122z" }
    },
    {
      id: "deposit",
      type: "FIXED_DEPOSIT",
      accountNumber: "**** 5509",
      balance: 30000.28,
      userId: "demo-user",
      createdAt: "2019-02-20T00:00:00.000Z",
      user: { id: "demo-user", firstName: "Philips", lastName: "Jason", email: "jason122z" }
    }
  ],
  cards: [
    { id: "card-1", last4: "4832", isFrozen: false },
    { id: "card-2", last4: "7714", isFrozen: true }
  ],
  payees: [
    { name: "Electric Company", balanceHint: "$142.77 due soon" },
    { name: "Internet Provider", balanceHint: "$95.00 monthly" },
    { name: "Water Utility", balanceHint: "$48.12 due soon" },
    { name: "Phone Bill", balanceHint: "$89.00 monthly" },
    { name: "Credit Card", balanceHint: "$300.00 statement balance" }
  ],
  notifications: [
    { id: "n1", message: "Payroll deposited.", time: "2 minutes ago" },
    { id: "n2", message: "Transfer completed.", time: "18 minutes ago" },
    { id: "n3", message: "Statement available.", time: "Today" },
    { id: "n4", message: "Savings interest added.", time: "Yesterday" }
  ],
  security: {
    lastLogin: "April 24, 2025 at 8:12 AM from Columbus, OH",
    twoFactorEnabled: true,
    deviceHistory: [
      { device: "MacBook Pro", location: "Columbus, OH", time: "Today, 8:12 AM" },
      { device: "iPhone 15", location: "Columbus, OH", time: "Yesterday, 6:28 PM" },
      { device: "Windows PC", location: "Cleveland, OH", time: "April 22, 2025" }
    ],
    securityAlerts: [
      { title: "New device verified", description: "Your MacBook Pro was added successfully.", severity: "Low" },
      { title: "Large transfer review", description: "A transfer larger than usual was reviewed and approved.", severity: "Medium" }
    ],
    recentSignIns: [
      { device: "Chrome on MacBook Pro", location: "Columbus, OH", time: "Today, 8:12 AM", status: "Verified" },
      { device: "Safari on iPhone", location: "Columbus, OH", time: "Yesterday, 6:28 PM", status: "Verified" },
      { device: "Edge on Windows", location: "Cleveland, OH", time: "April 22, 2025", status: "Verified" }
    ]
  },
  transactions: checkingTransactions,
  loans: [
    { id: "loan-1", type: "PERSONAL", amount: 12500, termMonths: 36, annualRate: 7.25, status: "ACTIVE", createdAt: "2025-11-03T00:00:00.000Z", user: { id: "demo-user", firstName: "Philips", lastName: "Jason", email: "jason122z" } },
    { id: "loan-2", type: "AUTO", amount: 28900, termMonths: 60, annualRate: 5.1, status: "APPROVED", createdAt: "2025-01-18T00:00:00.000Z", user: { id: "demo-user", firstName: "Philips", lastName: "Jason", email: "jason122z" } }
  ],
  statements: {
    checking: checkingTransactions.slice(0, 18),
    savings: savingsTransactions
  },
  admin: {
    users: [
      { ...defaultStateUserTemplate("demo-user", "Philips", "Jason", "jason122z") },
      { ...defaultStateUserTemplate("admin-user", "Admin", "User", "admin@superioronecu.com", "ADMIN") }
    ],
    logs: [
      { id: "log-1", action: "LOGIN", entity: "AUTH", userId: "demo-user", createdAt: daysAgo(1) },
      { id: "log-2", action: "TRANSFER", entity: "TRANSACTION", userId: "demo-user", createdAt: daysAgo(2) },
      { id: "log-3", action: "PROFILE_UPDATE", entity: "PROFILE", userId: "demo-user", createdAt: daysAgo(3) }
    ]
  }
};

function defaultStateUserTemplate(id: string, firstName: string, lastName: string, email: string, role: User["role"] = "USER"): User {
  return {
    id,
    firstName,
    lastName,
    email,
    role,
    emailVerified: true,
    twoFactorEnabled: true,
    phone: "(614) 555-****",
    profileImageUrl: null,
    notificationPreferences: { email: true, sms: false, push: true, weeklySummary: true }
  };
}

const STORAGE_KEY = "superior-one-demo-state";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function normalizePhilipsName(stateToNormalize: DemoState) {
  stateToNormalize.customer.firstName = "Philips";
  stateToNormalize.customer.preferredName = "Philips";
  stateToNormalize.customer.fullName = "Philips Jason";
  stateToNormalize.authUser.firstName = "Philips";

  stateToNormalize.accounts.forEach((account) => {
    if (account.user) {
      account.user.firstName = "Philips";
    }
  });

  stateToNormalize.loans.forEach((loan) => {
    if (loan.user) {
      loan.user.firstName = "Philips";
    }
  });

  stateToNormalize.admin.users = stateToNormalize.admin.users.map((user) =>
    user.id === "demo-user" ? { ...user, firstName: "Philips" } : user
  );

  return stateToNormalize;
}

function normalizeDemoState(stateToNormalize: DemoState) {
  stateToNormalize = normalizePhilipsName(stateToNormalize);
  stateToNormalize.transactions = clone(checkingTransactions);
  stateToNormalize.statements.checking = stateToNormalize.transactions.filter((transaction) => transaction.accountId === "checking").slice(0, 18);
  stateToNormalize.statements.savings = stateToNormalize.transactions.filter((transaction) => transaction.accountId === "savings").slice(0, 18);
  stateToNormalize.summary.availableBalance = targetAvailableBalance;
  stateToNormalize.summary.checkingBalance = targetAvailableBalance;
  stateToNormalize.checking.balance = targetAvailableBalance;
  return stateToNormalize;
}

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return normalizeDemoState(clone(defaultState));
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeDemoState(clone(defaultState));
  }

  try {
    return normalizeDemoState(JSON.parse(raw) as DemoState);
  } catch {
    return normalizeDemoState(clone(defaultState));
  }
}

let state = loadState();

function saveState() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function getDemoState() {
  return state;
}

export function resetDemoState() {
  state = normalizeDemoState(clone(defaultState));
  saveState();
}

export function updateDemoState(mutator: (draft: DemoState) => void) {
  mutator(state);
  saveState();
}

export function createPdfBlob() {
  const content = `Superior One Credit Union\nStatement export\n\nThis is a banking portal export.`;
  return new Blob([content], { type: "application/pdf" });
}

export function createCsvBlob(rows: Transaction[]) {
  const header = "Date,Description,Category,Amount,Balance,Status,Transaction ID,Type\n";
  const lines = rows
    .map(
      (row) =>
        `${row.createdAt},${row.description ?? ""},${row.category ?? ""},${row.amount},${row.balance ?? ""},${row.status ?? ""},${row.transactionId ?? row.id},${row.type}`
    )
    .join("\n");
  return new Blob([header + lines], { type: "text/csv" });
}

export function matchTransactionSearch(transaction: Transaction, search?: string) {
  if (!search) {
    return true;
  }

  const term = search.toLowerCase();
  return [transaction.description, transaction.category, transaction.merchant, transaction.type, transaction.status]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(term));
}

export function filterTransactions(transactions: Transaction[], params?: Record<string, string>) {
  const filtered = transactions.filter((transaction) => {
    if (!matchTransactionSearch(transaction, params?.search)) {
      return false;
    }

    if (params?.category && params.category !== "All" && transaction.category !== params.category) {
      return false;
    }

    if (params?.status && params.status !== "All" && transaction.status !== params.status) {
      return false;
    }

    if (params?.startDate) {
      const start = new Date(params.startDate).getTime();
      if (new Date(transaction.createdAt).getTime() < start) {
        return false;
      }
    }

    if (params?.endDate) {
      const end = new Date(params.endDate).getTime();
      if (new Date(transaction.createdAt).getTime() > end) {
        return false;
      }
    }

    if (params?.amount && Number(params.amount) > 0 && Number(transaction.amount) < Number(params.amount)) {
      return false;
    }

    return true;
  });

  const sort = params?.sort ?? "newest";
  return filtered.sort((left, right) => {
    switch (sort) {
      case "oldest":
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      case "highest":
        return Number(right.amount) - Number(left.amount);
      case "lowest":
        return Number(left.amount) - Number(right.amount);
      default:
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }
  });
}

export type { DemoState, DemoCard, DemoPayee, Notification, DemoSecurity };
export const bankData = defaultState;
