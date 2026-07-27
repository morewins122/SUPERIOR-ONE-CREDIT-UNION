import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePortalUX } from "@/context/PortalUXContext";

const items = [
  { to: "/dashboard", label: "Dashboard", iconClass: "fa-solid fa-house", exact: true },
  { to: "/dashboard/checking", label: "Checking", iconClass: "fa-solid fa-wallet" },
  { to: "/dashboard/pay-transfer", label: "Pay & Transfer", iconClass: "fa-solid fa-paper-plane" },
  { to: "/dashboard/statements", label: "Statements", iconClass: "fa-solid fa-file-lines" },
  { to: "/dashboard/profile", label: "Profile", iconClass: "fa-solid fa-user" }
];

export function DashboardNav({ mobileOpen, onNavigate }: { mobileOpen: boolean; onNavigate: () => void }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const { navigatePage, isLoading } = usePortalUX();

  const isActivePath = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  return (
    <nav className={`rounded-[28px] bg-white p-3 shadow-[0_18px_40px_rgba(16,42,67,0.08)] ${mobileOpen ? "block" : "hidden lg:block"}`}>
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        {items.map((item) => (
          <button
            key={item.to}
            type="button"
            disabled={isLoading}
            onClick={() => {
              onNavigate();
              void navigatePage(item.to, { title: item.label, durationMs: 980 });
            }}
            className={`bank-ripple flex min-h-[54px] items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              isActivePath(item.to, item.exact)
                ? "bg-[#145A5A] text-white shadow-lg shadow-[#145A5A26]"
                : "text-slate-600 hover:bg-[#edf8f7] hover:text-[#145A5A]"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-current">
              <i className={item.iconClass} aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="pt-2 lg:ml-auto lg:pt-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await navigatePage("/login?signout=1", { durationMs: 900, message: "Signing out...", title: "Sign On", skeleton: "generic" });
              await logout();
            }}
            className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#145A5A] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0f4747] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-current">
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
