import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { HomepageLoginPanel } from "@/components/auth/HomepageLoginPanel";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignOutFlow = searchParams.get("signout") === "1";

  useEffect(() => {
    if (token && !isSignOutFlow) {
      navigate("/dashboard.html", { replace: true });
    }
  }, [isSignOutFlow, navigate, token]);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f5f57] via-[#176d63] to-[#0c4e47] p-8 text-white shadow-[0_28px_70px_rgba(14,63,58,0.35)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-[#58b89a]/25 blur-2xl" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
            <ShieldCheck size={14} />
            Member Secure Portal
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight sm:text-[3.1rem]">Access online banking with one secure session.</h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">Manage your checking, savings, transfers, and statements in a protected digital branch experience.</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/80">Monitoring</p>
              <p className="mt-2 text-sm font-semibold">24/7 Fraud Guard</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/80">Coverage</p>
              <p className="mt-2 text-sm font-semibold">FDIC Insured</p>
            </div>
          </div>

          <div className="mt-7 grid gap-4">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-white/75">Service Status</p>
              <p className="mt-3 text-sm font-semibold text-emerald-100">All digital services operational</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-4 shadow-lg">
            <img src="/front-page-logo.svg" alt="One Credit Union" className="mx-auto w-full max-w-[420px] object-contain" />
          </div>
        </div>
      </article>

      <HomepageLoginPanel />
    </section>
  );
}
