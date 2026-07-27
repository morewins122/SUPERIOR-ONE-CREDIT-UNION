import { AccountType } from "@prisma/client";

export const accountPrefixes: Record<AccountType, string> = {
  CHECKING: "11",
  SAVINGS: "22",
  FIXED_DEPOSIT: "33"
};

export const makeAccountNumber = (type: AccountType) => {
  const random = Math.floor(10000000 + Math.random() * 89999999).toString();
  return `${accountPrefixes[type]}${random}`;
};
