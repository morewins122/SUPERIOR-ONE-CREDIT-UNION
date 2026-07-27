export function april2025TransactionDate(index: number) {
  const date = new Date("2025-04-30T18:00:00.000Z");
  date.setDate(date.getDate() - (index % 30));
  date.setHours(18 - (index % 9), (index * 7) % 60, 0, 0);
  return date;
}

export function normalizeTransactionHistory<T extends { createdAt: Date }>(transactions: T[]) {
  return transactions.map((transaction, index) => ({
    ...transaction,
    createdAt: april2025TransactionDate(index)
  }));
}