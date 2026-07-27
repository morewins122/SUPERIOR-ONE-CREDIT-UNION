export function SavingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Savings Accounts</h1>
      <p className="text-slate-600 dark:text-slate-200">Build confidence with savings tiers and fixed-deposit options.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel rounded-2xl p-5">
          <h3 className="font-semibold">Starter Savings</h3>
          <p className="mt-2 text-sm text-slate-500">No monthly fee, automated transfer tools, and personalized savings goals tracking.</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <h3 className="font-semibold">High-Yield Savings</h3>
          <p className="mt-2 text-sm text-slate-500">Competitive APY and dynamic contribution recommendations.</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <h3 className="font-semibold">Fixed Deposit</h3>
          <p className="mt-2 text-sm text-slate-500">Predictable return simulator with timeline projections.</p>
        </article>
      </div>
    </section>
  );
}
