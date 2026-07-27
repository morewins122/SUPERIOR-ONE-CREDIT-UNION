export function VirtualCard({ name, last4, frozen }: { name: string; last4: string; frozen: boolean }) {
  return (
    <div className="bank-card bank-hover-lift flex h-full min-h-52 flex-col justify-between rounded-[24px] p-6 shadow-[0_18px_40px_rgba(16,42,67,0.18)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Virtual Debit</p>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${frozen ? "bg-white/15 text-white" : "bg-emerald-500/20 text-emerald-100"}`}>
          {frozen ? "Frozen" : "Active"}
        </span>
      </div>

      <p className="mt-8 text-3xl tracking-[0.28em] text-white/95">**** **** **** {last4}</p>

      <div className="mt-8 flex items-end justify-between gap-4 text-xs text-cyan-50">
        <div>
          <p className="uppercase tracking-[0.18em] text-cyan-100/80">Cardholder</p>
          <p className="mt-1 text-sm font-semibold text-white">{name}</p>
        </div>
        <div className="h-10 w-16 rounded-xl border border-white/20 bg-white/10" />
      </div>
    </div>
  );
}
