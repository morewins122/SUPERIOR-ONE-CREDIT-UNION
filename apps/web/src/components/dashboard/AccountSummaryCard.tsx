import type { Account } from "@/types";

const accountMeta: Record<Account["type"], { label: string; name: string; iconClass: string }> = {
  CHECKING: {
    label: "CHECKING",
    name: "Everyday Checking",
    iconClass: "fa-solid fa-wallet"
  },
  SAVINGS: {
    label: "SAVINGS",
    name: "Rainy Day Savings",
    iconClass: "fa-solid fa-building-columns"
  },
  FIXED_DEPOSIT: {
    label: "FIXED DEPOSIT",
    name: "12-Month Fixed Deposit",
    iconClass: "fa-solid fa-piggy-bank"
  }
};

function extractLastFour(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  return digits.slice(-4).padStart(4, "0");
}

function getNextMaturityDate(createdAt?: string) {
  if (!createdAt) return "N/A";

  const opened = new Date(createdAt);
  const now = new Date();
  const maturity = new Date(now.getFullYear(), opened.getMonth(), opened.getDate());

  if (maturity < now) {
    maturity.setFullYear(maturity.getFullYear() + 1);
  }

  return maturity.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AccountSummaryCard({ account }: { account: Account }) {
  const meta = accountMeta[account.type];
  const balance = Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const maskedNumber = `.... ${extractLastFour(account.accountNumber)}`;
  const isFixedDeposit = account.type === "FIXED_DEPOSIT";

  return (
    <article className="h-full min-h-[220px] rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.05)] transition duration-300 ease-in-out hover:-translate-y-[5px] hover:shadow-[0_12px_26px_rgba(0,0,0,0.10)] sm:p-6">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[#0D5C63]">{meta.label}</p>
            <h3 className="mt-2 text-[1.4rem] font-bold leading-tight text-[#1E293B] sm:mt-3 sm:text-[1.875rem]">{meta.name}</h3>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F5F4] text-[#0D5C63]">
            <i className={meta.iconClass} aria-hidden="true" />
          </span>
        </div>

        <p className="mt-4 text-sm font-medium tracking-[0.04em] text-[#64748B] sm:text-[1.125rem]">{maskedNumber}</p>
        <p className="mt-4 w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold leading-tight tracking-[-0.01em] text-[#16A34A] sm:text-lg sm:text-xl">
          ${balance}
        </p>

        <div className="mt-auto pt-4 sm:pt-5">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#64748B]">{isFixedDeposit ? "Maturity Date" : "Available Balance"}</p>
          <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-[#1E293B]">
            {isFixedDeposit ? getNextMaturityDate(account.createdAt) : `$${balance}`}
          </p>
        </div>
      </div>
    </article>
  );
}