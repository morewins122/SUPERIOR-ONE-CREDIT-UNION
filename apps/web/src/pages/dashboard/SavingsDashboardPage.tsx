import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { PiggyBank } from "lucide-react";
import { getDemoState } from "@/data/bankDemoData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function SavingsDashboardPage() {
  const [state, setState] = useState(getDemoState());

  useEffect(() => {
    setState(getDemoState());
  }, []);

  const chartData = useMemo(
    () => ({
      labels: state.savings.monthlySavingsHistory.map((item) => item.month),
      datasets: [
        {
          label: "Monthly Savings",
          data: state.savings.monthlySavingsHistory.map((item) => item.amount),
          borderColor: "#1a7f88",
          backgroundColor: "rgba(26, 127, 136, 0.22)",
          tension: 0.35,
          fill: true
        }
      ]
    }),
    [state.savings.monthlySavingsHistory]
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f5f0] text-[#0f5f57]">
          <PiggyBank size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Savings</h1>
          <p className="text-sm text-slate-500">Savings balance, interest rate, goal progress, and monthly growth history.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Savings Balance</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">${state.savings.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Interest Rate</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{state.savings.interestRate.toFixed(2)}%</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Interest Earned</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">${state.savings.interestEarned.toFixed(2)}</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Savings Goal</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{state.savings.goalName}</p>
          <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-3 rounded-full bg-[#0f5f57]" style={{ width: `${state.savings.goalProgress}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{state.savings.goalProgress}% complete</p>
        </article>
      </div>

      <article className="panel rounded-2xl p-5">
        <h2 className="mb-3 text-xl font-semibold">Monthly Savings History</h2>
        <Line data={chartData} />
      </article>
    </section>
  );
}
