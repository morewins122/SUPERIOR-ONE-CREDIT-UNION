import { Fragment } from "react";
import type { Transaction } from "@/types";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric"
});

export function TransactionTable({ rows }: { rows: Transaction[] }) {
  let lastMonthLabel = "";

  return (
    <div className="panel overflow-hidden rounded-[28px] p-4 sm:p-5">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] table-fixed text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="w-[15%] pb-3 pr-3">Date</th>
              <th className="w-[40%] pb-3 pr-3">Description</th>
              <th className="w-[12%] pb-3 pr-3">Category</th>
              <th className="w-[12%] pb-3 pr-3 text-right">Amount</th>
              <th className="w-[12%] pb-3 pr-3 text-right">Balance</th>
              <th className="w-[10%] pb-3 pr-3 text-right">Status</th>
              <th className="w-[9%] pb-3 text-right">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => {
              const monthLabel = monthFormatter.format(new Date(tx.createdAt));
              const showMonthLabel = monthLabel !== lastMonthLabel;
              lastMonthLabel = monthLabel;

              return (
                <Fragment key={tx.id}>
                  {showMonthLabel ? (
                    <tr key={`${tx.id}-month`}>
                      <td colSpan={5} className="py-4 pr-3 pt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#145A5A]">
                        {monthLabel}
                      </td>
                    </tr>
                  ) : null}
                  <tr key={tx.id} className="border-t border-slate-200/80 transition hover:bg-[#f8fbfc]">
                    <td className="break-words py-4 pr-3 align-top text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                    </td>
                    <td className="break-words py-3 pr-3 align-top">
                      <div className="font-semibold text-slate-900">{tx.description ?? "-"}</div>
                      {tx.merchant ? <div className="mt-1 text-xs text-slate-500">{tx.merchant}</div> : null}
                    </td>
                    <td className="break-words py-4 pr-3 align-top text-slate-600">{tx.category ?? "-"}</td>
                    <td className={`break-words py-4 pr-3 align-top text-right font-semibold ${tx.direction === "DEBIT" ? "text-red-500" : "text-emerald-600"}`}>
                      {tx.direction === "DEBIT" ? "-" : "+"}${Number(tx.amount).toFixed(2)}
                    </td>
                    <td className={`break-words py-4 pr-3 align-top text-right font-semibold ${Number(tx.balance ?? 0) >= 0 ? "text-slate-900" : "text-red-500"}`}>
                      ${Number(tx.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="break-words py-4 pr-3 align-top text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          tx.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : tx.status === "Processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-[#e7f5f0] text-[#0f5c57]"
                        }`}
                      >
                        {tx.status ?? "Completed"}
                      </span>
                    </td>
                    <td className="break-words py-4 text-right text-xs font-semibold tracking-[0.12em] text-slate-600">{tx.transactionId ?? tx.id}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
