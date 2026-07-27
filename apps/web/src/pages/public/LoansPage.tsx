const loanProducts = [
  { title: "Personal Loan", rate: "7.25% APR", desc: "Flexible financing for life events and projects." },
  { title: "Auto Loan", rate: "5.10% APR", desc: "Competitive rates for new and used vehicles." },
  { title: "Home Equity", rate: "6.80% APR", desc: "Use your home's equity for major goals and planned expenses." }
];

export function LoansPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold">Loan Products</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-200">Explore lending options tailored for personal, auto, and home financing needs.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {loanProducts.map((loan) => (
          <article key={loan.title} className="panel rounded-2xl p-5">
            <h3 className="text-xl font-semibold">{loan.title}</h3>
            <p className="mt-1 text-sm font-semibold text-ocean">{loan.rate}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">{loan.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
