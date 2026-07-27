export function MortgagePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Mortgage Center</h1>
      <p className="text-slate-600 dark:text-slate-200">Compare fixed and adjustable mortgage options with transparent payment breakdowns.</p>
      <article className="panel rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Mortgage Education Topics</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-200">
          <li>Pre-qualification and affordability</li>
          <li>Principal vs. interest over time</li>
          <li>How term length changes monthly payments</li>
        </ul>
      </article>
    </section>
  );
}
