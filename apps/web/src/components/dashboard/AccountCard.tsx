import type { Account } from "@/types";

export function AccountCard({ account }: { account: Account }) {
  const accountTypeLabel = account.type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  const accountName = {
    CHECKING: "Everyday Checking",
    SAVINGS: "Emergency Savings",
    FIXED_DEPOSIT: "12-Month Certificate"
  }[account.type];

  const accountIcon = {
    CHECKING: "fa-solid fa-wallet",
    SAVINGS: "fa-solid fa-piggy-bank",
    FIXED_DEPOSIT: "fa-solid fa-vault"
  }[account.type];

  return (
    <article className="panel bank-hover-lift flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#145A5A]">{accountTypeLabel}</p>
          <h4 className="text-xl font-bold tracking-tight text-slate-900">{accountName}</h4>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Account</p>
            <p className="mt-1 text-sm font-semibold tracking-[0.16em] text-slate-700">{account.accountNumber}</p>
          </div>
        </div>

        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf8f7] text-[#145A5A]">
          <i className={accountIcon} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-6 rounded-[24px] bg-[#f8fbfc] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Available Balance</p>
        <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.01em] tabular-nums text-slate-900 sm:text-xl">
          ${Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </article>
  );
}
