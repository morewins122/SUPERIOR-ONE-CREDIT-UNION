import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type ToastType = "success" | "info";
type SkeletonVariant = "dashboard" | "checking" | "transactions" | "statements" | "pay-transfer" | "generic";

type NavigateOptions = {
  replace?: boolean;
  durationMs?: number;
  message?: string;
  title?: string;
  skeleton?: SkeletonVariant;
};

type PortalUXContextValue = {
  isLoading: boolean;
  progress: number;
  loadingMessage: string;
  skeleton: SkeletonVariant | null;
  isContentVisible: boolean;
  pageTitle: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  showSkeleton: (variant?: SkeletonVariant) => void;
  hideSkeleton: () => void;
  showToast: (message: string, type?: ToastType) => void;
  navigatePage: (path: string, options?: NavigateOptions) => Promise<void>;
};

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

const PortalUXContext = createContext<PortalUXContextValue | undefined>(undefined);

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/checking": "Checking",
  "/dashboard/savings": "Savings",
  "/dashboard/pay-transfer": "Pay & Transfer",
  "/dashboard/transactions": "Transactions",
  "/dashboard/statements": "Statements",
  "/dashboard/security": "Security",
  "/dashboard/profile": "Profile",
  "/dashboard/loans": "Loans",
  "/dashboard/cards": "Cards",
  "/login": "Sign On"
};

const routeSkeletons: Record<string, SkeletonVariant> = {
  "/dashboard": "dashboard",
  "/dashboard/checking": "checking",
  "/dashboard/savings": "generic",
  "/dashboard/pay-transfer": "pay-transfer",
  "/dashboard/transactions": "transactions",
  "/dashboard/statements": "statements",
  "/dashboard/security": "generic",
  "/dashboard/profile": "generic",
  "/dashboard/loans": "generic",
  "/dashboard/cards": "generic"
};

const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function getRouteTitle(pathname: string) {
  return routeTitles[pathname] ?? "Online Banking";
}

function getRouteSkeleton(pathname: string) {
  return routeSkeletons[pathname] ?? "generic";
}

export function PortalUXProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [skeleton, setSkeleton] = useState<SkeletonVariant | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pageTitle, setPageTitle] = useState(getRouteTitle(location.pathname));
  const toastIdRef = useRef(1);

  useEffect(() => {
    const title = getRouteTitle(location.pathname);
    setPageTitle(title);
    document.title = `${title} | Superior One Credit Union`;
  }, [location.pathname]);

  const showLoader = useCallback((message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
  }, []);

  const showSkeleton = useCallback((variant: SkeletonVariant = "generic") => {
    setSkeleton(variant);
  }, []);

  const hideSkeleton = useCallback(() => {
    setSkeleton(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = toastIdRef.current;
    toastIdRef.current += 1;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const runProgress = useCallback(async (durationMs: number) => {
    const started = Date.now();
    setProgress(0);

    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        const elapsed = Date.now() - started;
        const raw = Math.min(100, Math.round((elapsed / durationMs) * 100));
        setProgress(raw);
        if (raw >= 100) {
          window.clearInterval(timer);
          resolve();
        }
      }, 30);
    });
  }, []);

  const navigatePage = useCallback(
    async (path: string, options?: NavigateOptions) => {
      if (isLoading) {
        return;
      }

      const duration = Math.max(options?.durationMs ?? 1000, 8000);
      const message = options?.message ?? "Loading account details...";
      const targetSkeleton = options?.skeleton ?? getRouteSkeleton(path);

      setIsContentVisible(false);
      await delay(160);

      showLoader(message);
      showSkeleton(targetSkeleton);
      await runProgress(duration);

      navigate(path, { replace: options?.replace ?? false });
      await delay(120);

      hideLoader();
      hideSkeleton();
      setIsContentVisible(true);
    },
    [hideLoader, hideSkeleton, isLoading, navigate, runProgress, showLoader, showSkeleton]
  );

  const value = useMemo(
    () => ({
      isLoading,
      progress,
      loadingMessage,
      skeleton,
      isContentVisible,
      pageTitle,
      showLoader,
      hideLoader,
      showSkeleton,
      hideSkeleton,
      showToast,
      navigatePage
    }),
    [hideLoader, hideSkeleton, isContentVisible, isLoading, loadingMessage, navigatePage, pageTitle, progress, showLoader, showSkeleton, showToast, skeleton]
  );

  useEffect(() => {
    const handleInternalLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || isLoading) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http://") || href.startsWith("https://")) {
        return;
      }

      event.preventDefault();

      const nextUrl = new URL(anchor.href, window.location.origin);
      void navigatePage(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
        title: getRouteTitle(nextUrl.pathname),
        skeleton: getRouteSkeleton(nextUrl.pathname),
        durationMs: 8000,
        message: "Loading..."
      });
    };

    document.addEventListener("click", handleInternalLinkClick, true);

    return () => {
      document.removeEventListener("click", handleInternalLinkClick, true);
    };
  }, [isLoading, navigatePage]);

  return (
    <PortalUXContext.Provider value={value}>
      <div
        className={`fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-[#0D9488] transition-opacity duration-200 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `scaleX(${Math.max(progress, 2) / 100})` }}
      />

      {isLoading ? (
        <div className="pointer-events-none fixed right-4 top-5 z-[101] flex items-center gap-3 rounded-full bg-[#145A5A] px-4 py-2 text-sm font-medium text-white shadow-xl">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          <span>{loadingMessage}</span>
        </div>
      ) : null}

      <div className="fixed right-4 top-16 z-[110] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-[fadeScale_0.24s_ease-out] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
              toast.type === "success" ? "bg-emerald-600" : "bg-[#145A5A]"
            }`}
          >
            {toast.type === "success" ? "✓ " : "ℹ "}
            {toast.message}
          </div>
        ))}
      </div>

      {children}
    </PortalUXContext.Provider>
  );
}

export function usePortalUX() {
  const context = useContext(PortalUXContext);
  if (!context) {
    throw new Error("usePortalUX must be used inside PortalUXProvider");
  }
  return context;
}
