import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const schema = z.object({
  type: z.enum(["PERSONAL", "AUTO", "MORTGAGE"]),
  amount: z.coerce.number().positive(),
  termMonths: z.coerce.number().int().min(6),
  annualRate: z.coerce.number().min(1)
});

type LoanForm = z.infer<typeof schema>;

type Loan = LoanForm & { id: string; status: string; createdAt: string };
type ScheduleEntry = { month: number; principal: number; interest: number; remaining: number };

export function LoansDashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payment, setPayment] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleLoanId, setScheduleLoanId] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoanForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: "PERSONAL", amount: 10000, termMonths: 24, annualRate: 7 }
  });

  const load = async () => {
    const { data } = await api.get<Loan[]>("/loans");
    setLoans(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const apply = async (values: LoanForm) => {
    await api.post("/loans/apply", values);
    reset();
    await load();
  };

  const calculate = async (values: LoanForm) => {
    const { data } = await api.post<{ monthlyPayment: number }>("/loans/calculator", values);
    setPayment(data.monthlyPayment);
  };

  const loadSchedule = async (loanId: string) => {
    const { data } = await api.get<{ schedule: ScheduleEntry[] }>(`/loans/${loanId}/schedule`);
    setScheduleLoanId(loanId);
    setSchedule(data.schedule.slice(0, 12));
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Loans</h1>
      <form className="panel grid gap-3 rounded-2xl p-4 md:grid-cols-4" onSubmit={handleSubmit(apply)}>
        <select className="rounded-xl border border-slate-300 px-3 py-2" {...register("type")}>
          <option value="PERSONAL">Personal</option>
          <option value="AUTO">Auto</option>
          <option value="MORTGAGE">Mortgage</option>
        </select>
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="number" {...register("amount")} placeholder="Amount" />
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="number" {...register("termMonths")} placeholder="Term months" />
        <input className="rounded-xl border border-slate-300 px-3 py-2" type="number" step="0.01" {...register("annualRate")} placeholder="APR" />
        <div className="md:col-span-4 flex gap-2">
          <button type="submit" className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white">Apply</button>
          <button type="button" onClick={handleSubmit(calculate)} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Calculate</button>
        </div>
        {Object.values(errors)[0] && <p className="md:col-span-4 text-xs text-red-500">Please review loan form inputs.</p>}
      </form>

      {payment !== null && <p className="text-sm">Estimated monthly payment: <strong>${payment.toFixed(2)}</strong></p>}

      <div className="space-y-2">
        {loans.map((loan) => (
          <article key={loan.id} className="panel rounded-2xl p-4">
            <p className="text-sm font-semibold">{loan.type} loan - ${Number(loan.amount).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Status: {loan.status} | Term: {loan.termMonths} months | APR: {loan.annualRate}%</p>
            <button
              type="button"
              className="mt-3 rounded-full border border-slate-300 px-3 py-1 text-xs"
              onClick={() => void loadSchedule(loan.id)}
            >
              View Payment Schedule
            </button>
          </article>
        ))}
      </div>

      {scheduleLoanId && (
        <article className="panel rounded-2xl p-4">
          <h2 className="mb-2 text-lg font-semibold">Payment Schedule Preview (First 12 Months)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Month</th>
                  <th className="pb-2">Principal</th>
                  <th className="pb-2">Interest</th>
                  <th className="pb-2">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry) => (
                  <tr key={entry.month} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="py-2">{entry.month}</td>
                    <td className="py-2">${entry.principal.toFixed(2)}</td>
                    <td className="py-2">${entry.interest.toFixed(2)}</td>
                    <td className="py-2">${entry.remaining.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
