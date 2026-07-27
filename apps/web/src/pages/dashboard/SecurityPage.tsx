import { getDemoState } from "@/data/bankDemoData";

export function SecurityPage() {
  const { security } = getDemoState();
  const visibleAlerts = security.securityAlerts.filter((alert) => alert.title !== "New device verified" && alert.title !== "Large transfer review");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="mt-2 text-sm text-slate-500">Review two-factor protection and alerts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Two-factor Authentication</p>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{security.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
        </article>
        <article className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Security Alerts</p>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{visibleAlerts.length} recent alerts</p>
        </article>
      </div>

      <article className="panel rounded-2xl p-5">
        <h2 className="text-xl font-semibold">Security Alerts</h2>
        {visibleAlerts.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {visibleAlerts.map((alert) => (
              <div key={alert.title} className="rounded-xl bg-[#f4faf8] p-4 dark:bg-slate-900">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-500">{alert.description}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#0f5f57]">{alert.severity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-[#f4faf8] p-4 text-sm text-slate-600">No current security alerts.</p>
        )}
      </article>
    </section>
  );
}
