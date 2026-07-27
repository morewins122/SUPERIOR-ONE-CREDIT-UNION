import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Globe, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePortalUX } from "@/context/PortalUXContext";
import { ThemeToggle } from "./ThemeToggle";

type OhioBranch = {
  city: string;
  shortCity: string;
  locationLabel: string;
};

const ohioBranches: OhioBranch[] = [
  { city: "Columbus, Ohio", shortCity: "Columbus", locationLabel: "Downtown Columbus Branch" },
  { city: "Cleveland, Ohio", shortCity: "Cleveland", locationLabel: "Cleveland Financial District Branch" },
  { city: "Cincinnati, Ohio", shortCity: "Cincinnati", locationLabel: "Central Cincinnati Branch" },
  { city: "Toledo, Ohio", shortCity: "Toledo", locationLabel: "Downtown Toledo Branch" },
  { city: "Akron, Ohio", shortCity: "Akron", locationLabel: "Akron Main Branch" }
];

export function Navbar() {
  const [showPromo, setShowPromo] = useState(true);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const { user, logout } = useAuth();
  const { navigatePage, isLoading } = usePortalUX();
  const branchMenuId = useId();
  const branchMenuRef = useRef<HTMLDivElement | null>(null);

  const filteredBranches = useMemo(
    () =>
      ohioBranches.filter((branch) => {
        const query = branchSearch.trim().toLowerCase();
        if (!query) {
          return true;
        }

        return `${branch.city} ${branch.locationLabel}`.toLowerCase().includes(query);
      }),
    [branchSearch]
  );

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!branchMenuRef.current?.contains(event.target as Node)) {
        setIsBranchMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBranchMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openBranch = (cityName: string) => {
    // Replace with branch locator navigation once branch pages are connected.
    // eslint-disable-next-line no-console
    console.log(`openBranch(${JSON.stringify(cityName)})`);
    setIsBranchMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center text-slate-900 dark:text-white">
            <div className="leading-tight">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0f5f57]">Superior One Credit Union</p>
              <p className="text-xs text-slate-500">Member FDIC</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div ref={branchMenuRef} className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0f5f57] focus:outline-none focus:ring-2 focus:ring-[#0f5f57] dark:text-slate-200 dark:hover:bg-slate-900"
                aria-expanded={isBranchMenuOpen}
                aria-haspopup="menu"
                aria-controls={branchMenuId}
                onClick={() => setIsBranchMenuOpen((value) => !value)}
              >
                <MapPin size={16} />
                <span className="hidden sm:inline">Find a Branch/ATM</span>
              </button>

              <div
                id={branchMenuId}
                role="menu"
                aria-label="Find a Branch or ATM"
                className={`absolute right-0 top-full mt-2 w-[min(92vw,380px)] max-w-[380px] origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-100 transition-all duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-900 ${
                  isBranchMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <p className="px-1 pb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Find a Branch or ATM</p>

                <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <input
                    type="text"
                    value={branchSearch}
                    onChange={(event) => setBranchSearch(event.target.value)}
                    placeholder="Search Ohio branches..."
                    className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    aria-label="Search Ohio branches"
                  />
                </div>

                <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch) => (
                      <li key={branch.city}>
                        <div className="rounded-xl border-l-2 border-transparent p-3 transition duration-200 hover:border-[#0f5f57] hover:bg-[#e7f5f0] dark:hover:bg-slate-900/80">
                          <button
                            type="button"
                            className="flex w-full items-start gap-2 text-left"
                            role="menuitem"
                            onClick={() => openBranch(branch.shortCity)}
                          >
                            <MapPin size={14} className="mt-1 shrink-0 text-[#0f5f57]" />
                            <span>
                              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{branch.city}</span>
                              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{branch.locationLabel}</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="mt-3 rounded-full bg-[#0f5f57] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0c4f48] focus:outline-none focus:ring-2 focus:ring-[#0f5f57]"
                            role="menuitem"
                            onClick={() => openBranch(branch.shortCity)}
                          >
                            View Branch
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No matching Ohio branches found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0f5f57] dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Globe size={16} />
              <span className="hidden sm:inline">English</span>
            </button>
            <ThemeToggle />
            {user ? (
              <>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void navigatePage("/dashboard", { title: "Dashboard", durationMs: 1000 })}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    await navigatePage("/login?signout=1", { durationMs: 900, message: "Signing out...", title: "Sign On", skeleton: "generic" });
                    await logout();
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void navigatePage("/login", { title: "Sign On", durationMs: 900, message: "Loading sign on...", skeleton: "generic" })}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Sign On
              </button>
            )}
            <Link to="/register" className="rounded-full bg-[#0f5f57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0c4f48]">
              Open an Account
            </Link>
          </div>
        </div>

        {showPromo ? (
          <div className="mb-4 rounded-2xl bg-[#e7f5f0] px-4 py-2 text-sm text-[#0f5f57] dark:bg-[#123c38] dark:text-[#d5ede7]">
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium">New Platinum Rewards Card available with elevated cash-back categories and travel benefits.</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 font-semibold transition hover:bg-white/60 dark:hover:bg-white/10"
                aria-label="Dismiss promotion"
                onClick={() => setShowPromo(false)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
