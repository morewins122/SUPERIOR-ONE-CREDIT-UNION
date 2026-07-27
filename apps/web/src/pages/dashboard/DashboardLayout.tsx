import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RouteSkeleton } from "@/components/dashboard/RouteSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getDemoState } from "@/data/bankDemoData";
import { usePortalUX } from "@/context/PortalUXContext";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const demoState = getDemoState();
  const { navigatePage, isLoading, skeleton, isContentVisible, pageTitle } = usePortalUX();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const navToggleRef = useRef<HTMLButtonElement | null>(null);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : demoState.customer.fullName;
  const memberBadge = "Personal Online Banking";

  const notifications = useMemo(() => demoState.notifications.slice(0, 0), [demoState.notifications]);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target)) {
        setShowNotifications(false);
      }
      if (!profileRef.current?.contains(target)) {
        setShowProfileMenu(false);
      }
      if (mobileNavOpen && !navRef.current?.contains(target) && !navToggleRef.current?.contains(target)) {
        setMobileNavOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    await navigatePage("/login?signout=1", { durationMs: 900, message: "Signing out...", title: "Sign On", skeleton: "generic" });
    await logout();
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#F5F7F8] md:[zoom:1.04] xl:[zoom:1.08]">
      <header className="sticky top-0 z-50 w-full rounded-b-[36px] bg-[#145A5A] px-4 py-5 text-white shadow-[0_24px_60px_rgba(20,90,90,0.24)] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[150px] max-w-7xl flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start justify-between gap-4 lg:flex-col lg:items-start lg:justify-start">
            <div>
              <div>
                <button
                  type="button"
                  onClick={() => void navigatePage("/dashboard.html", { title: "Dashboard", durationMs: 900, skeleton: "dashboard" })}
                  className="text-left text-[1.6rem] font-extrabold tracking-tight transition hover:text-[#d9f2ef] sm:text-3xl lg:text-[2.15rem]"
                  aria-label="Go to Superior One Credit Union dashboard home"
                >
                  Superior One Credit Union
                </button>
                <p className="mt-3 text-sm font-medium tracking-[0.16em] text-white/80">Personal Online Banking</p>
              </div>
            </div>
            <button
              ref={navToggleRef}
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
              onClick={() => setMobileNavOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowNotifications((value) => !value)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60"
                aria-expanded={showNotifications}
                aria-haspopup="menu"
                aria-controls="dashboard-notifications-menu"
              >
                <Bell size={18} />
              </button>

              <div
                id="dashboard-notifications-menu"
                className={`absolute right-0 top-full mt-3 w-[min(92vw,320px)] rounded-[20px] border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl transition-all duration-300 ${
                  showNotifications ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <p className="pb-3 text-sm font-semibold">Notifications</p>
                {notifications.length > 0 ? (
                  <ul className="space-y-3">
                    {notifications.map((notification) => (
                      <li key={notification.id} className="rounded-2xl bg-[#f4faf8] px-3 py-3 text-sm text-slate-700">
                        <p className="font-medium">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl bg-[#f4faf8] px-3 py-3 text-sm text-slate-600">No new notifications.</p>
                )}
              </div>
            </div>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 text-white transition hover:bg-white/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                aria-expanded={showProfileMenu}
                aria-haspopup="menu"
                aria-controls="profile-menu"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#145A5A]">
                  <span className="text-sm font-bold">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-white/70">{memberBadge}</p>
                </div>
                <ChevronDown size={16} className="text-white/80" />
              </button>

              <div
                id="profile-menu"
                className={`absolute right-0 top-full mt-3 w-56 rounded-[20px] border border-slate-200 bg-white p-2 shadow-2xl transition-all duration-300 ${
                  showProfileMenu ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                {[
                  ["My Profile", "/dashboard/profile"],
                  ["Settings", "/dashboard/profile"]
                ].map(([label, to]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      void navigatePage(to, { title: label, durationMs: 1000 });
                    }}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-[#e9f7f6] hover:text-[#145A5A]"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowNotifications(true);
                  }}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-[#e9f7f6] hover:text-[#145A5A]"
                >
                  Messages
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl bg-[#145A5A] px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#0f4747]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleLogout()}
              className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:inline-flex"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div ref={navRef} className="mb-6">
          <DashboardNav mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
        </div>

        <main className="min-w-0 space-y-4">
          <div className="h-8">
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] text-[#145A5A] transition-all duration-300 ease-in-out ${isContentVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
              {pageTitle}
            </p>
          </div>

          <div className={`transition-all duration-300 ease-in-out ${isContentVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
            {isLoading && skeleton ? <RouteSkeleton variant={skeleton} /> : <Outlet />}
          </div>
        </main>
      </div>
    </section>
  );
}
